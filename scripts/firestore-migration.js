#!/usr/bin/env node

/**
 * Firestore Migration Script
 * 
 * This script migrates data from Firebase Realtime Database to Firestore
 * and fixes critical data type issues:
 * 
 * 1. Convert lifetimeValue from string to number (in minor units)
 * 2. Normalize phone numbers to E.164 format
 * 3. Add proper timestamps (createdAt, updatedAt)
 * 4. Ensure proper data structure and relationships
 * 
 * Usage: node firestore-migration.js [--dry-run] [--collection=customers]
 */

const admin = require('firebase-admin');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

// Load environment variables from parent directory
require('dotenv').config({ path: '../.env' });

// Initialize Firebase Admin
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Use environment variable (JSON string)
  credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // Use individual environment variables from .env file
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  });
} else {
  try {
    // Try to load from file
    const serviceAccount = require('../service-account-key.json');
    credential = admin.credential.cert(serviceAccount);
  } catch (error) {
    console.error('❌ Firebase service account key not found!');
    console.error('Please either:');
    console.error('1. Download service-account-key.json from Firebase Console and place it in the root directory');
    console.error('2. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable with the JSON content');
    console.error('3. Ensure .env file has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: credential,
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://chef-3ab57-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
const rtdb = admin.database();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;
const DEFAULT_COUNTRY = 'IN';

// Helper functions
function normalizePhoneNumber(phone, defaultCountry = DEFAULT_COUNTRY) {
  try {
    if (!phone) return null;
    
    // Clean the phone number
    const cleanPhone = phone.toString().replace(/\s+/g, '').trim();
    
    if (!cleanPhone) return null;
    
    // If already in E.164 format, validate and return
    if (cleanPhone.startsWith('+')) {
      if (isValidPhoneNumber(cleanPhone)) {
        return cleanPhone;
      }
      console.warn(`Invalid E.164 phone number: ${cleanPhone}`);
      return null;
    }
    
    // Parse with default country
    const phoneNumber = parsePhoneNumber(cleanPhone, defaultCountry);
    if (!phoneNumber || !phoneNumber.isValid()) {
      console.warn(`Invalid phone number: ${cleanPhone}`);
      return null;
    }
    
    return phoneNumber.format('E.164');
  } catch (error) {
    console.warn(`Error normalizing phone number ${phone}:`, error.message);
    return null;
  }
}

function convertLifetimeValueToMinorUnits(value, currency = 'INR') {
  try {
    if (typeof value === 'number') {
      // Already a number, convert to minor units
      return Math.round(value * 100);
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.warn(`Invalid lifetime value: ${value}`);
        return 0;
      }
      return Math.round(numValue * 100);
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error converting lifetime value ${value}:`, error.message);
    return 0;
  }
}

function convertPriceToMinorUnits(price, currency = 'INR') {
  try {
    if (typeof price === 'number') {
      return Math.round(price * 100);
    }
    
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        console.warn(`Invalid price: ${price}`);
        return 0;
      }
      return Math.round(numPrice * 100);
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error converting price ${price}:`, error.message);
    return 0;
  }
}

// Migration functions
async function migrateCustomers() {
  console.log('🔄 Migrating customers...');
  
  try {
    // Get all customers from RTDB
    const customersSnapshot = await rtdb.ref('customers').once('value');
    const customers = customersSnapshot.val() || {};
    
    const customerIds = Object.keys(customers);
    console.log(`Found ${customerIds.length} customers to migrate`);
    
    let migrated = 0;
    let errors = 0;
    
    // Process in batches
    for (let i = 0; i < customerIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchIds = customerIds.slice(i, i + BATCH_SIZE);
      
      for (const customerId of batchIds) {
        const customer = customers[customerId];
        
        try {
          // Normalize phone number
          const normalizedPhone = normalizePhoneNumber(customer.phone);
          
          // Convert lifetime value to minor units
          const lifetimeValue = convertLifetimeValueToMinorUnits(customer.lifetimeValue || 0);
          
          // Prepare migrated data
          const migratedCustomer = {
            restaurantId: customer.restaurantId || customer.ownerId, // Use ownerId as fallback
            ownerId: customer.ownerId,
            name: customer.name || '',
            phone: normalizedPhone,
            email: customer.email || null,
            tags: customer.tags || [],
            lifetimeValue: lifetimeValue,
            lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          // Validate required fields
          if (!migratedCustomer.restaurantId || !migratedCustomer.name) {
            console.warn(`Skipping customer ${customerId}: missing required fields`);
            continue;
          }
          
          if (!DRY_RUN) {
            const customerRef = db.collection('customers').doc(customerId);
            batch.set(customerRef, migratedCustomer);
          }
          
          migrated++;
          
        } catch (error) {
          console.error(`Error processing customer ${customerId}:`, error.message);
          errors++;
        }
      }
      
      if (!DRY_RUN && batchIds.length > 0) {
        await batch.commit();
        console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(customerIds.length / BATCH_SIZE)}`);
      }
    }
    
    console.log(`✅ Customers migration complete: ${migrated} migrated, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error migrating customers:', error);
  }
}

async function migrateDishes() {
  console.log('🔄 Migrating dishes...');
  
  try {
    const dishesSnapshot = await rtdb.ref('dishes').once('value');
    const dishes = dishesSnapshot.val() || {};
    
    const dishIds = Object.keys(dishes);
    console.log(`Found ${dishIds.length} dishes to migrate`);
    
    let migrated = 0;
    let errors = 0;
    
    for (let i = 0; i < dishIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchIds = dishIds.slice(i, i + BATCH_SIZE);
      
      for (const dishId of batchIds) {
        const dish = dishes[dishId];
        
        try {
          // Convert price to minor units
          const price = convertPriceToMinorUnits(dish.price || 0);
          
          const migratedDish = {
            restaurantId: dish.restaurantId || dish.ownerId,
            name: dish.name || '',
            description: dish.description || '',
            sku: dish.sku || null,
            price: price,
            isAvailable: dish.isAvailable !== false, // Default to true
            categories: dish.categories || [],
            ingredientIds: dish.ingredientIds || [],
            // Platform availability from the enhanced menu system
            platformAvailability: dish.platformAvailability || {
              restaurant: { isAvailable: true, offlineUntil: null },
              zomato: { isAvailable: true, offlineUntil: null },
              swiggy: { isAvailable: true, offlineUntil: null },
              other: { isAvailable: true, offlineUntil: null }
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          if (!migratedDish.restaurantId || !migratedDish.name) {
            console.warn(`Skipping dish ${dishId}: missing required fields`);
            continue;
          }
          
          if (!DRY_RUN) {
            const dishRef = db.collection('dishes').doc(dishId);
            batch.set(dishRef, migratedDish);
          }
          
          migrated++;
          
        } catch (error) {
          console.error(`Error processing dish ${dishId}:`, error.message);
          errors++;
        }
      }
      
      if (!DRY_RUN && batchIds.length > 0) {
        await batch.commit();
        console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(dishIds.length / BATCH_SIZE)}`);
      }
    }
    
    console.log(`✅ Dishes migration complete: ${migrated} migrated, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error migrating dishes:', error);
  }
}

async function migrateOrders() {
  console.log('🔄 Migrating orders...');
  
  try {
    const ordersSnapshot = await rtdb.ref('orders').once('value');
    const orders = ordersSnapshot.val() || {};
    
    const orderIds = Object.keys(orders);
    console.log(`Found ${orderIds.length} orders to migrate`);
    
    let migrated = 0;
    let errors = 0;
    
    for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchIds = orderIds.slice(i, i + BATCH_SIZE);
      
      for (const orderId of batchIds) {
        const order = orders[orderId];
        
        try {
          // Convert monetary values to minor units
          const itemsTotal = convertPriceToMinorUnits(order.itemsTotal || 0);
          const taxTotal = convertPriceToMinorUnits(order.taxTotal || 0);
          const discountTotal = convertPriceToMinorUnits(order.discountTotal || 0);
          const grandTotal = convertPriceToMinorUnits(order.grandTotal || 0);
          
          const migratedOrder = {
            restaurantId: order.restaurantId || order.ownerId,
            customerId: order.customerId || null,
            ownerId: order.ownerId,
            tableId: order.tableId || null,
            status: order.status || 'open',
            itemsTotal: itemsTotal,
            taxTotal: taxTotal,
            discountTotal: discountTotal,
            grandTotal: grandTotal,
            paymentMethod: order.paymentMethod || 'cash',
            createdAt: order.createdAt ? new Date(order.createdAt) : admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          if (!migratedOrder.restaurantId) {
            console.warn(`Skipping order ${orderId}: missing restaurantId`);
            continue;
          }
          
          if (!DRY_RUN) {
            const orderRef = db.collection('orders').doc(orderId);
            batch.set(orderRef, migratedOrder);
          }
          
          migrated++;
          
        } catch (error) {
          console.error(`Error processing order ${orderId}:`, error.message);
          errors++;
        }
      }
      
      if (!DRY_RUN && batchIds.length > 0) {
        await batch.commit();
        console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(orderIds.length / BATCH_SIZE)}`);
      }
    }
    
    console.log(`✅ Orders migration complete: ${migrated} migrated, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error migrating orders:', error);
  }
}

async function migrateRestaurants() {
  console.log('🔄 Migrating restaurants...');
  
  try {
    const restaurantsSnapshot = await rtdb.ref('restaurants').once('value');
    const restaurants = restaurantsSnapshot.val() || {};
    
    const restaurantIds = Object.keys(restaurants);
    console.log(`Found ${restaurantIds.length} restaurants to migrate`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const restaurantId of restaurantIds) {
      const restaurant = restaurants[restaurantId];
      
      try {
        // Normalize phone number
        const normalizedPhone = normalizePhoneNumber(restaurant.phone);
        
        const migratedRestaurant = {
          name: restaurant.name || '',
          ownerId: restaurant.ownerId,
          address: restaurant.address || '',
          phone: normalizedPhone,
          timezone: restaurant.timezone || 'Asia/Kolkata',
          country: restaurant.country || 'IN',
          currency: restaurant.currency || 'INR',
          createdAt: restaurant.createdAt ? new Date(restaurant.createdAt) : admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (!migratedRestaurant.name || !migratedRestaurant.ownerId) {
          console.warn(`Skipping restaurant ${restaurantId}: missing required fields`);
          continue;
        }
        
        if (!DRY_RUN) {
          await db.collection('restaurants').doc(restaurantId).set(migratedRestaurant);
        }
        
        migrated++;
        
      } catch (error) {
        console.error(`Error processing restaurant ${restaurantId}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Restaurants migration complete: ${migrated} migrated, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error migrating restaurants:', error);
  }
}

// Validation functions
async function validateMigration() {
  console.log('🔍 Validating migration...');
  
  try {
    // Check customers
    const customersSnapshot = await db.collection('customers').limit(10).get();
    console.log(`Sample customers migrated: ${customersSnapshot.size}`);
    
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      if (typeof data.lifetimeValue !== 'number') {
        console.warn(`Customer ${doc.id} has invalid lifetimeValue type: ${typeof data.lifetimeValue}`);
      }
      if (data.phone && !data.phone.startsWith('+')) {
        console.warn(`Customer ${doc.id} has invalid phone format: ${data.phone}`);
      }
    });
    
    // Check dishes
    const dishesSnapshot = await db.collection('dishes').limit(10).get();
    console.log(`Sample dishes migrated: ${dishesSnapshot.size}`);
    
    dishesSnapshot.forEach(doc => {
      const data = doc.data();
      if (typeof data.price !== 'number') {
        console.warn(`Dish ${doc.id} has invalid price type: ${typeof data.price}`);
      }
    });
    
    console.log('✅ Validation complete');
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firestore migration...');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  
  const startTime = Date.now();
  
  try {
    // Run migrations in order
    await migrateRestaurants();
    await migrateCustomers();
    await migrateDishes();
    await migrateOrders();
    
    if (!DRY_RUN) {
      await validateMigration();
    }
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`🎉 Migration completed in ${duration}s`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const collection = process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1];
  
  if (collection) {
    switch (collection) {
      case 'customers':
        migrateCustomers().then(() => process.exit(0));
        break;
      case 'dishes':
        migrateDishes().then(() => process.exit(0));
        break;
      case 'orders':
        migrateOrders().then(() => process.exit(0));
        break;
      case 'restaurants':
        migrateRestaurants().then(() => process.exit(0));
        break;
      default:
        console.error('Invalid collection. Use: customers, dishes, orders, restaurants');
        process.exit(1);
    }
  } else {
    runMigration().then(() => process.exit(0));
  }
}

module.exports = {
  migrateCustomers,
  migrateDishes,
  migrateOrders,
  migrateRestaurants,
  validateMigration,
  normalizePhoneNumber,
  convertLifetimeValueToMinorUnits,
  convertPriceToMinorUnits
};
