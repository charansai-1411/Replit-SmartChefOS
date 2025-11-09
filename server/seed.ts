import "dotenv/config";
import { db } from "./db";
import { dishes, customers, orders, orderItems } from "@shared/schema";
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
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        customerId: allCustomers[1]?.id || null,
        tableNumber: '12',
        guests: 4,
        type: 'dine-in',
        status: 'preparing',
        total: '0',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        customerId: allCustomers[2]?.id || null,
        tableNumber: null,
        guests: 1,
        type: 'takeaway',
        status: 'served',
        total: '0',
        createdAt: new Date(today.getTime() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        customerId: allCustomers[3]?.id || null,
        tableNumber: '08',
        guests: 3,
        type: 'dine-in',
        status: 'served',
        total: '0',
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        customerId: allCustomers[4]?.id || null,
        tableNumber: '03',
        guests: 2,
        type: 'dine-in',
        status: 'waitlist',
        total: '0',
        createdAt: new Date(),
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

    console.log("\n✓ Seeding complete!");
    console.log(`  - ${allDishes.length} dishes`);
    console.log(`  - ${allCustomers.length} customers`);
    console.log(`  - ${insertedOrders.length} orders`);
    console.log(`  - ${orderItemsData.length} order items`);
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
