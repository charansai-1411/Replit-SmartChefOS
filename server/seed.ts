import "dotenv/config";
import { db } from "./db";
import { dishes, customers, orders, orderItems, tables, ingredients, dishIngredients } from "@shared/schema";
import { eq } from "drizzle-orm";

const seedDishes = [
  { name: 'Paneer Butter Masala', price: '320', category: 'Paneer', veg: true, image: '/assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png', available: true },
  { name: 'Chicken Biryani', price: '450', category: 'Biryani', veg: false, image: '/assets/generated_images/Chicken_Biryani_dish_b8f84884.png', available: true },
  { name: 'Masala Dosa', price: '180', category: 'South Indian', veg: true, image: '/assets/generated_images/Masala_Dosa_breakfast_ea9368d7.png', available: true },
  { name: 'Dal Makhani', price: '280', category: 'Dal', veg: true, image: '/assets/generated_images/Dal_Makhani_dish_a3d3465f.png', available: true },
  { name: 'Chicken Tikka', price: '380', category: 'Starters', veg: false, image: '/assets/generated_images/Chicken_Tikka_appetizer_4e11fe1a.png', available: true },
  { name: 'Vegetable Korma', price: '300', category: 'Curry', veg: true, image: '/assets/generated_images/Vegetable_Korma_curry_15f74555.png', available: true },
  { name: 'Gulab Jamun', price: '120', category: 'Desserts', veg: true, image: '/assets/generated_images/Gulab_Jamun_dessert_982a82a2.png', available: true },
  { name: 'Butter Chicken', price: '420', category: 'Chicken', veg: false, image: '/assets/generated_images/Butter_Chicken_dish_96465dab.png', available: true },
];

const seedCustomers = [
  { name: 'Rajesh Kumar', phone: '+91 98765 43210', lastVisit: new Date(), lifetimeValue: '0' },
  { name: 'Priya Sharma', phone: '+91 98765 43211', lastVisit: new Date(), lifetimeValue: '0' },
  { name: 'Amit Patel', phone: '+91 98765 43212', lastVisit: new Date(), lifetimeValue: '0' },
  { name: 'Sneha Reddy', phone: '+91 98765 43213', lastVisit: new Date(), lifetimeValue: '0' },
  { name: 'Vikram Singh', phone: '+91 98765 43214', lastVisit: new Date(), lifetimeValue: '0' },
];

const seedTables = [
  // Garden section
  { number: '01', section: 'Garden', capacity: 4, status: 'available' },
  { number: '02', section: 'Garden', capacity: 6, status: 'available' },
  { number: '03', section: 'Garden', capacity: 2, status: 'occupied' },
  { number: '04', section: 'Garden', capacity: 4, status: 'available' },
  // Balcony section
  { number: '01', section: 'Balcony', capacity: 4, status: 'available' },
  { number: '02', section: 'Balcony', capacity: 2, status: 'reserved' },
  { number: '03', section: 'Balcony', capacity: 6, status: 'available' },
  // Open section
  { number: '01', section: 'Open', capacity: 4, status: 'available' },
  { number: '02', section: 'Open', capacity: 8, status: 'available' },
  { number: '03', section: 'Open', capacity: 4, status: 'cleaning' },
  { number: '04', section: 'Open', capacity: 2, status: 'available' },
  // Indoor section
  { number: '01', section: 'Indoor', capacity: 4, status: 'available' },
  { number: '02', section: 'Indoor', capacity: 6, status: 'occupied' },
  { number: '03', section: 'Indoor', capacity: 4, status: 'available' },
  // VIP section
  { number: '01', section: 'VIP', capacity: 8, status: 'available' },
  { number: '02', section: 'VIP', capacity: 10, status: 'reserved' },
];

