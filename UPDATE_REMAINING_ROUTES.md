# Update Remaining Routes - Quick Reference

I've updated the Dishes routes. Here's the pattern to update all remaining routes:

## Pattern to Follow

**Before:**
```typescript
app.get("/api/orders", requireAuth, async (req, res) => {
  const orders = await storage.getAllOrders();
  res.json(orders);
});
```

**After:**
```typescript
app.get("/api/orders", requireAuth, async (req, res) => {
  const ctx = createStorageContext(req.session.ownerId!);
  const orders = await ctx.getAllOrders();
  res.json(orders);
});
```

## Routes to Update

Replace `storage.` with `ctx.` after creating context. Add this line at the start of each route handler:
```typescript
const ctx = createStorageContext(req.session.ownerId!);
```

### Orders (lines ~166-290)
- `GET /api/orders` - getAllOrders()
- `GET /api/orders/active` - getActiveOrders()
- `GET /api/orders/:id` - getOrder(id)
- `POST /api/orders` - createOrder(), createOrderItem(), getDish(), getDishIngredients(), updateIngredientStock()
- `PATCH /api/orders/:id/status` - updateOrderStatus()
- `PATCH /api/orders/:id/kitchen-status` - updateOrderKitchenStatus()
- `GET /api/kot` - getKOTOrders()
- `GET /api/orders/:id/items` - getOrderItems()

### Customers (lines ~292-336)
- `GET /api/customers` - getAllCustomers()
- `GET /api/customers/:id` - getCustomer(id)
- `POST /api/customers` - createCustomer()
- `PATCH /api/customers/:id` - updateCustomer()

### Tables (lines ~338-393)
- `GET /api/tables` - getAllTables()
- `GET /api/tables/:id` - getTable(id)
- `POST /api/tables` - createTable()
- `PATCH /api/tables/:id` - updateTable()
- `DELETE /api/tables/:id` - deleteTable()

### Ingredients (lines ~395-456)
- `GET /api/ingredients` - getAllIngredients()
- `GET /api/ingredients/low-stock` - getLowStockIngredients()
- `GET /api/ingredients/:id` - getIngredient(id)
- `POST /api/ingredients` - createIngredient()
- `PATCH /api/ingredients/:id` - updateIngredient()
- `DELETE /api/ingredients/:id` - deleteIngredient()

### Dish Ingredients (lines ~458-488)
- `GET /api/dishes/:id/ingredients` - getDishIngredients()
- `POST /api/dishes/:id/ingredients` - addDishIngredient()
- `DELETE /api/dish-ingredients/:id` - removeDishIngredient()

### Analytics (lines ~490-514)
- `GET /api/analytics` - getDailySales(), getOrderCount(), getAverageTicket(), getTopDishes()

## Quick Find & Replace

Use your IDE's find & replace with regex:

**Find:** `const (\w+) = await storage\.`
**Replace:** `const ctx = createStorageContext(req.session.ownerId!);\n    const $1 = await ctx.`

Then manually fix any that need adjustment.

## Or Run This Command

I'll create a complete updated routes file in the next message.
