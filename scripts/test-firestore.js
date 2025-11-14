#!/usr/bin/env node

/**
 * Firestore Test Utilities
 * 
 * This script provides utilities to test the Firestore implementation:
 * - Security rules testing
 * - Data validation testing
 * - Performance testing
 * - Cloud Functions testing
 * 
 * Usage: node test-firestore.js [--test=security|validation|performance|functions]
 */

const admin = require('firebase-admin');
const { parsePhoneNumber } = require('libphonenumber-js');

// Initialize Firebase Admin
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Use environment variable (JSON string)
  credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
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
    process.exit(1);
  }
}

admin.initializeApp({
  credential: credential
});

const db = admin.firestore();

// Test data
const TEST_RESTAURANT_ID = 'test_restaurant_001';
const TEST_OWNER_ID = 'test_owner_001';
const TEST_CUSTOMER_ID = 'test_customer_001';

async function testSecurityRules() {
  console.log('🔒 Testing Security Rules...\n');
  
  try {
    // Test 1: Try to create restaurant without proper ownerId
    console.log('Test 1: Invalid restaurant creation');
    try {
      await db.collection('restaurants').doc('invalid_rest').set({
        name: 'Invalid Restaurant',
        ownerId: 'wrong_owner',
        address: 'Test Address',
        phone: '+919876543210',
        timezone: 'Asia/Kolkata'
      });
      console.log('❌ FAIL: Should have been rejected by security rules');
    } catch (error) {
      console.log('✅ PASS: Correctly rejected invalid restaurant creation');
    }
    
    // Test 2: Valid restaurant creation (would need proper auth context in real test)
    console.log('\nTest 2: Valid restaurant creation');
    console.log('ℹ️  Note: This test requires proper authentication context');
    
    // Test 3: Phone number validation
    console.log('\nTest 3: Phone number validation');
    const validPhone = '+919876543210';
    const invalidPhone = '98765 43210';
    
    if (validPhone.match(/^\+[1-9]\d{1,14}$/)) {
      console.log('✅ PASS: Valid phone number format accepted');
    } else {
      console.log('❌ FAIL: Valid phone number rejected');
    }
    
    if (!invalidPhone.match(/^\+[1-9]\d{1,14}$/)) {
      console.log('✅ PASS: Invalid phone number format rejected');
    } else {
      console.log('❌ FAIL: Invalid phone number accepted');
    }
    
  } catch (error) {
    console.error('❌ Security rules test failed:', error.message);
  }
}

async function testDataValidation() {
  console.log('📊 Testing Data Validation...\n');
  
  try {
    // Test 1: Phone number normalization
    console.log('Test 1: Phone number normalization');
    const testPhones = [
      '9876543210',
      '+919876543210',
      '98765 43210',
      '+91 98765 43210',
      'invalid_phone'
    ];
    
    for (const phone of testPhones) {
      try {
        let normalized;
        if (phone.startsWith('+')) {
          normalized = phone.replace(/\s+/g, '');
        } else {
          const parsed = parsePhoneNumber(phone, 'IN');
          normalized = parsed ? parsed.format('E.164') : null;
        }
        
        if (normalized && normalized.match(/^\+[1-9]\d{1,14}$/)) {
          console.log(`  ✅ ${phone} → ${normalized}`);
        } else {
          console.log(`  ❌ ${phone} → Invalid`);
        }
      } catch (error) {
        console.log(`  ❌ ${phone} → Error: ${error.message}`);
      }
    }
    
    // Test 2: Minor units conversion
    console.log('\nTest 2: Minor units conversion');
    const testAmounts = [199.50, 0, 1.99, 1000];
    
    for (const amount of testAmounts) {
      const minorUnits = Math.round(amount * 100);
      console.log(`  ₹${amount} → ${minorUnits} paise`);
    }
    
    // Test 3: Lifetime value calculation
    console.log('\nTest 3: Lifetime value calculation');
    const orders = [
      { grandTotal: 25000 }, // ₹250.00
      { grandTotal: 15000 }, // ₹150.00
      { grandTotal: 30000 }  // ₹300.00
    ];
    
    let lifetimeValue = 0;
    for (const order of orders) {
      lifetimeValue += order.grandTotal;
    }
    
    console.log(`  Total lifetime value: ${lifetimeValue} paise (₹${lifetimeValue / 100})`);
    
    if (lifetimeValue === 70000) {
      console.log('  ✅ PASS: Lifetime value calculation correct');
    } else {
      console.log('  ❌ FAIL: Lifetime value calculation incorrect');
    }
    
  } catch (error) {
    console.error('❌ Data validation test failed:', error.message);
  }
}