const seedIngredients = [
  { name: 'Chicken', unit: 'kg', currentStock: '25.5', minLevel: '5.0' },
  { name: 'Paneer', unit: 'kg', currentStock: '12.0', minLevel: '3.0' },
  { name: 'Rice', unit: 'kg', currentStock: '50.0', minLevel: '10.0' },
  { name: 'Onions', unit: 'kg', currentStock: '8.5', minLevel: '2.0' },
  { name: 'Tomatoes', unit: 'kg', currentStock: '15.0', minLevel: '5.0' },
  { name: 'Ginger', unit: 'kg', currentStock: '2.5', minLevel: '0.5' },
  { name: 'Garlic', unit: 'kg', currentStock: '3.0', minLevel: '0.5' },
  { name: 'Cooking Oil', unit: 'l', currentStock: '20.0', minLevel: '5.0' },
  { name: 'Butter', unit: 'kg', currentStock: '4.5', minLevel: '1.0' },
  { name: 'Cream', unit: 'l', currentStock: '8.0', minLevel: '2.0' },
  { name: 'Spices Mix', unit: 'kg', currentStock: '5.0', minLevel: '1.0' },
  { name: 'Lentils (Dal)', unit: 'kg', currentStock: '10.0', minLevel: '2.0' },
  { name: 'Dosa Batter', unit: 'kg', currentStock: '6.0', minLevel: '2.0' },
  { name: 'Sugar', unit: 'kg', currentStock: '12.0', minLevel: '3.0' },
  { name: 'Milk', unit: 'l', currentStock: '15.0', minLevel: '5.0' },
  { name: 'Flour', unit: 'kg', currentStock: '18.0', minLevel: '5.0' },
  { name: 'Yogurt', unit: 'kg', currentStock: '7.5', minLevel: '2.0' },
  { name: 'Coriander', unit: 'kg', currentStock: '1.2', minLevel: '0.3' },
  { name: 'Mint', unit: 'kg', currentStock: '0.8', minLevel: '0.2' }, // Low stock
  { name: 'Cashews', unit: 'kg', currentStock: '3.5', minLevel: '1.0' },
];

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Insert dishes
    const insertedDishes = await db.insert(dishes).values(seedDishes).onConflictDoNothing().returning();
    console.log("✓ Dishes seeded successfully");

    // Get all dishes (including existing ones)
    const allDishes = await db.select().from(dishes);
    console.log(`✓ Found ${allDishes.length} dishes in database`);

    // Insert customers
    const insertedCustomers = await db.insert(customers).values(seedCustomers).onConflictDoNothing().returning();
    console.log("✓ Customers seeded successfully");

    // Get all customers
    const allCustomers = await db.select().from(customers);
    console.log(`✓ Found ${allCustomers.length} customers in database`);

    // Insert tables
    const insertedTables = await db.insert(tables).values(seedTables).onConflictDoNothing().returning();
    console.log("✓ Tables seeded successfully");
    console.log(`✓ Found ${insertedTables.length} tables in database`);

    // Insert ingredients
    const insertedIngredients = await db.insert(ingredients).values(seedIngredients).onConflictDoNothing().returning();
    console.log("✓ Ingredients seeded successfully");
    console.log(`✓ Found ${insertedIngredients.length} ingredients in database`);

    // Get all ingredients
    const allIngredients = await db.select().from(ingredients);

    // Create orders for today (so they show up in analytics)
    const today = new Date();
    const orderData = [
      {
        customerId: allCustomers[0]?.id || null,
        tableNumber: '05',
        guests: 2,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        customerId: allCustomers[1]?.id || null,
        tableNumber: '12',
        guests: 4,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        customerId: allCustomers[2]?.id || null,
        tableNumber: null,
        guests: 1,
        type: 'takeaway',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        customerId: allCustomers[3]?.id || null,
        tableNumber: '08',
        guests: 3,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        customerId: allCustomers[4]?.id || null,
        tableNumber: '03',
        guests: 2,
        type: 'dine-in',
        status: 'waitlist',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date(),
      },
      // Active orders for Online Orders page
      {
        customerId: allCustomers[0]?.id || null,
        tableNumber: '05',
        guests: 3,
        type: 'dine-in',
        status: 'pending',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date(today.getTime() - 10 * 60 * 1000), // 10 minutes ago
      },
      {
        customerId: allCustomers[1]?.id || null,
        tableNumber: null,
        guests: 2,
        type: 'takeaway',
        status: 'confirmed',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date(today.getTime() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        customerId: allCustomers[2]?.id || null,
        tableNumber: '08',
        guests: 4,
        type: 'dine-in',
        status: 'preparing',
        total: '0',
        kitchenStatus: 'sent',
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        customerId: allCustomers[3]?.id || null,
        tableNumber: '12',
        guests: 2,
        type: 'dine-in',
        status: 'preparing',
        total: '0',
        kitchenStatus: 'preparing',
        createdAt: new Date(today.getTime() - 20 * 60 * 1000), // 20 minutes ago
      },
    ];

    const insertedOrders = await db.insert(orders).values(orderData).returning();
    console.log("✓ Orders seeded successfully");

    // Create order items
    const orderItemsData = [];
    let customerTotals: Record<string, number> = {};

    // Order 1: Rajesh - served
    if (insertedOrders[0] && allDishes.length > 0) {
      const dish1 = allDishes.find(d => d.name === 'Butter Chicken') || allDishes[0];
      const dish2 = allDishes.find(d => d.name === 'Dal Makhani') || allDishes[3];
      const total1 = parseFloat(dish1.price) * 2 + parseFloat(dish2.price) * 1;
      orderItemsData.push(
        { orderId: insertedOrders[0].id, dishId: dish1.id, quantity: 2, price: dish1.price },
        { orderId: insertedOrders[0].id, dishId: dish2.id, quantity: 1, price: dish2.price },
      );
      await db.update(orders).set({ total: total1.toString() }).where(eq(orders.id, insertedOrders[0].id));
      if (insertedOrders[0].customerId) {
        customerTotals[insertedOrders[0].customerId] = (customerTotals[insertedOrders[0].customerId] || 0) + total1;
      }
    }

    // Order 2: Priya - preparing
    if (insertedOrders[1] && allDishes.length > 0) {
      const dish1 = allDishes.find(d => d.name === 'Chicken Biryani') || allDishes[1];
      const dish2 = allDishes.find(d => d.name === 'Paneer Butter Masala') || allDishes[0];
      const dish3 = allDishes.find(d => d.name === 'Gulab Jamun') || allDishes[6];
      const total2 = parseFloat(dish1.price) * 3 + parseFloat(dish2.price) * 2 + parseFloat(dish3.price) * 2;
      orderItemsData.push(
        { orderId: insertedOrders[1].id, dishId: dish1.id, quantity: 3, price: dish1.price },
        { orderId: insertedOrders[1].id, dishId: dish2.id, quantity: 2, price: dish2.price },
        { orderId: insertedOrders[1].id, dishId: dish3.id, quantity: 2, price: dish3.price },
      );
      await db.update(orders).set({ total: total2.toString() }).where(eq(orders.id, insertedOrders[1].id));
      if (insertedOrders[1].customerId) {
        customerTotals[insertedOrders[1].customerId] = (customerTotals[insertedOrders[1].customerId] || 0) + total2;
      }
    }

    // Order 3: Amit - takeaway
    if (insertedOrders[2] && allDishes.length > 0) {
      const dish1 = allDishes.find(d => d.name === 'Masala Dosa') || allDishes[2];
      const total3 = parseFloat(dish1.price) * 2;
      orderItemsData.push(
        { orderId: insertedOrders[2].id, dishId: dish1.id, quantity: 2, price: dish1.price },
      );
      await db.update(orders).set({ total: total3.toString() }).where(eq(orders.id, insertedOrders[2].id));
      if (insertedOrders[2].customerId) {
        customerTotals[insertedOrders[2].customerId] = (customerTotals[insertedOrders[2].customerId] || 0) + total3;
      }
    }

    // Order 4: Sneha - served
    if (insertedOrders[3] && allDishes.length > 0) {
      const dish1 = allDishes.find(d => d.name === 'Chicken Tikka') || allDishes[4];
      const dish2 = allDishes.find(d => d.name === 'Vegetable Korma') || allDishes[5];
      const total4 = parseFloat(dish1.price) * 1 + parseFloat(dish2.price) * 2;
      orderItemsData.push(
        { orderId: insertedOrders[3].id, dishId: dish1.id, quantity: 1, price: dish1.price },
        { orderId: insertedOrders[3].id, dishId: dish2.id, quantity: 2, price: dish2.price },
      );
      await db.update(orders).set({ total: total4.toString() }).where(eq(orders.id, insertedOrders[3].id));
      if (insertedOrders[3].customerId) {
        customerTotals[insertedOrders[3].customerId] = (customerTotals[insertedOrders[3].customerId] || 0) + total4;
      }
    }

    // Order 5: Vikram - waitlist
    if (insertedOrders[4] && allDishes.length > 0) {
      const dish1 = allDishes.find(d => d.name === 'Butter Chicken') || allDishes[7];
      const total5 = parseFloat(dish1.price) * 1;
      orderItemsData.push(
        { orderId: insertedOrders[4].id, dishId: dish1.id, quantity: 1, price: dish1.price },
      );
      await db.update(orders).set({ total: total5.toString() }).where(eq(orders.id, insertedOrders[4].id));
      if (insertedOrders[4].customerId) {
        customerTotals[insertedOrders[4].customerId] = (customerTotals[insertedOrders[4].customerId] || 0) + total5;
      }
    }

    // Insert order items
    if (orderItemsData.length > 0) {
      await db.insert(orderItems).values(orderItemsData);
      console.log(`✓ ${orderItemsData.length} order items seeded successfully`);
    }

    // Update customer lifetime values
    for (const [customerId, total] of Object.entries(customerTotals)) {
      await db.update(customers)
        .set({ lifetimeValue: total.toString() })
        .where(eq(customers.id, customerId));
    }
    console.log("✓ Customer lifetime values updated");

    // Create dish ingredients relationships
    const dishIngredientData = [];
    if (allDishes.length > 0 && allIngredients.length > 0) {
      // Butter Chicken ingredients
      const butterChicken = allDishes.find(d => d.name === 'Butter Chicken');
      if (butterChicken) {
        const chicken = allIngredients.find(i => i.name === 'Chicken');
        const tomatoes = allIngredients.find(i => i.name === 'Tomatoes');
        const butter = allIngredients.find(i => i.name === 'Butter');
        const cream = allIngredients.find(i => i.name === 'Cream');
        const spices = allIngredients.find(i => i.name === 'Spices Mix');
        if (chicken) dishIngredientData.push({ dishId: butterChicken.id, ingredientId: chicken.id, quantity: '0.5' });
        if (tomatoes) dishIngredientData.push({ dishId: butterChicken.id, ingredientId: tomatoes.id, quantity: '0.3' });
        if (butter) dishIngredientData.push({ dishId: butterChicken.id, ingredientId: butter.id, quantity: '0.1' });
        if (cream) dishIngredientData.push({ dishId: butterChicken.id, ingredientId: cream.id, quantity: '0.2' });
        if (spices) dishIngredientData.push({ dishId: butterChicken.id, ingredientId: spices.id, quantity: '0.05' });
      }

      // Paneer Butter Masala ingredients
      const paneerMasala = allDishes.find(d => d.name === 'Paneer Butter Masala');
      if (paneerMasala) {
        const paneer = allIngredients.find(i => i.name === 'Paneer');
        const tomatoes = allIngredients.find(i => i.name === 'Tomatoes');
        const butter = allIngredients.find(i => i.name === 'Butter');
        const cream = allIngredients.find(i => i.name === 'Cream');
        const spices = allIngredients.find(i => i.name === 'Spices Mix');
        if (paneer) dishIngredientData.push({ dishId: paneerMasala.id, ingredientId: paneer.id, quantity: '0.3' });
        if (tomatoes) dishIngredientData.push({ dishId: paneerMasala.id, ingredientId: tomatoes.id, quantity: '0.2' });
        if (butter) dishIngredientData.push({ dishId: paneerMasala.id, ingredientId: butter.id, quantity: '0.08' });
        if (cream) dishIngredientData.push({ dishId: paneerMasala.id, ingredientId: cream.id, quantity: '0.15' });
        if (spices) dishIngredientData.push({ dishId: paneerMasala.id, ingredientId: spices.id, quantity: '0.04' });
      }

      // Chicken Biryani ingredients
      const biryani = allDishes.find(d => d.name === 'Chicken Biryani');
      if (biryani) {
        const chicken = allIngredients.find(i => i.name === 'Chicken');
        const rice = allIngredients.find(i => i.name === 'Rice');
        const onions = allIngredients.find(i => i.name === 'Onions');
        const spices = allIngredients.find(i => i.name === 'Spices Mix');
        const oil = allIngredients.find(i => i.name === 'Cooking Oil');
        if (chicken) dishIngredientData.push({ dishId: biryani.id, ingredientId: chicken.id, quantity: '0.4' });
        if (rice) dishIngredientData.push({ dishId: biryani.id, ingredientId: rice.id, quantity: '0.3' });
        if (onions) dishIngredientData.push({ dishId: biryani.id, ingredientId: onions.id, quantity: '0.2' });
        if (spices) dishIngredientData.push({ dishId: biryani.id, ingredientId: spices.id, quantity: '0.06' });
        if (oil) dishIngredientData.push({ dishId: biryani.id, ingredientId: oil.id, quantity: '0.1' });
      }

      // Masala Dosa ingredients
      const dosa = allDishes.find(d => d.name === 'Masala Dosa');
      if (dosa) {
        const batter = allIngredients.find(i => i.name === 'Dosa Batter');
        const potatoes = allIngredients.find(i => i.name === 'Onions');
        const oil = allIngredients.find(i => i.name === 'Cooking Oil');
        if (batter) dishIngredientData.push({ dishId: dosa.id, ingredientId: batter.id, quantity: '0.2' });
        if (potatoes) dishIngredientData.push({ dishId: dosa.id, ingredientId: potatoes.id, quantity: '0.1' });
        if (oil) dishIngredientData.push({ dishId: dosa.id, ingredientId: oil.id, quantity: '0.05' });
      }

      // Dal Makhani ingredients
      const dal = allDishes.find(d => d.name === 'Dal Makhani');
      if (dal) {
        const lentils = allIngredients.find(i => i.name === 'Lentils (Dal)');
        const butter = allIngredients.find(i => i.name === 'Butter');
        const cream = allIngredients.find(i => i.name === 'Cream');
        const spices = allIngredients.find(i => i.name === 'Spices Mix');
        if (lentils) dishIngredientData.push({ dishId: dal.id, ingredientId: lentils.id, quantity: '0.25' });
        if (butter) dishIngredientData.push({ dishId: dal.id, ingredientId: butter.id, quantity: '0.05' });
        if (cream) dishIngredientData.push({ dishId: dal.id, ingredientId: cream.id, quantity: '0.1' });
        if (spices) dishIngredientData.push({ dishId: dal.id, ingredientId: spices.id, quantity: '0.03' });
      }

      // Add ingredients for a few more dishes
      const chickenTikka = allDishes.find(d => d.name === 'Chicken Tikka');
      if (chickenTikka) {
        const chicken = allIngredients.find(i => i.name === 'Chicken');
        const yogurt = allIngredients.find(i => i.name === 'Yogurt');
        const spices = allIngredients.find(i => i.name === 'Spices Mix');
        if (chicken) dishIngredientData.push({ dishId: chickenTikka.id, ingredientId: chicken.id, quantity: '0.3' });
        if (yogurt) dishIngredientData.push({ dishId: chickenTikka.id, ingredientId: yogurt.id, quantity: '0.15' });
        if (spices) dishIngredientData.push({ dishId: chickenTikka.id, ingredientId: spices.id, quantity: '0.05' });
      }

      const gulabJamun = allDishes.find(d => d.name === 'Gulab Jamun');
      if (gulabJamun) {
        const flour = allIngredients.find(i => i.name === 'Flour');
        const sugar = allIngredients.find(i => i.name === 'Sugar');
        const milk = allIngredients.find(i => i.name === 'Milk');
        if (flour) dishIngredientData.push({ dishId: gulabJamun.id, ingredientId: flour.id, quantity: '0.1' });
        if (sugar) dishIngredientData.push({ dishId: gulabJamun.id, ingredientId: sugar.id, quantity: '0.15' });
        if (milk) dishIngredientData.push({ dishId: gulabJamun.id, ingredientId: milk.id, quantity: '0.1' });
      }
    }

    if (dishIngredientData.length > 0) {
      await db.insert(dishIngredients).values(dishIngredientData).onConflictDoNothing();
      console.log(`✓ ${dishIngredientData.length} dish ingredients seeded successfully`);
    }

    // Create order items for active orders
    const activeOrderItems = [];
    if (insertedOrders.length >= 5 && allDishes.length > 0) {
      // Order 5 (active - pending)
      const activeOrder1 = insertedOrders[4];
      if (activeOrder1) {
        const dish1 = allDishes.find(d => d.name === 'Butter Chicken') || allDishes[0];
        const dish2 = allDishes.find(d => d.name === 'Dal Makhani') || allDishes[3];
        const total1 = parseFloat(dish1.price) * 1 + parseFloat(dish2.price) * 1;
        activeOrderItems.push(
          { orderId: activeOrder1.id, dishId: dish1.id, quantity: 1, price: dish1.price },
          { orderId: activeOrder1.id, dishId: dish2.id, quantity: 1, price: dish2.price },
        );
        await db.update(orders).set({ total: total1.toString() }).where(eq(orders.id, activeOrder1.id));
      }

      // Order 6 (active - pending)
      if (insertedOrders[5]) {
        const dish1 = allDishes.find(d => d.name === 'Chicken Biryani') || allDishes[1];
        const dish2 = allDishes.find(d => d.name === 'Gulab Jamun') || allDishes[6];
        const total2 = parseFloat(dish1.price) * 2 + parseFloat(dish2.price) * 2;
        activeOrderItems.push(
          { orderId: insertedOrders[5].id, dishId: dish1.id, quantity: 2, price: dish1.price },
          { orderId: insertedOrders[5].id, dishId: dish2.id, quantity: 2, price: dish2.price },
        );
        await db.update(orders).set({ total: total2.toString() }).where(eq(orders.id, insertedOrders[5].id));
      }

      // Order 7 (active - sent to kitchen)
      if (insertedOrders[6]) {
        const dish1 = allDishes.find(d => d.name === 'Paneer Butter Masala') || allDishes[0];
        const dish2 = allDishes.find(d => d.name === 'Vegetable Korma') || allDishes[5];
        const total3 = parseFloat(dish1.price) * 2 + parseFloat(dish2.price) * 1;
        activeOrderItems.push(
          { orderId: insertedOrders[6].id, dishId: dish1.id, quantity: 2, price: dish1.price },
          { orderId: insertedOrders[6].id, dishId: dish2.id, quantity: 1, price: dish2.price },
        );
        await db.update(orders).set({ total: total3.toString() }).where(eq(orders.id, insertedOrders[6].id));
      }

      // Order 8 (active - preparing)
      if (insertedOrders[7]) {
        const dish1 = allDishes.find(d => d.name === 'Chicken Tikka') || allDishes[4];
        const dish2 = allDishes.find(d => d.name === 'Masala Dosa') || allDishes[2];
        const total4 = parseFloat(dish1.price) * 1 + parseFloat(dish2.price) * 2;
        activeOrderItems.push(
          { orderId: insertedOrders[7].id, dishId: dish1.id, quantity: 1, price: dish1.price },
          { orderId: insertedOrders[7].id, dishId: dish2.id, quantity: 2, price: dish2.price },
        );
        await db.update(orders).set({ total: total4.toString() }).where(eq(orders.id, insertedOrders[7].id));
      }
    }

    if (activeOrderItems.length > 0) {
      await db.insert(orderItems).values(activeOrderItems);
      console.log(`✓ ${activeOrderItems.length} active order items seeded successfully`);
    }

    console.log("\n✓ Seeding complete!");
    console.log(`  - ${allDishes.length} dishes`);
    console.log(`  - ${allCustomers.length} customers`);
    console.log(`  - ${insertedOrders.length} orders`);
    console.log(`  - ${orderItemsData.length + activeOrderItems.length} order items`);
    console.log(`  - ${allIngredients.length} ingredients`);
    console.log(`  - ${dishIngredientData.length} dish ingredients`);
  } catch (error) {
    console.error("Seeding error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
  
  process.exit(0);
}

seed();
