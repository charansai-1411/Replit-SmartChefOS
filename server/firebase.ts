import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

// Initialize Firebase Admin with Firestore
export function initializeFirebase(): Firestore {
  if (getApps().length === 0) {
    // For development: Use environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // For local development with emulator
      app = initializeApp({
        projectId: 'demo-smartchef',
      });
    }
    
    db = getFirestore(app);
    
    // Set Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });
    
    console.log('Firebase Firestore initialized');
  } else {
    db = getFirestore();
  }
  
  return db;
}

export { db, Timestamp };
