import "dotenv/config";
import { initializeFirebase } from "./firebase";
import { COLLECTIONS } from "@shared/schema";

const db = initializeFirebase();

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
  { name: 'Rajesh Kumar', phone: '+91 98765 43210', lastVisit: new Date().toISOString(), lifetimeValue: '0' },
  { name: 'Priya Sharma', phone: '+91 98765 43211', lastVisit: new Date().toISOString(), lifetimeValue: '0' },
  { name: 'Amit Patel', phone: '+91 98765 43212', lastVisit: new Date().toISOString(), lifetimeValue: '0' },
  { name: 'Sneha Reddy', phone: '+91 98765 43213', lastVisit: new Date().toISOString(), lifetimeValue: '0' },
  { name: 'Vikram Singh', phone: '+91 98765 43214', lastVisit: new Date().toISOString(), lifetimeValue: '0' },
];

const seedTables = [
  // Garden section
  { number: '01', section: 'Garden', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  { number: '02', section: 'Garden', capacity: 6, status: 'available', createdAt: new Date().toISOString() },
  { number: '03', section: 'Garden', capacity: 2, status: 'occupied', createdAt: new Date().toISOString() },
  { number: '04', section: 'Garden', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  // Balcony section
  { number: '01', section: 'Balcony', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  { number: '02', section: 'Balcony', capacity: 2, status: 'reserved', createdAt: new Date().toISOString() },
  { number: '03', section: 'Balcony', capacity: 6, status: 'available', createdAt: new Date().toISOString() },
  // Open section
  { number: '01', section: 'Open', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  { number: '02', section: 'Open', capacity: 8, status: 'available', createdAt: new Date().toISOString() },
  { number: '03', section: 'Open', capacity: 4, status: 'cleaning', createdAt: new Date().toISOString() },
  { number: '04', section: 'Open', capacity: 2, status: 'available', createdAt: new Date().toISOString() },
  // Indoor section
  { number: '01', section: 'Indoor', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  { number: '02', section: 'Indoor', capacity: 6, status: 'occupied', createdAt: new Date().toISOString() },
  { number: '03', section: 'Indoor', capacity: 4, status: 'available', createdAt: new Date().toISOString() },
  // VIP section
  { number: '01', section: 'VIP', capacity: 8, status: 'available', createdAt: new Date().toISOString() },
  { number: '02', section: 'VIP', capacity: 10, status: 'reserved', createdAt: new Date().toISOString() },
];

const seedIngredients = [
  { name: 'Chicken', unit: 'kg', currentStock: '25.5', minLevel: '5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Paneer', unit: 'kg', currentStock: '12.0', minLevel: '3.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Rice', unit: 'kg', currentStock: '50.0', minLevel: '10.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Onions', unit: 'kg', currentStock: '8.5', minLevel: '2.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Tomatoes', unit: 'kg', currentStock: '15.0', minLevel: '5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Ginger', unit: 'kg', currentStock: '2.5', minLevel: '0.5', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Garlic', unit: 'kg', currentStock: '3.0', minLevel: '0.5', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Cooking Oil', unit: 'l', currentStock: '20.0', minLevel: '5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Butter', unit: 'kg', currentStock: '4.5', minLevel: '1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Cream', unit: 'l', currentStock: '8.0', minLevel: '2.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Spices Mix', unit: 'kg', currentStock: '5.0', minLevel: '1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Lentils (Dal)', unit: 'kg', currentStock: '10.0', minLevel: '2.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Dosa Batter', unit: 'kg', currentStock: '6.0', minLevel: '2.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Sugar', unit: 'kg', currentStock: '12.0', minLevel: '3.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Milk', unit: 'l', currentStock: '15.0', minLevel: '5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Flour', unit: 'kg', currentStock: '18.0', minLevel: '5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Yogurt', unit: 'kg', currentStock: '7.5', minLevel: '2.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Coriander', unit: 'kg', currentStock: '1.2', minLevel: '0.3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { name: 'Mint', unit: 'kg', currentStock: '0.8', minLevel: '0.2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, // Low stock
  { name: 'Cashews', unit: 'kg', currentStock: '3.5', minLevel: '1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

async function seed() {
  console.log("Seeding Firebase Realtime Database...");
  
  try {
    // Insert dishes
    console.log("Seeding dishes...");
    const dishIds: string[] = [];
    for (const dish of seedDishes) {
      const docRef = await db.ref(COLLECTIONS.DISHES).push(dish);
      dishIds.push(docRef.key);
    }
    console.log(`✓ ${dishIds.length} dishes seeded successfully`);

    // Insert customers
    console.log("Seeding customers...");
    const customerIds: string[] = [];
    for (const customer of seedCustomers) {
      const docRef = await db.ref(COLLECTIONS.CUSTOMERS).push(customer);
      customerIds.push(docRef.key);
    }
    console.log(`✓ ${customerIds.length} customers seeded successfully`);

    // Insert tables
    console.log("Seeding tables...");
    const tableIds: string[] = [];
    for (const table of seedTables) {
      const docRef = await db.ref(COLLECTIONS.TABLES).push(table);
      tableIds.push(docRef.key);
    }
    console.log(`✓ ${tableIds.length} tables seeded successfully`);

    // Insert ingredients
    console.log("Seeding ingredients...");
    const ingredientIds: string[] = [];
    for (const ingredient of seedIngredients) {
      const docRef = await db.ref(COLLECTIONS.INGREDIENTS).push(ingredient);
      ingredientIds.push(docRef.key);
    }
    console.log(`✓ ${ingredientIds.length} ingredients seeded successfully`);

    // Create orders for today (so they show up in analytics)
    console.log("Seeding orders...");
    const today = new Date();
    const orderData = [
      {
        customerId: customerIds[0] || null,
        tableNumber: '05',
        guests: 2,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        customerId: customerIds[1] || null,
        tableNumber: '12',
        guests: 4,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        customerId: customerIds[2] || null,
        tableNumber: null,
        guests: 1,
        type: 'takeaway',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        customerId: customerIds[3] || null,
        tableNumber: '08',
        guests: 3,
        type: 'dine-in',
        status: 'served',
        total: '0',
        kitchenStatus: 'ready',
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        customerId: customerIds[4] || null,
        tableNumber: '03',
        guests: 2,
        type: 'dine-in',
        status: 'waitlist',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
      // Active orders for Online Orders page
      {
        customerId: customerIds[0] || null,
        tableNumber: '05',
        guests: 3,
        type: 'dine-in',
        status: 'pending',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date(today.getTime() - 10 * 60 * 1000), // 10 minutes ago
      },
      {
        customerId: customerIds[1] || null,
        tableNumber: null,
        guests: 2,
        type: 'takeaway',
        status: 'confirmed',
        total: '0',
        kitchenStatus: 'pending',
        createdAt: new Date(today.getTime() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        customerId: customerIds[2] || null,
        tableNumber: '08',
        guests: 4,
        type: 'dine-in',
        status: 'preparing',
        total: '0',
        kitchenStatus: 'sent',
        createdAt: new Date(today.getTime() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        customerId: customerIds[3] || null,
        tableNumber: '12',
        guests: 2,
        type: 'dine-in',
        status: 'preparing',
        total: '0',
        kitchenStatus: 'preparing',
        createdAt: new Date(today.getTime() - 20 * 60 * 1000), // 20 minutes ago
      },
    ];

    const orderIds: string[] = [];
    for (const order of orderData) {
      const docRef = await db.ref(COLLECTIONS.ORDERS).push(order);
      orderIds.push(docRef.key);
    }
    console.log(`✓ ${orderIds.length} orders seeded successfully`);

    // Create order items for each order
    console.log("Seeding order items...");
    let itemCount = 0;
    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      // Add 2-3 random dishes to each order
      const numItems = Math.floor(Math.random() * 2) + 2;
      let orderTotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomDishIndex = Math.floor(Math.random() * dishIds.length);
        const dishId = dishIds[randomDishIndex];
        const dish = seedDishes[randomDishIndex];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        await db.ref(COLLECTIONS.ORDER_ITEMS).push({
          orderId,
          dishId,
          quantity,
          price: dish.price,
          notes: null,
        });
        
        orderTotal += parseFloat(dish.price) * quantity;
        itemCount++;
      }
      
      // Update order total
      await db.ref(`${COLLECTIONS.ORDERS}/${orderId}`).update({
          total: orderTotal.toString(),
      });
    }
    console.log(`✓ ${itemCount} order items seeded successfully`);

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
