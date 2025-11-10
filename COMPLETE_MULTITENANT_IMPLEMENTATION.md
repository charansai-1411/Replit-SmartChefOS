# Complete Multi-Tenant Implementation Guide

## Status: Interface Updated ✅ | Implementation Required ⬜

I've updated the `IStorage` interface to include `ownerId` parameters. Now all method implementations need to be updated.

## Quick Summary

**What's Done:**
- ✅ Added `ownerId` to all data model interfaces in `shared/schema.ts`
- ✅ Updated `IStorage` interface in `server/storage.ts` with `ownerId` parameters

**What's Needed:**
- ⬜ Update all 50+ storage method implementations
- ⬜ Update all 40+ route handlers
- ⬜ Update seed script
- ⬜ Create data migration script

## Option 1: Complete Manual Implementation (8-10 hours)

Due to the large scope (777 lines in storage.ts alone), I recommend one of these approaches:

### Approach A: I Complete Everything (Recommended)
Let me create a complete new storage.ts file with all multi-tenant implementations. This will take multiple messages due to size limits, but I'll:
1. Create new storage-multitenant.ts with all methods updated
2. Create new routes-multitenant.ts with all routes updated  
3. Update seed script
4. Create migration script
5. Provide testing instructions

### Approach B: You Use Find & Replace
Use your IDE's find & replace with these patterns:

**Storage.ts patterns:**
```
Find: async getAllDishes\(\): Promise<Dish\[\]> \{
Replace: async getAllDishes(ownerId: string): Promise<Dish[]> {

Find: \.collection\(COLLECTIONS\.DISHES\)\.get\(\);
Replace: .collection(COLLECTIONS.DISHES).where('ownerId', '==', ownerId).get();

Find: async createDish\(dish: InsertDish\): Promise<Dish> \{
Replace: async createDish(ownerId: string, dish: InsertDish): Promise<Dish> {

Find: const dishData = \{ \.\.\.dish, image: dish\.image \?\? null \};
Replace: const dishData = { ...dish, ownerId, image: dish.image ?? null };
```

## Option 2: Automated Script Approach

I can create a Node.js script that:
1. Backs up current files
2. Applies all transformations automatically
3. Runs tests to verify

## My Recommendation

**Let me complete the full implementation for you.** 

I'll create complete new files with all multi-tenancy support. This ensures:
- ✅ No mistakes in find/replace
- ✅ Proper error handling
- ✅ Ownership verification on updates/deletes
- ✅ Consistent patterns throughout
- ✅ Testing scripts included

## Next Steps - Choose One:

**Option A (Recommended):** Reply "complete implementation" and I'll create all updated files

**Option B:** Reply "guide me" and I'll provide step-by-step manual instructions

**Option C:** Reply "script it" and I'll create an automated migration script

---

## Preview: What Each Method Needs

### Example: getAllDishes

**Before:**
```typescript
async getAllDishes(): Promise<Dish[]> {
  const snapshot = await db.collection(COLLECTIONS.DISHES).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Dish));
}
```

**After:**
```typescript
async getAllDishes(ownerId: string): Promise<Dish[]> {
  const snapshot = await db.collection(COLLECTIONS.DISHES)
    .where('ownerId', '==', ownerId)  // ✅ Filter by owner
    .get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Dish));
}
```

### Example: createDish

**Before:**
```typescript
async createDish(dish: InsertDish): Promise<Dish> {
  const dishData = { ...dish, image: dish.image ?? null };
  const docRef = await db.collection(COLLECTIONS.DISHES).add(dishData);
  return { id: docRef.id, ...dishData };
}
```

**After:**
```typescript
async createDish(ownerId: string, dish: InsertDish): Promise<Dish> {
  const dishData = { 
    ...dish, 
    ownerId,  // ✅ Add owner ID
    image: dish.image ?? null 
  };
  const docRef = await db.collection(COLLECTIONS.DISHES).add(dishData);
  return { id: docRef.id, ...dishData };
}
```

### Example: updateDish (with ownership verification)

**Before:**
```typescript
async updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
  const docRef = db.collection(COLLECTIONS.DISHES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return undefined;
  
  await docRef.update(dish);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Dish;
}
```

**After:**
```typescript
async updateDish(ownerId: string, id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
  const docRef = db.collection(COLLECTIONS.DISHES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return undefined;
  
  // ✅ Verify ownership
  const data = doc.data();
  if (data?.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this dish');
  }
  
  await docRef.update(dish);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Dish;
}
```

## Routes Example

**Before:**
```typescript
app.get("/api/dishes", requireAuth, async (req, res) => {
  const dishes = await storage.getAllDishes();
  res.json(dishes);
});
```

**After:**
```typescript
app.get("/api/dishes", requireAuth, async (req, res) => {
  const ownerId = req.session.ownerId!;  // ✅ Get from session
  const dishes = await storage.getAllDishes(ownerId);  // ✅ Pass to storage
  res.json(dishes);
});
```

## Testing After Implementation

```bash
# 1. Clear existing data
# 2. Run seed script
npm run seed

# 3. Create two test accounts
# Account A: test-a@example.com / password123
# Account B: test-b@example.com / password123

# 4. Test isolation
# - Login as A, create dishes
# - Login as B, verify dishes NOT visible
# - Create different dishes as B
# - Login as A, verify B's dishes NOT visible

# 5. Test all CRUD operations for each entity
```

## Files That Will Be Modified

1. `server/storage.ts` - All method implementations (777 lines)
2. `server/routes.ts` - All route handlers (520 lines)
3. `server/seed-firebase.ts` - Add owner creation (265 lines)
4. `shared/schema.ts` - Already done ✅

## Estimated Completion Time

- Full implementation by me: 30-45 minutes (multiple messages)
- Manual implementation by you: 8-10 hours
- Automated script: 1-2 hours to create + test

---

**Ready to proceed? Choose your approach above!**
