import { initializeFirebase } from "./firebase";
import { COLLECTIONS } from "@shared/schema";
import fs from "fs";
import path from "path";

const db = initializeFirebase();

async function exportData() {
  console.log("Exporting data from Firebase Firestore...\n");

  try {
    // Note: This script requires an ownerId to export data
    const ownerId = process.env.OWNER_ID;
    
    if (!ownerId) {
      throw new Error("OWNER_ID is required. Set it in environment: OWNER_ID=your-owner-id npm run export-data");
    }

    console.log(`Exporting data for owner: ${ownerId}`);

    // Export dishes
    const dishesSnapshot = await db.collection(COLLECTIONS.DISHES)
      .where('ownerId', '==', ownerId)
      .get();
    const allDishes = dishesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✓ Exported ${allDishes.length} dishes`);

    // Export customers
    const customersSnapshot = await db.collection(COLLECTIONS.CUSTOMERS)
      .where('ownerId', '==', ownerId)
      .get();
    const allCustomers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✓ Exported ${allCustomers.length} customers`);

    // Export tables
    const tablesSnapshot = await db.collection(COLLECTIONS.TABLES)
      .where('ownerId', '==', ownerId)
      .get();
    const allTables = tablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✓ Exported ${allTables.length} tables`);

    // Export ingredients
    const ingredientsSnapshot = await db.collection(COLLECTIONS.INGREDIENTS)
      .where('ownerId', '==', ownerId)
      .get();
    const allIngredients = ingredientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✓ Exported ${allIngredients.length} ingredients`);

    // Export orders (last 100 to avoid huge exports)
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✓ Exported ${allOrders.length} orders (limited to last 100)`);

    // Export order items for the exported orders
    const orderIds = allOrders.map(o => o.id);
    let allOrderItems: any[] = [];
    
    if (orderIds.length > 0) {
      // Firestore 'in' queries are limited to 10 items, so we batch them
      for (let i = 0; i < orderIds.length; i += 10) {
        const batch = orderIds.slice(i, i + 10);
        const orderItemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
          .where('orderId', 'in', batch)
          .get();
        const items = orderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allOrderItems = allOrderItems.concat(items);
      }
    }
    console.log(`✓ Exported ${allOrderItems.length} order items`);

    // Create export object
    const exportData = {
      ownerId: ownerId,
      dishes: allDishes,
      customers: allCustomers,
      tables: allTables,
      ingredients: allIngredients,
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
    console.log(`  - ${allTables.length} tables`);
    console.log(`  - ${allIngredients.length} ingredients`);
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

