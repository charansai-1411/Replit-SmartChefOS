import { db } from "./db";
import { dishes, customers, orders, orderItems } from "@shared/schema";
import fs from "fs";
import path from "path";

async function importData() {
  console.log("Importing data to database...\n");

  try {
    // Read export file
    const exportPath = path.resolve(import.meta.dirname, "..", "data-export.json");
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found: ${exportPath}\nPlease run 'npm run export-data' first.`);
    }

    const exportData = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
    console.log(`✓ Loaded export file (exported at: ${exportData.exportedAt})`);

    // Import dishes
    if (exportData.dishes && exportData.dishes.length > 0) {
      // Remove id to let database generate new ones, or keep existing if you want to preserve IDs
      const dishesToInsert = exportData.dishes.map((d: any) => ({
        name: d.name,
        price: d.price,
        category: d.category,
        veg: d.veg,
        image: d.image,
        available: d.available,
      }));
      await db.insert(dishes).values(dishesToInsert).onConflictDoNothing();
      console.log(`✓ Imported ${exportData.dishes.length} dishes`);
    }

    // Import customers
    if (exportData.customers && exportData.customers.length > 0) {
      const customersToInsert = exportData.customers.map((c: any) => ({
        name: c.name,
        phone: c.phone,
        lastVisit: c.lastVisit ? new Date(c.lastVisit) : null,
        lifetimeValue: c.lifetimeValue || "0",
      }));
      const insertedCustomers = await db.insert(customers).values(customersToInsert).onConflictDoNothing().returning();
      console.log(`✓ Imported ${insertedCustomers.length} customers`);

      // Import orders (need to map old customer IDs to new ones)
      if (exportData.orders && exportData.orders.length > 0) {
        // Get all customers to map phone numbers to IDs
        const allCustomers = await db.select().from(customers);
        const customerMap = new Map(allCustomers.map(c => [c.phone, c.id]));

        const ordersToInsert = exportData.orders.map((o: any) => ({
          customerId: o.customerId ? customerMap.get(exportData.customers.find((c: any) => c.id === o.customerId)?.phone) || null : null,
          tableNumber: o.tableNumber,
          guests: o.guests,
          type: o.type,
          status: o.status,
          total: o.total || "0",
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        }));
        const insertedOrders = await db.insert(orders).values(ordersToInsert).returning();
        console.log(`✓ Imported ${insertedOrders.length} orders`);

        // Import order items
        if (exportData.orderItems && exportData.orderItems.length > 0) {
          // Map old order IDs to new order IDs
          const orderMap = new Map();
          exportData.orders.forEach((oldOrder: any, index: number) => {
            if (insertedOrders[index]) {
              orderMap.set(oldOrder.id, insertedOrders[index].id);
            }
          });

          // Get all dishes to map names to IDs
          const allDishes = await db.select().from(dishes);
          const dishMap = new Map(allDishes.map(d => [d.name, d.id]));

          const orderItemsToInsert = exportData.orderItems
            .map((oi: any) => {
              const newOrderId = orderMap.get(oi.orderId);
              const oldDish = exportData.dishes.find((d: any) => d.id === oi.dishId);
              const newDishId = oldDish ? dishMap.get(oldDish.name) : null;
              
              if (!newOrderId || !newDishId) return null;

              return {
                orderId: newOrderId,
                dishId: newDishId,
                quantity: oi.quantity,
                price: oi.price,
                notes: oi.notes || null,
              };
            })
            .filter((oi: any) => oi !== null);

          await db.insert(orderItems).values(orderItemsToInsert);
          console.log(`✓ Imported ${orderItemsToInsert.length} order items`);
        }
      }
    } else if (exportData.orders && exportData.orders.length > 0) {
      // Import orders without customers
      const ordersToInsert = exportData.orders.map((o: any) => ({
        customerId: null,
        tableNumber: o.tableNumber,
        guests: o.guests,
        type: o.type,
        status: o.status,
        total: o.total || "0",
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
      }));
      const insertedOrders = await db.insert(orders).values(ordersToInsert).returning();
      console.log(`✓ Imported ${insertedOrders.length} orders`);

      // Import order items (simplified - may need dish mapping)
      if (exportData.orderItems && exportData.orderItems.length > 0) {
        const allDishes = await db.select().from(dishes);
        const orderMap = new Map();
        exportData.orders.forEach((oldOrder: any, index: number) => {
          if (insertedOrders[index]) {
            orderMap.set(oldOrder.id, insertedOrders[index].id);
          }
        });

        const orderItemsToInsert = exportData.orderItems
          .map((oi: any) => {
            const newOrderId = orderMap.get(oi.orderId);
            const oldDish = exportData.dishes.find((d: any) => d.id === oi.dishId);
            const dish = oldDish ? allDishes.find(d => d.name === oldDish.name) : null;
            
            if (!newOrderId || !dish) return null;

            return {
              orderId: newOrderId,
              dishId: dish.id,
              quantity: oi.quantity,
              price: oi.price,
              notes: oi.notes || null,
            };
          })
          .filter((oi: any) => oi !== null);

        await db.insert(orderItems).values(orderItemsToInsert);
        console.log(`✓ Imported ${orderItemsToInsert.length} order items`);
      }
    }

    console.log("\n✓ Data import complete!");
  } catch (error) {
    console.error("Import error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }

  process.exit(0);
}

importData();

