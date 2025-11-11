import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createStorageContext } from "./storage-context";
import { 
  insertDishSchema, 
  updateDishSchema,
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertCustomerSchema,
  updateCustomerSchema,
  insertTableSchema,
  updateTableSchema,
  insertIngredientSchema,
  updateIngredientSchema,
  insertDishIngredientSchema,
  insertRestaurantOwnerSchema,
  loginSchema,
  updateRestaurantOwnerSchema
} from "@shared/schema";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log("Auth check - Session ID:", req.sessionID, "Owner ID:", req.session.ownerId);
  if (!req.session.ownerId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertRestaurantOwnerSchema.parse(req.body);
      const owner = await storage.registerOwner(validatedData);
      req.session.ownerId = owner.id;
      console.log("User registered - Owner ID:", owner.id, "Session ID:", req.sessionID);
      res.status(201).json(owner);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        return res.status(409).json({ error: error.message });
      }
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const owner = await storage.loginOwner(validatedData);
      
      if (!owner) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      req.session.ownerId = owner.id;
      console.log("User logged in - Owner ID:", owner.id, "Session ID:", req.sessionID);
      res.json(owner);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    console.log("Checking auth - Session ID:", req.sessionID, "Owner ID:", req.session.ownerId);
    if (!req.session.ownerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const owner = await storage.getOwnerById(req.session.ownerId);
      if (!owner) {
        console.log("Owner not found for ID:", req.session.ownerId);
        return res.status(404).json({ error: "Owner not found" });
      }
      console.log("Auth check successful for owner:", owner.id);
      res.json(owner);
    } catch (error) {
      console.error("Error fetching owner data:", error);
      res.status(500).json({ error: "Failed to fetch owner data" });
    }
  });

  app.patch("/api/auth/profile", async (req, res) => {
    if (!req.session.ownerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validatedData = updateRestaurantOwnerSchema.parse(req.body);
      const owner = await storage.updateOwnerProfile(req.session.ownerId, validatedData);
      
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }
      
      res.json(owner);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  // Dishes API (Protected)
  app.get("/api/dishes", requireAuth, async (req, res) => {
    try {
      console.log("Fetching dishes for owner:", req.session.ownerId);
      const ctx = createStorageContext(req.session.ownerId!);
      const dishes = await ctx.getAllDishes();
      console.log("Dishes fetched:", dishes.length, "dishes");
      res.json(dishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      res.status(500).json({ error: "Failed to fetch dishes" });
    }
  });

  app.get("/api/dishes/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const dish = await ctx.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dish" });
    }
  });

  app.post("/api/dishes", requireAuth, async (req, res) => {
    try {
      console.log("Creating dish for owner:", req.session.ownerId);
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = insertDishSchema.parse(req.body);
      const dish = await ctx.createDish(validatedData);
      console.log("Dish created:", dish.id, "with ownerId:", dish.ownerId);
      res.status(201).json(dish);
    } catch (error) {
      console.error("Error creating dish:", error);
      res.status(400).json({ error: "Invalid dish data" });
    }
  });

  app.patch("/api/dishes/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await ctx.updateDish(req.params.id, validatedData);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(400).json({ error: "Invalid dish data" });
    }
  });

  app.delete("/api/dishes/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      await ctx.deleteDish(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dish" });
    }
  });

  // Orders API (Protected)
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      console.log("Fetching orders for owner:", req.session.ownerId);
      const ctx = createStorageContext(req.session.ownerId!);
      const orders = await ctx.getAllOrders();
      console.log("Orders fetched successfully:", orders.length);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/active", requireAuth, async (req, res) => {
    try {
      console.log("Fetching active orders for owner:", req.session.ownerId);
      const ctx = createStorageContext(req.session.ownerId!);
      const orders = await ctx.getActiveOrders();
      console.log("Active orders fetched successfully:", orders.length);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      res.status(500).json({ error: "Failed to fetch active orders" });
    }
  });

  app.get("/api/orders/table/:tableNumber", requireAuth, async (req, res) => {
    try {
      console.log("Fetching orders for table:", req.params.tableNumber, "owner:", req.session.ownerId);
      const ctx = createStorageContext(req.session.ownerId!);
      const orders = await ctx.getOrdersByTableNumber(req.params.tableNumber);
      console.log("Table orders fetched:", orders.length, "orders");
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders for table:", error);
      res.status(500).json({ error: "Failed to fetch orders for table" });
    }
  });

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

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const { order: orderData, items } = req.body;
      const validatedOrder = insertOrderSchema.parse(orderData);
      
      let orderTotal = 0;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const dish: any = await ctx.getDish(item.dishId);
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
          const dish: any = await ctx.getDish(item.dishId);
          if (dish) {
            const validatedItem = insertOrderItemSchema.parse({
              ...item,
              orderId: order.id,
              price: dish.price,
            });
            await ctx.createOrderItem(validatedItem);
            
            // Deduct ingredients from inventory
            const dishIngredients: any = await ctx.getDishIngredients(item.dishId);
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

  app.get("/api/kot", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const kotOrders = await ctx.getKOTOrders();
      res.json(kotOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KOT orders" });
    }
  });

  app.get("/api/orders/:id/items", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const items = await ctx.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  // Customers API (Protected)
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

  // Tables API (Protected)
  app.get("/api/tables", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const tables = await ctx.getAllTables();
      res.json(tables);
    } catch (error) {
      console.error("Tables error:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.get("/api/tables/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const table = await ctx.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = insertTableSchema.parse(req.body);
      const table = await ctx.createTable(validatedData);
      res.status(201).json(table);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid table data";
      res.status(400).json({ error: errorMessage });
    }
  });

  app.patch("/api/tables/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = updateTableSchema.parse(req.body);
      const table = await ctx.updateTable(req.params.id, validatedData);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid table data";
      res.status(400).json({ error: errorMessage });
    }
  });

  app.delete("/api/tables/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      await ctx.deleteTable(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete table" });
    }
  });

  // Ingredients API (Protected)
  app.get("/api/ingredients", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const ingredients = await ctx.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/ingredients/low-stock", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const ingredients = await ctx.getLowStockIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock ingredients" });
    }
  });

  app.get("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const ingredient = await ctx.getIngredient(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredient" });
    }
  });

  app.post("/api/ingredients", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await ctx.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid ingredient data" });
    }
  });

  app.patch("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = updateIngredientSchema.parse(req.body);
      const ingredient = await ctx.updateIngredient(req.params.id, validatedData);
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid ingredient data" });
    }
  });

  app.delete("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      await ctx.deleteIngredient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ingredient" });
    }
  });

  // Dish Ingredients API (Protected)
  app.get("/api/dishes/:id/ingredients", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const dishIngredients = await ctx.getDishIngredients(req.params.id);
      res.json(dishIngredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dish ingredients" });
    }
  });

  app.post("/api/dishes/:id/ingredients", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      const validatedData = insertDishIngredientSchema.parse({
        ...req.body,
        dishId: req.params.id,
      });
      const dishIngredient = await ctx.addDishIngredient(validatedData);
      res.status(201).json(dishIngredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid dish ingredient data" });
    }
  });

  app.delete("/api/dish-ingredients/:id", requireAuth, async (req, res) => {
    try {
      const ctx = createStorageContext(req.session.ownerId!);
      await ctx.removeDishIngredient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove dish ingredient" });
    }
  });

  // Analytics API (Protected)
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

  const httpServer = createServer(app);

  return httpServer;
}
