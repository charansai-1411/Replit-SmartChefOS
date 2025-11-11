# 🚨 CRITICAL: Multi-Tenancy Issue Found

## Problem Description

**SEVERITY: CRITICAL**

Your application currently has a **data isolation vulnerability** where:
- All authenticated users can see and modify **ALL data** in the system
- When User A creates/updates/deletes dishes, orders, customers, tables, or ingredients
- User B can see those exact same changes
- There is **NO separation** between different restaurant owners' data

### Example Scenario

1. Restaurant Owner A logs in and creates "Paneer Tikka" dish
2. Restaurant Owner B logs in and sees "Paneer Tikka" in their menu
3. Restaurant Owner B deletes it
4. Restaurant Owner A's dish is now gone

## Root Cause

The application lacks **multi-tenancy** support:

1. **No `ownerId` field** in data models (Dish, Order, Customer, Table, Ingredient, DishIngredient)
2. **No filtering by owner** in storage queries
3. **No owner association** when creating new records

### Current Code (PROBLEMATIC)

```typescript
// routes.ts - Gets ALL dishes for ALL owners
app.get("/api/dishes", requireAuth, async (req, res) => {
  const dishes = await storage.getAllDishes(); // ❌ No owner filtering
  res.json(dishes);
});

// storage.ts - Returns ALL dishes
async getAllDishes(): Promise<Dish[]> {
  const snapshot = await db.collection('dishes').get(); // ❌ No where clause
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

## Solution Overview

I've started implementing multi-tenancy by:

### ✅ Step 1: Updated Schema (COMPLETED)

Added `ownerId` field to all data models in `shared/schema.ts`:
- `Dish` - now includes `ownerId`
- `Order` - now includes `ownerId`
- `Customer` - now includes `ownerId`
- `Table` - now includes `ownerId`
- `Ingredient` - now includes `ownerId`
- `DishIngredient` - now includes `ownerId`

### ⬜ Step 2: Update Storage Layer (REQUIRED)

Need to update `server/storage.ts` to:

1. **Add `ownerId` parameter** to all query methods
2. **Filter by `ownerId`** in all Firestore queries
3. **Include `ownerId`** when creating new documents

**Example changes needed:**

```typescript
// BEFORE
async getAllDishes(): Promise<Dish[]> {
  const snapshot = await db.collection('dishes').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// AFTER
async getAllDishes(ownerId: string): Promise<Dish[]> {
  const snapshot = await db.collection('dishes')
    .where('ownerId', '==', ownerId)  // ✅ Filter by owner
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// BEFORE
async createDish(dish: InsertDish): Promise<Dish> {
  const dishData = { ...dish, image: dish.image ?? null };
  const docRef = await db.collection('dishes').add(dishData);
  return { id: docRef.id, ...dishData };
}

// AFTER
async createDish(ownerId: string, dish: InsertDish): Promise<Dish> {
  const dishData = { 
    ...dish, 
    ownerId,  // ✅ Associate with owner
    image: dish.image ?? null 
  };
  const docRef = await db.collection('dishes').add(dishData);
  return { id: docRef.id, ...dishData };
}
```

### ⬜ Step 3: Update Routes (REQUIRED)

Need to update `server/routes.ts` to:

1. **Pass `ownerId`** from session to storage methods
2. **Verify ownership** before updates/deletes

**Example changes needed:**

```typescript
// BEFORE
app.get("/api/dishes", requireAuth, async (req, res) => {
  const dishes = await storage.getAllDishes();
  res.json(dishes);
});

// AFTER
app.get("/api/dishes", requireAuth, async (req, res) => {
  const ownerId = req.session.ownerId!;  // ✅ Get from session
  const dishes = await storage.getAllDishes(ownerId);  // ✅ Pass to storage
  res.json(dishes);
});

// BEFORE
app.post("/api/dishes", requireAuth, async (req, res) => {
  const validatedData = insertDishSchema.parse(req.body);
  const dish = await storage.createDish(validatedData);
  res.status(201).json(dish);
});

// AFTER
app.post("/api/dishes", requireAuth, async (req, res) => {
  const ownerId = req.session.ownerId!;  // ✅ Get from session
  const validatedData = insertDishSchema.parse(req.body);
  const dish = await storage.createDish(ownerId, validatedData);  // ✅ Pass owner
  res.status(201).json(dish);
});
```

### ⬜ Step 4: Update Seed Script (REQUIRED)

The seed script needs to:
1. Create a test owner account
2. Use that owner's ID for all seeded data

### ⬜ Step 5: Data Migration (REQUIRED)

Existing data in Firestore needs `ownerId` added:

**Option A: Manual Migration Script**
```typescript
// Add ownerId to existing documents
const defaultOwnerId = 'your-owner-id';
const collections = ['dishes', 'orders', 'customers', 'tables', 'ingredients', 'dishIngredients'];

for (const collectionName of collections) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { ownerId: defaultOwnerId });
  });
  
  await batch.commit();
}
```

**Option B: Fresh Start**
- Delete all existing data
- Run seed script with new multi-tenant structure

## Methods That Need Updating

### Storage Methods (server/storage.ts)

**Dishes:**
- ✅ `getAllDishes()` → `getAllDishes(ownerId: string)`
- ✅ `getDish(id)` → `getDish(ownerId: string, id: string)` + verify ownership
- ✅ `createDish(dish)` → `createDish(ownerId: string, dish)`
- ✅ `updateDish(id, dish)` → `updateDish(ownerId: string, id, dish)` + verify ownership
- ✅ `deleteDish(id)` → `deleteDish(ownerId: string, id)` + verify ownership

**Orders:**
- ✅ `getAllOrders()` → `getAllOrders(ownerId: string)`
- ✅ `getOrder(id)` → `getOrder(ownerId: string, id)`
- ✅ `createOrder(order)` → `createOrder(ownerId: string, order)`
- ✅ `updateOrderStatus(id, status)` → `updateOrderStatus(ownerId: string, id, status)`
- ✅ `getActiveOrders()` → `getActiveOrders(ownerId: string)`
- ✅ `updateOrderKitchenStatus(id, status)` → `updateOrderKitchenStatus(ownerId: string, id, status)`
- ✅ `getKOTOrders()` → `getKOTOrders(ownerId: string)`
- ✅ `getOrderItems(orderId)` → `getOrderItems(ownerId: string, orderId)`
- ✅ `createOrderItem(item)` → `createOrderItem(ownerId: string, item)`

**Customers:**
- ✅ `getAllCustomers()` → `getAllCustomers(ownerId: string)`
- ✅ `getCustomer(id)` → `getCustomer(ownerId: string, id)`
- ✅ `createCustomer(customer)` → `createCustomer(ownerId: string, customer)`
- ✅ `updateCustomer(id, customer)` → `updateCustomer(ownerId: string, id, customer)`

**Tables:**
- ✅ `getAllTables()` → `getAllTables(ownerId: string)`
- ✅ `getTable(id)` → `getTable(ownerId: string, id)`
- ✅ `createTable(table)` → `createTable(ownerId: string, table)`
- ✅ `updateTable(id, table)` → `updateTable(ownerId: string, id, table)`
- ✅ `deleteTable(id)` → `deleteTable(ownerId: string, id)`

**Ingredients:**
- ✅ `getAllIngredients()` → `getAllIngredients(ownerId: string)`
- ✅ `getIngredient(id)` → `getIngredient(ownerId: string, id)`
- ✅ `createIngredient(ingredient)` → `createIngredient(ownerId: string, ingredient)`
- ✅ `updateIngredient(id, ingredient)` → `updateIngredient(ownerId: string, id, ingredient)`
- ✅ `deleteIngredient(id)` → `deleteIngredient(ownerId: string, id)`
- ✅ `updateIngredientStock(id, quantity)` → `updateIngredientStock(ownerId: string, id, quantity)`
- ✅ `getLowStockIngredients()` → `getLowStockIngredients(ownerId: string)`

**Dish Ingredients:**
- ✅ `getDishIngredients(dishId)` → `getDishIngredients(ownerId: string, dishId)`
- ✅ `addDishIngredient(dishIngredient)` → `addDishIngredient(ownerId: string, dishIngredient)`
- ✅ `removeDishIngredient(id)` → `removeDishIngredient(ownerId: string, id)`
- ✅ `updateDishIngredient(id, dishIngredient)` → `updateDishIngredient(ownerId: string, id, dishIngredient)`

**Analytics:**
- ✅ `getDailySales()` → `getDailySales(ownerId: string)`
- ✅ `getOrderCount()` → `getOrderCount(ownerId: string)`
- ✅ `getAverageTicket()` → `getAverageTicket(ownerId: string)`
- ✅ `getTopDishes(limit)` → `getTopDishes(ownerId: string, limit)`

## Security Implications

**WITHOUT multi-tenancy:**
- ❌ Data breach: All restaurants can see each other's data
- ❌ Data loss: One restaurant can delete another's data
- ❌ Privacy violation: Customer data is shared across restaurants
- ❌ Business logic errors: Analytics include data from all restaurants

**WITH multi-tenancy:**
- ✅ Data isolation: Each restaurant only sees their own data
- ✅ Data protection: Cannot modify other restaurants' data
- ✅ Privacy compliance: Customer data stays with their restaurant
- ✅ Accurate analytics: Only includes restaurant's own data

## Firestore Security Rules

After implementing multi-tenancy, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user owns the document
    function isOwner(ownerId) {
      return request.auth != null && request.auth.uid == ownerId;
    }
    
    // Dishes
    match /dishes/{dishId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId);
      allow update, delete: if isOwner(resource.data.ownerId);
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId);
      allow update, delete: if isOwner(resource.data.ownerId);
    }
    
    // Apply similar rules for customers, tables, ingredients, etc.
  }
}
```