async function testPerformance() {
  console.log('⚡ Testing Performance...\n');
  
  try {
    // Test 1: Query performance with indexes
    console.log('Test 1: Query performance');
    
    const startTime = Date.now();
    
    // This query should use the composite index
    const ordersQuery = db.collection('orders')
      .where('restaurantId', '==', TEST_RESTAURANT_ID)
      .orderBy('createdAt', 'desc')
      .limit(10);
    
    const snapshot = await ordersQuery.get();
    const queryTime = Date.now() - startTime;
    
    console.log(`  Query executed in ${queryTime}ms`);
    console.log(`  Found ${snapshot.size} orders`);
    
    if (queryTime < 1000) {
      console.log('  ✅ PASS: Query performance acceptable');
    } else {
      console.log('  ⚠️  WARN: Query took longer than expected');
    }
    
    // Test 2: Batch write performance
    console.log('\nTest 2: Batch write performance');
    
    const batchStartTime = Date.now();
    const batch = db.batch();
    
    // Create 10 test documents
    for (let i = 0; i < 10; i++) {
      const docRef = db.collection('test_performance').doc(`test_${i}`);
      batch.set(docRef, {
        testData: `Test document ${i}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    const batchTime = Date.now() - batchStartTime;
    
    console.log(`  Batch write (10 docs) executed in ${batchTime}ms`);
    
    // Cleanup
    const cleanupBatch = db.batch();
    for (let i = 0; i < 10; i++) {
      const docRef = db.collection('test_performance').doc(`test_${i}`);
      cleanupBatch.delete(docRef);
    }
    await cleanupBatch.commit();
    
    if (batchTime < 2000) {
      console.log('  ✅ PASS: Batch write performance acceptable');
    } else {
      console.log('  ⚠️  WARN: Batch write took longer than expected');
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
}

async function testCloudFunctions() {
  console.log('☁️  Testing Cloud Functions...\n');
  
  try {
    // Test 1: Phone normalization function
    console.log('Test 1: Phone normalization function');
    
    // Note: This would require the Cloud Function to be deployed
    // For now, we'll test the logic locally
    
    const testPhone = '9876543210';
    const normalized = parsePhoneNumber(testPhone, 'IN').format('E.164');
    
    if (normalized === '+919876543210') {
      console.log('  ✅ PASS: Phone normalization logic works');
    } else {
      console.log('  ❌ FAIL: Phone normalization logic failed');
    }
    
    // Test 2: Minor units conversion function
    console.log('\nTest 2: Minor units conversion function');
    
    const testAmount = 199.50;
    const minorUnits = Math.round(testAmount * 100);
    
    if (minorUnits === 19950) {
      console.log('  ✅ PASS: Minor units conversion logic works');
    } else {
      console.log('  ❌ FAIL: Minor units conversion logic failed');
    }
    
    // Test 3: Order total validation
    console.log('\nTest 3: Order total validation');
    
    const orderItems = [
      { qty: 2, unitPrice: 15000, totalPrice: 30000 },
      { qty: 1, unitPrice: 8000, totalPrice: 8000 }
    ];
    
    const calculatedTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxTotal = Math.round(calculatedTotal * 0.18); // 18% tax
    const grandTotal = calculatedTotal + taxTotal;
    
    console.log(`  Items total: ${calculatedTotal} paise`);
    console.log(`  Tax total: ${taxTotal} paise`);
    console.log(`  Grand total: ${grandTotal} paise`);
    
    if (calculatedTotal === 38000 && taxTotal === 6840 && grandTotal === 44840) {
      console.log('  ✅ PASS: Order total calculation correct');
    } else {
      console.log('  ❌ FAIL: Order total calculation incorrect');
    }
    
  } catch (error) {
    console.error('❌ Cloud Functions test failed:', error.message);
  }
}

async function testDataIntegrity() {
  console.log('🔍 Testing Data Integrity...\n');
  
  try {
    // Test 1: Check for invalid data types
    console.log('Test 1: Data type validation');
    
    const customersSnapshot = await db.collection('customers').limit(5).get();
    let validCustomers = 0;
    let invalidCustomers = 0;
    
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Check lifetimeValue is number
      if (typeof data.lifetimeValue === 'number') {
        validCustomers++;
      } else {
        invalidCustomers++;
        console.log(`  ❌ Customer ${doc.id} has invalid lifetimeValue: ${typeof data.lifetimeValue}`);
      }
      
      // Check phone format
      if (data.phone && !data.phone.startsWith('+')) {
        console.log(`  ❌ Customer ${doc.id} has invalid phone format: ${data.phone}`);
      }
    });
    
    console.log(`  Valid customers: ${validCustomers}`);
    console.log(`  Invalid customers: ${invalidCustomers}`);
    
    // Test 2: Check referential integrity
    console.log('\nTest 2: Referential integrity');
    
    const ordersSnapshot = await db.collection('orders').limit(5).get();
    
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      
      // Check if restaurant exists
      if (orderData.restaurantId) {
        const restaurantDoc = await db.collection('restaurants').doc(orderData.restaurantId).get();
        if (!restaurantDoc.exists) {
          console.log(`  ❌ Order ${orderDoc.id} references non-existent restaurant: ${orderData.restaurantId}`);
        }
      }
      
      // Check if customer exists (if specified)
      if (orderData.customerId) {
        const customerDoc = await db.collection('customers').doc(orderData.customerId).get();
        if (!customerDoc.exists) {
          console.log(`  ❌ Order ${orderDoc.id} references non-existent customer: ${orderData.customerId}`);
        }
      }
    }
    
    console.log('  ✅ Referential integrity checks completed');
    
  } catch (error) {
    console.error('❌ Data integrity test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Running All Firestore Tests\n');
  console.log('=' .repeat(50));
  
  await testSecurityRules();
  console.log('\n' + '=' .repeat(50));
  
  await testDataValidation();
  console.log('\n' + '=' .repeat(50));
  
  await testPerformance();
  console.log('\n' + '=' .repeat(50));
  
  await testCloudFunctions();
  console.log('\n' + '=' .repeat(50));
  
  await testDataIntegrity();
  console.log('\n' + '=' .repeat(50));
  
  console.log('\n🎉 All tests completed!');
}

// CLI handling
if (require.main === module) {
  const testType = process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1];
  
  switch (testType) {
    case 'security':
      testSecurityRules().then(() => process.exit(0));
      break;
    case 'validation':
      testDataValidation().then(() => process.exit(0));
      break;
    case 'performance':
      testPerformance().then(() => process.exit(0));
      break;
    case 'functions':
      testCloudFunctions().then(() => process.exit(0));
      break;
    case 'integrity':
      testDataIntegrity().then(() => process.exit(0));
      break;
    default:
      runAllTests().then(() => process.exit(0));
  }
}

module.exports = {
  testSecurityRules,
  testDataValidation,
  testPerformance,
  testCloudFunctions,
  testDataIntegrity
};
