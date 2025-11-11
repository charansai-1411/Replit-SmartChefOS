import { initializeFirebase } from "./firebase";
import { COLLECTIONS } from "@shared/schema";
import fs from "fs";
import path from "path";

const db = initializeFirebase();

async function importData() {
  console.log("Importing data to Firebase Firestore...\n");

  try {
    // Read export file
    const exportPath = path.resolve(import.meta.dirname, "..", "data-export.json");
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found: ${exportPath}\nPlease run 'npm run export-data' first.`);
    }

    const exportData = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
    console.log(`✓ Loaded export file (exported at: ${exportData.exportedAt})`);

    // Note: This script requires an ownerId to import data
    // You need to provide the restaurant owner ID
    const ownerId = process.env.OWNER_ID || exportData.ownerId;
    
    if (!ownerId) {
      throw new Error("OWNER_ID is required. Set it in environment or provide in export file.");
    }

    console.log(`Importing data for owner: ${ownerId}`);

    // Import dishes
    if (exportData.dishes && exportData.dishes.length > 0) {
      const dishesRef = db.collection(COLLECTIONS.DISHES);
      let dishCount = 0;
      
      for (const dish of exportData.dishes) {
        const dishData = {
          name: dish.name,
          price: dish.price,
          category: dish.category,
          veg: dish.veg,
          image: dish.image,
          available: dish.available,
          ownerId: ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await dishesRef.add(dishData);
        dishCount++;
      }
      console.log(`✓ Imported ${dishCount} dishes`);
    }

    // Import customers
    if (exportData.customers && exportData.customers.length > 0) {
      const customersRef = db.collection(COLLECTIONS.CUSTOMERS);
      let customerCount = 0;
      
      for (const customer of exportData.customers) {
        const customerData = {
          name: customer.name,
          phone: customer.phone,
          lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
          lifetimeValue: customer.lifetimeValue || "0",
          ownerId: ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await customersRef.add(customerData);
        customerCount++;
      }
      console.log(`✓ Imported ${customerCount} customers`);
    }

    // Import tables
    if (exportData.tables && exportData.tables.length > 0) {
      const tablesRef = db.collection(COLLECTIONS.TABLES);
      let tableCount = 0;
      
      for (const table of exportData.tables) {
        const tableData = {
          number: table.number,
          capacity: table.capacity,
          status: table.status,
          ownerId: ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await tablesRef.add(tableData);
        tableCount++;
      }
      console.log(`✓ Imported ${tableCount} tables`);
    }

    // Import ingredients
    if (exportData.ingredients && exportData.ingredients.length > 0) {
      const ingredientsRef = db.collection(COLLECTIONS.INGREDIENTS);
      let ingredientCount = 0;
      
      for (const ingredient of exportData.ingredients) {
        const ingredientData = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          minQuantity: ingredient.minQuantity,
          ownerId: ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await ingredientsRef.add(ingredientData);
        ingredientCount++;
      }
      console.log(`✓ Imported ${ingredientCount} ingredients`);
    }

    console.log("\n✓ Data import complete!");
    console.log("\nNote: Orders and order items are not imported to avoid data conflicts.");
    console.log("Please create new orders through the application.");
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

