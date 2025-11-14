#!/usr/bin/env node

/**
 * Import Seed Data Script
 * 
 * This script imports the sample seed data into Firestore for testing and development.
 * 
 * Usage: node import-seed-data.js [--overwrite]
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

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

// Configuration
const OVERWRITE = process.argv.includes('--overwrite');
const SEED_DATA_PATH = path.join(__dirname, 'seed-data.json');

async function importCollection(collectionName, data) {
  console.log(`📥 Importing ${collectionName}...`);
  
  const collectionRef = db.collection(collectionName);
  let imported = 0;
  let skipped = 0;
  
  for (const [docId, docData] of Object.entries(data)) {
    try {
      const docRef = collectionRef.doc(docId);
      
      if (!OVERWRITE) {
        const existingDoc = await docRef.get();
        if (existingDoc.exists) {
          console.log(`  ⏭️  Skipping ${docId} (already exists)`);
          skipped++;
          continue;
        }
      }
      
      // Convert timestamp objects to Firestore timestamps
      const processedData = processTimestamps(docData);
      
      await docRef.set(processedData);
      console.log(`  ✅ Imported ${docId}`);
      imported++;
      
    } catch (error) {
      console.error(`  ❌ Error importing ${docId}:`, error.message);
    }
  }
  
  console.log(`📊 ${collectionName}: ${imported} imported, ${skipped} skipped\n`);
}

function processTimestamps(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(processTimestamps);
  }
  
  const processed = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && value._seconds) {
      // Convert timestamp object to Firestore Timestamp
      processed[key] = admin.firestore.Timestamp.fromDate(new Date(value._seconds * 1000));
    } else if (key === 'createdAt' || key === 'updatedAt') {
      // Use server timestamp for these fields if not already set
      processed[key] = value ? processTimestamps(value) : admin.firestore.FieldValue.serverTimestamp();
    } else {
      processed[key] = processTimestamps(value);
    }
  }
  
  return processed;
}

async function importSeedData() {
  console.log('🚀 Starting seed data import...');
  console.log(`Mode: ${OVERWRITE ? 'OVERWRITE' : 'SKIP EXISTING'}\n`);
  
  try {
    // Load seed data
    const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
    
    // Import collections in dependency order
    const importOrder = [
      'restaurantOwners',
      'restaurants', 
      'ingredients',
      'customers',
      'tables',
      'dishes',
      'orders',
      'orderItems'
    ];
    
    for (const collectionName of importOrder) {
      if (seedData[collectionName]) {
        await importCollection(collectionName, seedData[collectionName]);
      }
    }
    
    console.log('🎉 Seed data import completed successfully!');
    
    // Print summary
    console.log('\n📈 Summary:');
    for (const collectionName of importOrder) {
      if (seedData[collectionName]) {
        const count = Object.keys(seedData[collectionName]).length;
        console.log(`  ${collectionName}: ${count} documents`);
      }
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

async function clearAllData() {
  console.log('🗑️  Clearing all existing data...');
  
  const collections = [
    'orderItems',
    'orders',
    'dishes',
    'tables',
    'customers',
    'ingredients',
    'restaurants',
    'restaurantOwners'
  ];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`  ⏭️  ${collectionName} is already empty`);
        continue;
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`  🗑️  Cleared ${snapshot.size} documents from ${collectionName}`);
      
    } catch (error) {
      console.error(`  ❌ Error clearing ${collectionName}:`, error.message);
    }
  }
  
  console.log('✅ Data clearing completed\n');
}

// CLI handling
if (require.main === module) {
  const shouldClear = process.argv.includes('--clear');
  
  if (shouldClear) {
    clearAllData()
      .then(() => importSeedData())
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  } else {
    importSeedData()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  importSeedData,
  clearAllData,
  processTimestamps
};
