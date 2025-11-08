import { db } from "./db";
import { dishes } from "@shared/schema";

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

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Insert dishes
    await db.insert(dishes).values(seedDishes).onConflictDoNothing();
    console.log("✓ Dishes seeded successfully");
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
