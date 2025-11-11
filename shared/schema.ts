import { z } from "zod";

// Firebase Firestore Types
export interface Dish {
  id: string;
  name: string;
  price: string;
  category: string;
  veg: boolean;
  image: string | null;
  available: boolean;
  // Platform-specific availability
  availableOnRestaurant?: boolean;
  availableOnZomato?: boolean;
  availableOnSwiggy?: boolean;
  availableOnOther?: boolean;
}

export interface Order {
  id: string;
  customerId: string | null;
  tableNumber: string | null;
  guests: number;
  type: string;
  status: string;
  kitchenStatus: string; // pending, sent, preparing, ready
  total: string;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  quantity: number;
  price: string;
  notes: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastVisit: Date | null;
  lifetimeValue: string;
}

export interface Table {
  id: string;
  number: string;
  section: string;
  capacity: number;
  status: string; // available, occupied, reserved, cleaning
  createdAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string; // kg, g, l, ml, pieces, etc.
  currentStock: string;
  minLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DishIngredient {
  id: string;
  dishId: string;
  ingredientId: string;
  quantity: string;
  createdAt: Date;
}

export interface RestaurantOwner {
  id: string;
  email: string;
  password: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  address: string;
  cuisine: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod Schemas for validation
export const insertDishSchema = z.object({
  name: z.string().min(1),
  price: z.string(),
  category: z.string().min(1),
  veg: z.boolean().default(true),
  image: z.string().nullable().optional(),
  available: z.boolean().default(true),
  availableOnRestaurant: z.boolean().optional().default(true),
  availableOnZomato: z.boolean().optional().default(true),
  availableOnSwiggy: z.boolean().optional().default(true),
  availableOnOther: z.boolean().optional().default(true),
});

export const updateDishSchema = insertDishSchema.partial();

export const insertOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  tableNumber: z.string().nullable().optional(),
  guests: z.number().default(1),
  type: z.string().min(1),
  status: z.string().min(1),
  kitchenStatus: z.string().default("pending"),
  total: z.string().default("0"),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().min(1),
  dishId: z.string().min(1),
  quantity: z.number().min(1),
  price: z.string(),
  notes: z.string().nullable().optional(),
});

export const insertCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  lastVisit: z.date().nullable().optional(),
  lifetimeValue: z.string().default("0"),
});

export const updateCustomerSchema = insertCustomerSchema.partial();

export const insertTableSchema = z.object({
  number: z.string().min(1),
  section: z.string().min(1),
  capacity: z.number().default(4),
  status: z.string().default("available"),
});

export const updateTableSchema = insertTableSchema.partial();

export const insertIngredientSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  currentStock: z.string().default("0"),
  minLevel: z.string().default("0"),
});

export const updateIngredientSchema = insertIngredientSchema.partial();

export const insertDishIngredientSchema = z.object({
  dishId: z.string().min(1),
  ingredientId: z.string().min(1),
  quantity: z.string(),
});

export const updateDishIngredientSchema = insertDishIngredientSchema.partial();

export const insertRestaurantOwnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(1),
  ownerName: z.string().min(1),
  phone: z.string().min(10),
  address: z.string().min(1),
  cuisine: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateRestaurantOwnerSchema = z.object({
  restaurantName: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(1).optional(),
  cuisine: z.string().min(1).optional(),
});

// Type exports for Insert operations
export type InsertDish = z.infer<typeof insertDishSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type InsertDishIngredient = z.infer<typeof insertDishIngredientSchema>;
export type InsertRestaurantOwner = z.infer<typeof insertRestaurantOwnerSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Collection names
export const COLLECTIONS = {
  DISHES: 'dishes',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  CUSTOMERS: 'customers',
  TABLES: 'tables',
  INGREDIENTS: 'ingredients',
  DISH_INGREDIENTS: 'dishIngredients',
  RESTAURANT_OWNERS: 'restaurantOwners',
} as const;
