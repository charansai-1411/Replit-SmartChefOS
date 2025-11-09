import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDishSchema, 
  updateDishSchema,
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertCustomerSchema,
  updateCustomerSchema,
  insertTableSchema,
  updateTableSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dishes API
  app.get("/api/dishes", async (req, res) => {
    try {
      const dishes = await storage.getAllDishes();
      res.json(dishes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dishes" });
    }
  });

  app.get("/api/dishes/:id", async (req, res) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dish" });
    }
  });

  app.post("/api/dishes", async (req, res) => {
    try {
      const validatedData = insertDishSchema.parse(req.body);
      const dish = await storage.createDish(validatedData);
      res.status(201).json(dish);
    } catch (error) {
      res.status(400).json({ error: "Invalid dish data" });
    }
  });

  app.patch("/api/dishes/:id", async (req, res) => {
    try {
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await storage.updateDish(req.params.id, validatedData);
      if (!dish) {
        return res.status(404).json({ error: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(400).json({ error: "Invalid dish data" });
    }
  });

  app.delete("/api/dishes/:id", async (req, res) => {
    try {
      await storage.deleteDish(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete dish" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order: orderData, items } = req.body;
      const validatedOrder = insertOrderSchema.parse(orderData);
      
      let orderTotal = 0;
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const dish = await storage.getDish(item.dishId);
          if (dish) {
            orderTotal += parseFloat(dish.price) * item.quantity;
          }
        }
      }
      
      const order = await storage.createOrder({ ...validatedOrder, total: orderTotal.toString() });
      
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const dish = await storage.getDish(item.dishId);
          if (dish) {
            const validatedItem = insertOrderItemSchema.parse({
              ...item,
              orderId: order.id,
              price: dish.price,
            });
            await storage.createOrderItem(validatedItem);
          }
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Customers error:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const validatedData = updateCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  // Tables API
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getAllTables();
      res.json(tables);
    } catch (error) {
      console.error("Tables error:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error) {
      res.status(400).json({ error: "Invalid table data" });
    }
  });

  app.patch("/api/tables/:id", async (req, res) => {
    try {
      const validatedData = updateTableSchema.parse(req.body);
      const table = await storage.updateTable(req.params.id, validatedData);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(400).json({ error: "Invalid table data" });
    }
  });

  app.delete("/api/tables/:id", async (req, res) => {
    try {
      await storage.deleteTable(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete table" });
    }
  });

  // Analytics API
  app.get("/api/analytics", async (req, res) => {
    try {
      const [dailySales, orderCount, avgTicket, topDishes] = await Promise.all([
        storage.getDailySales(),
        storage.getOrderCount(),
        storage.getAverageTicket(),
        storage.getTopDishes(3),
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
