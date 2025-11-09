import { db } from "./db";
import { dishes, customers, orders, orderItems } from "@shared/schema";
import fs from "fs";
import path from "path";

async function exportData() {
  console.log("Exporting data from database...\n");

  try {
    // Export dishes
    const allDishes = await db.select().from(dishes);
    console.log(`✓ Exported ${allDishes.length} dishes`);

    // Export customers
    const allCustomers = await db.select().from(customers);
    console.log(`✓ Exported ${allCustomers.length} customers`);

    // Export orders
    const allOrders = await db.select().from(orders);
    console.log(`✓ Exported ${allOrders.length} orders`);

    // Export order items
    const allOrderItems = await db.select().from(orderItems);
    console.log(`✓ Exported ${allOrderItems.length} order items`);

    // Create export object
    const exportData = {
      dishes: allDishes,
      customers: allCustomers,
      orders: allOrders,
      orderItems: allOrderItems,
      exportedAt: new Date().toISOString(),
    };

    // Write to file
    const exportPath = path.resolve(import.meta.dirname, "..", "data-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✓ Data exported successfully to: ${exportPath}`);
    console.log(`\nSummary:`);
    console.log(`  - ${allDishes.length} dishes`);
    console.log(`  - ${allCustomers.length} customers`);
    console.log(`  - ${allOrders.length} orders`);
    console.log(`  - ${allOrderItems.length} order items`);
  } catch (error) {
    console.error("Export error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error;
  }

  process.exit(0);
}

exportData();

