# Final Multi-Tenancy Implementation Steps

## ✅ What's Done

1. **Firestore Migration** - Complete
2. **Storage Context** - Created (`server/storage-context.ts`) with full `ownerId` filtering
3. **Dishes Routes** - Updated to use storage context
4. **Orders Routes** - Partially updated (GET /api/orders, GET /api/orders/active)

## ⚠️ What's Remaining

You need to update the remaining routes in `server/routes.ts`. I've created the storage context that handles all the filtering - you just need to use it.

## Quick Fix - Replace All Routes

Open `server/routes.ts` and do a **Find & Replace**:

### Pattern 1: Simple storage calls
**Find:** `await storage\.`
**Replace:** `await ctx.`

### Pattern 2: Add context at start of each handler
Before each `storage.` call, add:
```typescript
const ctx = createStorageContext(req.session.ownerId!);
```

## Or Copy-Paste These Updated Routes

### Orders - GET /api/orders/:id
```typescript
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const order = await ctx.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});
```

### Orders - POST /api/orders
```typescript
app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const { order: orderData, items } = req.body;
    const validatedOrder = insertOrderSchema.parse(orderData);
    
    let orderTotal = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const dish = await ctx.getDish(item.dishId);
        if (dish) {
          orderTotal += parseFloat(dish.price) * item.quantity;
        }
      }
    }
    
    const order = await ctx.createOrder({ 
      ...validatedOrder, 
      total: orderTotal.toString(),
      kitchenStatus: 'pending',
    });
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const dish = await ctx.getDish(item.dishId);
        if (dish) {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
            price: dish.price,
          });
          await ctx.createOrderItem(validatedItem);
          
          // Deduct ingredients from inventory
          const dishIngredients = await ctx.getDishIngredients(item.dishId);
          for (const dishIngredient of dishIngredients) {
            const quantityToDeduct = parseFloat(dishIngredient.quantity) * item.quantity;
            await ctx.updateIngredientStock(
              dishIngredient.ingredientId,
              -quantityToDeduct
            );
          }
        }
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ error: "Invalid order data" });
  }
});
```

### Orders - PATCH /api/orders/:id/status
```typescript
app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const order = await ctx.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});
```

### Orders - PATCH /api/orders/:id/kitchen-status
```typescript
app.patch("/api/orders/:id/kitchen-status", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const { kitchenStatus } = req.body;
    if (!kitchenStatus) {
      return res.status(400).json({ error: "Kitchen status is required" });
    }
    const order = await ctx.updateOrderKitchenStatus(req.params.id, kitchenStatus);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update kitchen status" });
  }
});
```

### Orders - GET /api/kot
```typescript
app.get("/api/kot", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const kotOrders = await ctx.getKOTOrders();
    res.json(kotOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch KOT orders" });
  }
});
```

### Orders - GET /api/orders/:id/items
```typescript
app.get("/api/orders/:id/items", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const items = await ctx.getOrderItems(req.params.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order items" });
  }
});
```

### Customers - All Routes
```typescript
// GET /api/customers
app.get("/api/customers", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const customers = await ctx.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Customers error:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /api/customers/:id
app.get("/api/customers/:id", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const customer = await ctx.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// POST /api/customers
app.post("/api/customers", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const validatedData = insertCustomerSchema.parse(req.body);
    const customer = await ctx.createCustomer(validatedData);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: "Invalid customer data" });
  }
});

// PATCH /api/customers/:id
app.patch("/api/customers/:id", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const validatedData = updateCustomerSchema.parse(req.body);
    const customer = await ctx.updateCustomer(req.params.id, validatedData);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: "Invalid customer data" });
  }
});
```

### Analytics
```typescript
app.get("/api/analytics", requireAuth, async (req, res) => {
  try {
    const ctx = createStorageContext(req.session.ownerId!);
    const [dailySales, orderCount, avgTicket, topDishes] = await Promise.all([
      ctx.getDailySales(),
      ctx.getOrderCount(),
      ctx.getAverageTicket(),
      ctx.getTopDishes(3),
    ]);
    
    res.json({
      dailySales,
      orderCount,
      avgTicket,
      topDishes,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});
```

## Apply Same Pattern to:
- Tables routes (GET, POST, PATCH, DELETE)
- Ingredients routes (GET, POST, PATCH, DELETE, low-stock)
- Dish Ingredients routes (GET, POST, DELETE)

## After Updating Routes

1. **Update seed script** to create an owner and associate all data
2. **Test with two accounts**:
   - Create account A, add dishes
   - Create account B, verify can't see A's dishes
   - Add dishes as B
   - Login as A, verify can't see B's dishes

## Seed Script Update

In `server/seed-firebase.ts`, add at the top:
```typescript
// Create a test owner first
const ownerData = {
  email: 'test@restaurant.com',
  password: hashPassword('password123'),
  restaurantName: 'Test Restaurant',
  ownerName: 'Test Owner',
  phone: '+91 98765 43210',
  address: '123 Test St',
  cuisine: 'Indian',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

const ownerRef = await db.collection(COLLECTIONS.RESTAURANT_OWNERS).add(ownerData);
const ownerId = ownerRef.id;

// Then add ownerId to all seeded data:
const dishData = { ...dish, ownerId };
const customerData = { ...customer, ownerId };
// etc.
```

## Testing

```bash
# 1. Start the server
npm run dev

# 2. Register two accounts
# Account A: testa@test.com
# Account B: testb@test.com

# 3. Test isolation
# - Login as A, create dishes
# - Login as B, verify dishes list is empty
# - Create different dishes as B
# - Login as A, verify B's dishes not visible
```

## Success Criteria

✅ Each owner only sees their own:
- Dishes
- Orders
- Customers
- Tables
- Ingredients
- Analytics

✅ Cannot access other owner's data even with direct API calls

✅ Seed script creates data for a specific owner

---

**The storage context is ready. Just update the routes to use `ctx` instead of `storage`!**
