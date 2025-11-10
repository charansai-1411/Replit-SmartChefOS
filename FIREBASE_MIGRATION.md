# Firebase Migration Guide

This project has been migrated from PostgreSQL/Drizzle ORM to Firebase Firestore.

## What Changed

### Database Layer
- **Before**: PostgreSQL with Drizzle ORM
- **After**: Firebase Firestore with Firebase Admin SDK

### Key Files Modified
1. **`server/firebase.ts`** - New Firebase initialization
2. **`server/db.ts`** - Updated to use Firebase instead of Drizzle
3. **`server/storage.ts`** - Completely rewritten for Firestore operations
4. **`shared/schema.ts`** - Replaced Drizzle schemas with TypeScript interfaces and Zod schemas
5. **`server/seed-firebase.ts`** - New seed script for Firebase
6. **`package.json`** - Added Firebase dependencies, updated scripts

### Files No Longer Needed
- `drizzle.config.ts` - Drizzle configuration (can be deleted)
- `server/seed.ts` - Old PostgreSQL seed script (can be deleted)
- `migrations/` folder - Drizzle migrations (can be deleted)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `firebase` (v11.0.2)
- `firebase-admin` (v13.6.0)

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to **Build > Firestore Database**
   - Click **Create database**
   - Choose **Start in production mode** or **Test mode**
   - Select a location

### 3. Get Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **Generate new private key**
4. Save the JSON file securely

### 4. Configure Environment Variables

Create a `.env` file in the project root with the following:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Copy values from the downloaded JSON file
- The private key must include `\n` for line breaks
- Wrap the private key in quotes

### 5. Seed the Database

Run the seed script to populate initial data:

```bash
npm run seed
```

This will create:
- 8 dishes
- 5 customers
- 17 tables across 5 sections
- 20 ingredients
- 9 sample orders with items

### 6. Start the Application

```bash
npm run dev
```

## Firestore Collections

The following collections are used:

| Collection | Description |
|------------|-------------|
| `dishes` | Menu items with prices and categories |
| `orders` | Customer orders with status tracking |
| `orderItems` | Individual items within orders |
| `customers` | Customer information and history |
| `tables` | Restaurant table management |
| `ingredients` | Inventory ingredients |
| `dishIngredients` | Mapping between dishes and ingredients |

## Local Development with Emulator (Optional)

To use Firebase Emulator for local development:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase Emulators:
```bash
firebase init emulators
```

3. Add to `.env`:
```env
FIRESTORE_EMULATOR_HOST=localhost:8080
```

4. Start emulators:
```bash
firebase emulators:start
```

## Key Differences from PostgreSQL

### 1. No Auto-Incrementing IDs
- Firestore generates document IDs automatically
- IDs are strings, not integers

### 2. No SQL Joins
- Replaced with multiple queries and Promise.all()
- Example: `getKOTOrders()` fetches orders, then items, then dishes

### 3. Timestamp Handling
- Use `Timestamp.now()` for current time
- Convert to JavaScript Date with `.toDate()`

### 4. Query Limitations
- `IN` queries limited to 10 items (handled with batching)
- Compound queries require composite indexes
- No complex aggregations (handled in application code)

### 5. Data Types
- All numeric values stored as strings (for precision)
- Dates stored as Firestore Timestamps
- Booleans stored as booleans

## Firestore Security Rules

Add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for authenticated admin
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For production, implement more granular rules based on your authentication setup.

## Migration Checklist

- [x] Install Firebase dependencies
- [x] Create Firebase configuration
- [x] Update schema definitions
- [x] Rewrite storage layer
- [x] Update db.ts
- [x] Create seed script
- [x] Update package.json
- [x] Update .env.example
- [ ] Set up Firebase project
- [ ] Configure environment variables
- [ ] Run seed script
- [ ] Test all API endpoints
- [ ] Configure Firestore security rules
- [ ] Remove old PostgreSQL files

## Troubleshooting

### Error: "Cannot find module 'firebase-admin'"
Run `npm install` to install dependencies.

### Error: "The default Firebase app does not exist"
Check that your `.env` file has correct Firebase credentials.

### Error: "PERMISSION_DENIED"
Update Firestore security rules to allow read/write access.

### Error: "9 FAILED_PRECONDITION: The query requires an index"
Create the required index in Firebase Console. The error message will include a link.

## Performance Considerations

1. **Batching**: Order items queries are batched in groups of 10 due to Firestore limitations
2. **Caching**: Consider implementing caching for frequently accessed data
3. **Indexes**: Create composite indexes for complex queries
4. **Pagination**: Implement pagination for large collections

## Support

For issues or questions:
1. Check Firebase documentation: https://firebase.google.com/docs/firestore
2. Review Firestore best practices: https://firebase.google.com/docs/firestore/best-practices
3. Check the migration guide above

---

**Migration completed successfully!** 🎉
