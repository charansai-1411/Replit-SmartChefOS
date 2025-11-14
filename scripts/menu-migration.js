#!/usr/bin/env node

/**
 * Menu Management Migration Script
 * 
 * This script migrates existing dishes to the new enhanced data model:
 * - Converts price to priceMinor (integer minor units)
 * - Adds availability map for platform-specific controls
 * - Normalizes phone numbers to E.164 format
 * - Converts lifetimeValue to lifetimeValueMinor
 * - Removes legacy global platform control documents
 * 
 * Usage: node menu-migration.js [--dry-run] [--collection=dishes]
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

// Get specific collection from command line
const collectionArg = process.argv.find(arg => arg.startsWith('--collection='));
const TARGET_COLLECTION = collectionArg ? collectionArg.split('=')[1] : null;

console.log('🚀 Starting Menu Management migration...');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE MIGRATION'}`);
if (TARGET_COLLECTION) {
  console.log(`Target: ${TARGET_COLLECTION} collection only`);
}

// Utility functions
function normalizePhoneNumber(phone, defaultCountry = DEFAULT_COUNTRY) {
  try {
    if (!phone) return null;
    
    const cleanPhone = phone.toString().replace(/\s+/g, '').trim();
    if (!cleanPhone) return null;
    
    if (cleanPhone.startsWith('+')) {
      if (isValidPhoneNumber(cleanPhone)) {
        return cleanPhone;
      }
      console.warn(`Invalid E.164 phone number: ${cleanPhone}`);
      return null;
    }
    
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

function convertToMinorUnits(value, currency = 'INR') {
  try {
    if (typeof value === 'number') {
      return Math.round(value * 100);
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.warn(`Invalid numeric value: ${value}`);
        return 0;
      }
      return Math.round(numValue * 100);
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error converting value ${value}:`, error.message);
    return 0;
  }
}

function createDefaultAvailability(existingData = {}) {
  // Check if dish was previously available (legacy field)
  const wasAvailable = existingData.available !== false && existingData.isAvailable !== false;
  
  return {
    restaurant: wasAvailable,
    zomato: wasAvailable,
    swiggy: wasAvailable,
    other: wasAvailable
  };
}

// Migration functions
async function migrateDishes() {
  console.log('🔄 Migrating dishes...');
  
  try {
    const dishesSnapshot = await db.collection('dishes').get();
    console.log(`Found ${dishesSnapshot.size} dishes to migrate`);
    
    if (dishesSnapshot.empty) {
      console.log('✅ No dishes to migrate');
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of dishesSnapshot.docs) {
      try {
        const data = doc.data();
        const updates = {};
        let needsUpdate = false;

        // Convert price to priceMinor if needed
        if (data.price !== undefined && data.priceMinor === undefined) {
          updates.priceMinor = convertToMinorUnits(data.price);
          needsUpdate = true;
          console.log(`  Converting price for ${data.name}: ${data.price} → ${updates.priceMinor} minor units`);
        }

        // Add availability map if missing
        if (!data.availability) {
          updates.availability = createDefaultAvailability(data);
          needsUpdate = true;
          console.log(`  Adding availability map for ${data.name}`);
        }

        // Ensure restaurantId exists
        if (!data.restaurantId && data.restaurant_id) {
          updates.restaurantId = data.restaurant_id;
          needsUpdate = true;
        }

        // Add timestamps if missing
        if (!data.createdAt) {
          updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }
        
        if (!data.updatedAt) {
          updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }

        // Ensure images is an array
        if (data.image && !data.images) {
          updates.images = [data.image];
          needsUpdate = true;
        }

        if (needsUpdate) {
          if (!DRY_RUN) {
            batch.update(doc.ref, updates);
            batchCount++;

            // Commit batch when it reaches the limit
            if (batchCount >= BATCH_SIZE) {
              await batch.commit();
              batchCount = 0;
            }
          }
          migrated++;
          console.log(`  ✅ Updated dish: ${data.name} (${doc.id})`);
        }

      } catch (error) {
        console.error(`  ❌ Error migrating dish ${doc.id}:`, error.message);
        errors++;
      }
    }

    // Commit remaining batch
    if (!DRY_RUN && batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Dishes migration complete: ${migrated} migrated, ${errors} errors`);
    return { migrated, errors };

  } catch (error) {
    console.error('❌ Error in dishes migration:', error);
    return { migrated: 0, errors: 1 };
  }
}

async function migrateCustomers() {
  console.log('🔄 Migrating customers...');
  
  try {
    const customersSnapshot = await db.collection('customers').get();
    console.log(`Found ${customersSnapshot.size} customers to migrate`);
    
    if (customersSnapshot.empty) {
      console.log('✅ No customers to migrate');
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of customersSnapshot.docs) {
      try {
        const data = doc.data();
        const updates = {};
        let needsUpdate = false;

        // Normalize phone number
        if (data.phone && !data.phone.startsWith('+')) {
          const normalizedPhone = normalizePhoneNumber(data.phone);
          if (normalizedPhone) {
            updates.phone = normalizedPhone;
            needsUpdate = true;
            console.log(`  Normalizing phone for ${data.name}: ${data.phone} → ${normalizedPhone}`);
          }
        }

        // Convert lifetimeValue to lifetimeValueMinor
        if (data.lifetimeValue !== undefined && data.lifetimeValueMinor === undefined) {
          updates.lifetimeValueMinor = convertToMinorUnits(data.lifetimeValue);
          needsUpdate = true;
          console.log(`  Converting lifetime value for ${data.name}: ${data.lifetimeValue} → ${updates.lifetimeValueMinor} minor units`);
        }

        // Add timestamps if missing
        if (!data.createdAt) {
          updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }
        
        if (!data.updatedAt) {
          updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }

        if (needsUpdate) {
          if (!DRY_RUN) {
            batch.update(doc.ref, updates);
            batchCount++;

            if (batchCount >= BATCH_SIZE) {
              await batch.commit();
              batchCount = 0;
            }
          }
          migrated++;
          console.log(`  ✅ Updated customer: ${data.name} (${doc.id})`);
        }

      } catch (error) {
        console.error(`  ❌ Error migrating customer ${doc.id}:`, error.message);
        errors++;
      }
    }

    // Commit remaining batch
    if (!DRY_RUN && batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Customers migration complete: ${migrated} migrated, ${errors} errors`);
    return { migrated, errors };

  } catch (error) {
    console.error('❌ Error in customers migration:', error);
    return { migrated: 0, errors: 1 };
  }
}

async function migrateOrders() {
  console.log('🔄 Migrating orders...');
  
  try {
    const ordersSnapshot = await db.collection('orders').get();
    console.log(`Found ${ordersSnapshot.size} orders to migrate`);
    
    if (ordersSnapshot.empty) {
      console.log('✅ No orders to migrate');
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of ordersSnapshot.docs) {
      try {
        const data = doc.data();
        const updates = {};
        let needsUpdate = false;

        // Convert monetary fields to minor units
        const monetaryFields = ['itemsTotal', 'taxTotal', 'discountTotal', 'grandTotal', 'total'];
        for (const field of monetaryFields) {
          if (data[field] !== undefined && data[`${field}Minor`] === undefined) {
            updates[`${field}Minor`] = convertToMinorUnits(data[field]);
            needsUpdate = true;
          }
        }

        // Add timestamps if missing
        if (!data.createdAt) {
          updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }
        
        if (!data.updatedAt) {
          updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          needsUpdate = true;
        }

        if (needsUpdate) {
          if (!DRY_RUN) {
            batch.update(doc.ref, updates);
            batchCount++;

            if (batchCount >= BATCH_SIZE) {
              await batch.commit();
              batchCount = 0;
            }
          }
          migrated++;
          console.log(`  ✅ Updated order: ${doc.id}`);
        }

      } catch (error) {
        console.error(`  ❌ Error migrating order ${doc.id}:`, error.message);
        errors++;
      }
    }

    // Commit remaining batch
    if (!DRY_RUN && batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Orders migration complete: ${migrated} migrated, ${errors} errors`);
    return { migrated, errors };

  } catch (error) {
    console.error('❌ Error in orders migration:', error);
    return { migrated: 0, errors: 1 };
  }
}

async function removeLegacyDocuments() {
  console.log('🔄 Removing legacy platform control documents...');
  
  try {
    let removed = 0;

    // Remove any global platform control documents
    const legacyCollections = ['platformSettings', 'globalSettings', 'menuSettings'];
    
    for (const collectionName of legacyCollections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        if (!snapshot.empty) {
          console.log(`Found ${snapshot.size} documents in ${collectionName} to remove`);
          
          if (!DRY_RUN) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
          
          removed += snapshot.size;
          console.log(`  ✅ Removed ${snapshot.size} documents from ${collectionName}`);
        }
      } catch (error) {
        console.warn(`  ⚠️  Could not access collection ${collectionName}:`, error.message);
      }
    }

    console.log(`✅ Legacy cleanup complete: ${removed} documents removed`);
    return { removed };

  } catch (error) {
    console.error('❌ Error in legacy cleanup:', error);
    return { removed: 0 };
  }
}

// Main migration function
async function runMigration() {
  const startTime = Date.now();
  const results = {
    dishes: { migrated: 0, errors: 0 },
    customers: { migrated: 0, errors: 0 },
    orders: { migrated: 0, errors: 0 },
    legacy: { removed: 0 }
  };

  try {
    if (!TARGET_COLLECTION || TARGET_COLLECTION === 'dishes') {
      results.dishes = await migrateDishes();
    }

    if (!TARGET_COLLECTION || TARGET_COLLECTION === 'customers') {
      results.customers = await migrateCustomers();
    }

    if (!TARGET_COLLECTION || TARGET_COLLECTION === 'orders') {
      results.orders = await migrateOrders();
    }

    if (!TARGET_COLLECTION) {
      results.legacy = await removeLegacyDocuments();
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`\n🎉 Migration completed in ${duration.toFixed(3)}s`);
  console.log('\n📊 Summary:');
  console.log(`  Dishes: ${results.dishes.migrated} migrated, ${results.dishes.errors} errors`);
  console.log(`  Customers: ${results.customers.migrated} migrated, ${results.customers.errors} errors`);
  console.log(`  Orders: ${results.orders.migrated} migrated, ${results.orders.errors} errors`);
  console.log(`  Legacy docs removed: ${results.legacy.removed}`);

  const totalMigrated = results.dishes.migrated + results.customers.migrated + results.orders.migrated;
  const totalErrors = results.dishes.errors + results.customers.errors + results.orders.errors;

  if (totalErrors > 0) {
    console.log(`\n⚠️  Migration completed with ${totalErrors} errors. Please review the logs.`);
    process.exit(1);
  } else {
    console.log(`\n✅ Migration successful! ${totalMigrated} documents updated.`);
  }
}

// Run migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
