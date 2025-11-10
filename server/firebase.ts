import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

let app: App;
let db: Database;

// Initialize Firebase Admin with Realtime Database
export function initializeFirebase(): Database {
  if (getApps().length === 0) {
    // For development: Use environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      });
    } else {
      // For local development with emulator
      app = initializeApp({
        projectId: 'demo-smartchef',
        databaseURL: 'http://localhost:9000?ns=demo-smartchef',
      });
    }
    
    db = getDatabase(app);
    
    console.log('Firebase Realtime Database initialized');
  } else {
    db = getDatabase();
  }
  
  return db;
}

export { db };