## Testing Plan

After implementing multi-tenancy:

1. **Create two test accounts:**
   - Owner A: restaurant-a@test.com
   - Owner B: restaurant-b@test.com

2. **Test data isolation:**
   - Login as Owner A, create dishes
   - Login as Owner B, verify dishes NOT visible
   - Login as Owner B, create different dishes
   - Login as Owner A, verify Owner B's dishes NOT visible

3. **Test all CRUD operations:**
   - Create, Read, Update, Delete for each entity
   - Verify operations only affect own data

4. **Test analytics:**
   - Create orders for both owners
   - Verify analytics only show own restaurant's data

## Immediate Action Required

1. **STOP using the application in production** until multi-tenancy is implemented
2. **Backup all data** before making changes
3. **Implement the storage layer changes** (most critical)
4. **Update all routes** to pass ownerId
5. **Test thoroughly** with multiple accounts
6. **Migrate existing data** to include ownerId

## Estimated Implementation Time

- Storage layer updates: 2-3 hours
- Routes updates: 1-2 hours
- Seed script updates: 30 minutes
- Testing: 1-2 hours
- **Total: 5-8 hours**

## Priority

**🔴 CRITICAL - IMPLEMENT IMMEDIATELY**

This is a fundamental security and data integrity issue that must be resolved before the application can be used by multiple restaurants.

---

**Status**: Schema updated, implementation in progress  
**Next Step**: Update storage layer with ownerId filtering
