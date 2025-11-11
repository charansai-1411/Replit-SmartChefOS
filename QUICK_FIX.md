# Quick Fix for Dashboard Loading Issue

## The Problem
Dashboard is stuck on loading because:
1. API calls are returning 401 (Unauthorized)
2. The data in Firestore doesn't have `ownerId` fields
3. The multi-tenant code can't find any data without `ownerId`

## Quick Fix - 2 Options

### Option 1: Run Seed Script (Recommended - 30 seconds)

This creates a test account with data:

```bash
npm run seed
```

Then:
1. Go to http://localhost:5000/login
2. Login with:
   - Email: `test@restaurant.com`
   - Password: `password123`
3. Dashboard should load with data!

### Option 2: Register a New Account (1 minute)

1. Stop the dev server (Ctrl+C)
2. Clear Firestore data in Firebase Console (delete all collections)
3. Restart dev server: `npm run dev`
4. Go to http://localhost:5000/register
5. Create a new account
6. Login
7. Add dishes manually

## Why This Happened

The old data in Firestore was created before multi-tenancy was implemented, so it doesn't have `ownerId` fields. The new code requires `ownerId` to access any data.

## After Running Seed

You'll have:
- ✅ Test account ready to use
- ✅ 8 dishes
- ✅ 5 customers
- ✅ 17 tables
- ✅ 20 ingredients
- ✅ 9 sample orders
- ✅ Analytics data

## Test Multi-Tenancy

1. Login with test account - see all data
2. Register a second account
3. Login with second account - see EMPTY lists
4. Add dishes as second user
5. Login as first user - verify you DON'T see second user's dishes

---

**Run `npm run seed` now to fix the loading issue!**
