# Run Seed Script - Quick Guide

## The 401 Error Fix

The 401 errors you're seeing are because the existing data in Firestore doesn't have `ownerId` fields. The seed script has been updated to fix this.

## Steps to Fix

### 1. Clear Existing Data (Optional but Recommended)

Go to Firebase Console and delete all documents from these collections:
- dishes
- customers
- tables
- ingredients
- orders
- orderItems

OR just run the seed script - it will add new data with `ownerId`.

### 2. Run the Seed Script

```bash
npm run seed
```

This will create:
- ✅ 1 test owner account
- ✅ 8 dishes (with ownerId)
- ✅ 5 customers (with ownerId)
- ✅ 17 tables (with ownerId)
- ✅ 20 ingredients (with ownerId)
- ✅ 9 orders (with ownerId)
- ✅ Order items

### 3. Test Account Created

**Email:** `test@restaurant.com`  
**Password:** `password123`

### 4. Login and Test

1. Go to http://localhost:5000 (or your dev server)
2. Login with the test account
3. You should now see all the seeded data!

## Create a Second Account for Testing

1. Click "Register" (or go to /register)
2. Create a new account:
   - Email: `test2@restaurant.com`
   - Password: `password123`
   - Restaurant Name: `Restaurant 2`
   - etc.

3. Login with the second account
4. **Verify**: You should see EMPTY lists (no dishes, orders, etc.)
5. Add some dishes as the second user
6. Logout and login as first user
7. **Verify**: You should NOT see the second user's dishes

## Troubleshooting

### Still Getting 401 Errors?

1. **Clear browser cache and cookies**
2. **Logout and login again**
3. **Check Firestore Console** - verify data has `ownerId` field
4. **Check browser console** for specific error messages

### Data Not Showing?

1. Make sure you're logged in
2. Check that seed script completed successfully
3. Verify in Firestore Console that documents have `ownerId` matching your user ID

### How to Find Your Owner ID

1. Login to your account
2. Open browser DevTools (F12)
3. Go to Application > Cookies
4. Look for `connect.sid` cookie
5. Or check Firestore Console > restaurantOwners collection

## Quick Test Checklist

After seeding:

- [ ] Login with `test@restaurant.com` / `password123`
- [ ] See 8 dishes in the dishes page
- [ ] See 5 customers
- [ ] See 17 tables
- [ ] See 20 ingredients
- [ ] See analytics with data
- [ ] Create a second account
- [ ] Verify second account sees empty lists
- [ ] Add data as second account
- [ ] Verify first account doesn't see second account's data

---

**The seed script now creates data with proper `ownerId` fields!**
