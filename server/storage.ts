import { 
  type Dish, 
  type InsertDish,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Customer,
  type InsertCustomer,
  type Table,
  type InsertTable,
  type Ingredient,
  type InsertIngredient,
  type DishIngredient,
  type InsertDishIngredient,
  type RestaurantOwner,
  type InsertRestaurantOwner,
  type LoginCredentials,
  COLLECTIONS
} from "@shared/schema";
import { initializeFirebase, Timestamp } from "./firebase";
import * as crypto from "crypto";

const db = initializeFirebase();

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to verify passwords
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export interface IStorage {
  // Dishes
  getAllDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<void>;
  
  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByTableNumber(tableNumber: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Tables
  getAllTables(): Promise<Table[]>;
  getTable(id: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, table: Partial<InsertTable>): Promise<Table | undefined>;
  deleteTable(id: string): Promise<void>;
  
  // Analytics
  getDailySales(): Promise<number>;
  getOrderCount(): Promise<number>;
  getAverageTicket(): Promise<number>;
  getTopDishes(limit?: number): Promise<Array<{ dishId: string; name: string; image: string | null; orders: number }>>;
  
  // Ingredients
  getAllIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined>;
  deleteIngredient(id: string): Promise<void>;
  updateIngredientStock(id: string, quantity: number): Promise<Ingredient | undefined>;
  getLowStockIngredients(): Promise<Ingredient[]>;
  
  // Dish Ingredients
  getDishIngredients(dishId: string): Promise<Array<DishIngredient & { ingredient: Ingredient }>>;
  addDishIngredient(dishIngredient: InsertDishIngredient): Promise<DishIngredient>;
  removeDishIngredient(id: string): Promise<void>;
  updateDishIngredient(id: string, dishIngredient: Partial<InsertDishIngredient>): Promise<DishIngredient | undefined>;
  
  // Orders - Kitchen
  getActiveOrders(): Promise<Order[]>;
  updateOrderKitchenStatus(id: string, kitchenStatus: string): Promise<Order | undefined>;
  getKOTOrders(): Promise<Array<Order & { items: Array<OrderItem & { dish: Dish }> }>>;
  
  // Authentication
  registerOwner(owner: InsertRestaurantOwner): Promise<Omit<RestaurantOwner, 'password'>>;
  loginOwner(credentials: LoginCredentials): Promise<Omit<RestaurantOwner, 'password'> | null>;
  getOwnerByEmail(email: string): Promise<RestaurantOwner | undefined>;
  getOwnerById(id: string): Promise<Omit<RestaurantOwner, 'password'> | undefined>;
  updateOwnerProfile(id: string, updates: Partial<Omit<InsertRestaurantOwner, 'email' | 'password'>>): Promise<Omit<RestaurantOwner, 'password'> | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Dishes
  async getAllDishes(): Promise<Dish[]> {
    const snapshot = await db.collection(COLLECTIONS.DISHES).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Dish));
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const doc = await db.collection(COLLECTIONS.DISHES).doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Dish;
  }

  async createDish(dish: InsertDish): Promise<Dish> {
    const dishData = { ...dish, image: dish.image ?? null };
    const docRef = await db.collection(COLLECTIONS.DISHES).add(dishData);
    return { id: docRef.id, ...dishData };
  }

  async updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
    const docRef = db.collection(COLLECTIONS.DISHES).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    await docRef.update(dish);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as Dish;
  }

  async deleteDish(id: string): Promise<void> {
    await db.collection(COLLECTIONS.DISHES).doc(id).delete();
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order;
    });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const doc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Order;
  }

  async getOrdersByTableNumber(tableNumber: string): Promise<Order[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.tableNumber === tableNumber);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderData = {
      customerId: order.customerId ?? null,
      tableNumber: order.tableNumber ?? null,
      guests: order.guests,
      type: order.type,
      status: order.status,
      kitchenStatus: order.kitchenStatus,
      total: order.total,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await db.collection(COLLECTIONS.ORDERS).add(orderData);
    return {
      id: docRef.id,
      ...orderData,
      createdAt: orderData.createdAt.toDate(),
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    await docRef.update({ status });
    return this.getOrder(id);
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const snapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', orderId)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as OrderItem));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const itemData = {
      orderId: item.orderId,
      dishId: item.dishId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes ?? null,
    };
    
    const docRef = await db.collection(COLLECTIONS.ORDER_ITEMS).add(itemData);
    return { id: docRef.id, ...itemData };
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const snapshot = await db.collection(COLLECTIONS.CUSTOMERS).get();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastVisit: data.lastVisit?.toDate() || null,
        } as Customer;
      })
      .sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return b.lastVisit.getTime() - a.lastVisit.getTime();
      });
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const doc = await db.collection(COLLECTIONS.CUSTOMERS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      lastVisit: data.lastVisit?.toDate() || null,
    } as Customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customerData = {
      ...customer,
      lastVisit: customer.lastVisit ? Timestamp.fromDate(customer.lastVisit) : null,
    };
    
    const docRef = await db.collection(COLLECTIONS.CUSTOMERS).add(customerData);
    return {
      id: docRef.id,
      name: customer.name,
      phone: customer.phone,
      lifetimeValue: customer.lifetimeValue,
      lastVisit: customer.lastVisit || null,
    };
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const docRef = db.collection(COLLECTIONS.CUSTOMERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    const updateData: any = { ...customer };
    if (customer.lastVisit) {
      updateData.lastVisit = Timestamp.fromDate(customer.lastVisit);
    }
    
    await docRef.update(updateData);
    return this.getCustomer(id);
  }

  // Tables
  async getAllTables(): Promise<Table[]> {
    const snapshot = await db.collection(COLLECTIONS.TABLES).get();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Table;
      })
      .sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section);
        return a.number.localeCompare(b.number);
      });
  }

  async getTable(id: string): Promise<Table | undefined> {
    const doc = await db.collection(COLLECTIONS.TABLES).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Table;
  }

  async createTable(table: InsertTable): Promise<Table> {
    // Check for duplicate table number in the same section
    const existingSnapshot = await db.collection(COLLECTIONS.TABLES)
      .where('number', '==', table.number)
      .where('section', '==', table.section)
      .get();
    
    if (!existingSnapshot.empty) {
      throw new Error(`Table ${table.number} already exists in ${table.section} section`);
    }
    
    const tableData = {
      ...table,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await db.collection(COLLECTIONS.TABLES).add(tableData);
    return {
      id: docRef.id,
      ...tableData,
      createdAt: tableData.createdAt.toDate(),
    };
  }

  async updateTable(id: string, table: Partial<InsertTable>): Promise<Table | undefined> {
    const docRef = db.collection(COLLECTIONS.TABLES).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    const existing = doc.data() as Table;
    
    // Check for duplicate table number in the same section (excluding current table)
    if (table.number || table.section) {
      const numberToCheck = table.number || existing.number;
      const sectionToCheck = table.section || existing.section;
      
      const duplicateSnapshot = await db.collection(COLLECTIONS.TABLES)
        .where('number', '==', numberToCheck)
        .where('section', '==', sectionToCheck)
        .get();
      
      const duplicate = duplicateSnapshot.docs.find(d => d.id !== id);
      if (duplicate) {
        throw new Error(`Table ${numberToCheck} already exists in ${sectionToCheck} section`);
      }
    }
    
    await docRef.update(table);
    return this.getTable(id);
  }

  async deleteTable(id: string): Promise<void> {
    await db.collection(COLLECTIONS.TABLES).doc(id).delete();
  }

  // Analytics
  async getDailySales(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(today))
      .get();
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      total += parseFloat(data.total || '0');
    });
    
    return total;
  }

  async getOrderCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(today))
      .get();
    
    return snapshot.size;
  }

  async getAverageTicket(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(today))
      .get();
    
    if (snapshot.empty) return 0;
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      total += parseFloat(data.total || '0');
    });
    
    return total / snapshot.size;
  }

  async getTopDishes(limit: number = 3): Promise<Array<{ dishId: string; name: string; image: string | null; orders: number }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's orders
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(today))
      .get();
    
    if (ordersSnapshot.empty) return [];
    
    const orderIds = ordersSnapshot.docs.map(doc => doc.id);
    
    // Get all order items for today's orders (batch in groups of 10 due to Firestore 'in' limitation)
    const dishCounts = new Map<string, Set<string>>();
    
    for (let i = 0; i < orderIds.length; i += 10) {
      const batch = orderIds.slice(i, i + 10);
      const itemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', 'in', batch)
        .get();
      
      itemsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!dishCounts.has(data.dishId)) {
          dishCounts.set(data.dishId, new Set());
        }
        dishCounts.get(data.dishId)!.add(data.orderId);
      });
    }
    
    // Get dish details
    const dishIds = Array.from(dishCounts.keys());
    const dishes = new Map<string, any>();
    
    for (let i = 0; i < dishIds.length; i += 10) {
      const batch = dishIds.slice(i, i + 10);
      const dishesSnapshot = await db.collection(COLLECTIONS.DISHES)
        .where('__name__', 'in', batch)
        .get();
      
      dishesSnapshot.docs.forEach(doc => {
        dishes.set(doc.id, doc.data());
      });
    }
    
    // Sort and return top dishes
    return Array.from(dishCounts.entries())
      .map(([dishId, orderIds]) => {
        const dish = dishes.get(dishId);
        return {
          dishId,
          name: dish?.name || 'Unknown',
          image: dish?.image || null,
          orders: orderIds.size,
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);
  }

  // Ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    const snapshot = await db.collection(COLLECTIONS.INGREDIENTS).get();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Ingredient;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    const doc = await db.collection(COLLECTIONS.INGREDIENTS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Ingredient;
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const now = Timestamp.now();
    const ingredientData = {
      ...ingredient,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await db.collection(COLLECTIONS.INGREDIENTS).add(ingredientData);
    return {
      id: docRef.id,
      ...ingredientData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  async updateIngredient(id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const docRef = db.collection(COLLECTIONS.INGREDIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    const updateData = {
      ...ingredient,
      updatedAt: Timestamp.now(),
    };
    
    await docRef.update(updateData);
    return this.getIngredient(id);
  }

  async deleteIngredient(id: string): Promise<void> {
    await db.collection(COLLECTIONS.INGREDIENTS).doc(id).delete();
  }

  async updateIngredientStock(id: string, quantity: number): Promise<Ingredient | undefined> {
    const ingredient = await this.getIngredient(id);
    if (!ingredient) return undefined;
    
    const newStock = parseFloat(ingredient.currentStock) + quantity;
    await db.collection(COLLECTIONS.INGREDIENTS).doc(id).update({
      currentStock: newStock.toString(),
      updatedAt: Timestamp.now(),
    });
    
    return this.getIngredient(id);
  }

  async getLowStockIngredients(): Promise<Ingredient[]> {
    const allIngredients = await this.getAllIngredients();
    return allIngredients.filter(ing => 
      parseFloat(ing.currentStock) <= parseFloat(ing.minLevel)
    );
  }

  // Dish Ingredients
  async getDishIngredients(dishId: string): Promise<Array<DishIngredient & { ingredient: Ingredient }>> {
    const snapshot = await db.collection(COLLECTIONS.DISH_INGREDIENTS)
      .where('dishId', '==', dishId)
      .get();
    
    const results = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const ingredient = await this.getIngredient(data.ingredientId);
        if (!ingredient) return null;
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          ingredient,
        } as DishIngredient & { ingredient: Ingredient };
      })
    );
    
    return results.filter(r => r !== null) as Array<DishIngredient & { ingredient: Ingredient }>;
  }

  async addDishIngredient(dishIngredient: InsertDishIngredient): Promise<DishIngredient> {
    const dishIngredientData = {
      ...dishIngredient,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await db.collection(COLLECTIONS.DISH_INGREDIENTS).add(dishIngredientData);
    return {
      id: docRef.id,
      ...dishIngredientData,
      createdAt: dishIngredientData.createdAt.toDate(),
    };
  }

  async removeDishIngredient(id: string): Promise<void> {
    await db.collection(COLLECTIONS.DISH_INGREDIENTS).doc(id).delete();
  }

  async updateDishIngredient(id: string, dishIngredient: Partial<InsertDishIngredient>): Promise<DishIngredient | undefined> {
    const docRef = db.collection(COLLECTIONS.DISH_INGREDIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    await docRef.update(dishIngredient);
    const updated = await docRef.get();
    const data = updated.data()!;
    
    return {
      id: updated.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as DishIngredient;
  }

  // Orders - Kitchen
  async getActiveOrders(): Promise<Order[]> {
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('status', 'in', ['pending', 'confirmed', 'preparing'])
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order;
    });
  }

  async updateOrderKitchenStatus(id: string, kitchenStatus: string): Promise<Order | undefined> {
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    await docRef.update({ kitchenStatus });
    return this.getOrder(id);
  }

  async getKOTOrders(): Promise<Array<Order & { items: Array<OrderItem & { dish: Dish }> }>> {
    const snapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('kitchenStatus', 'in', ['sent', 'preparing'])
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order;
    });
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await this.getOrderItems(order.id);
        const itemsWithDishes = await Promise.all(
          items.map(async (item) => {
            const dish = await this.getDish(item.dishId);
            return dish ? { ...item, dish } : null;
          })
        );
        
        return {
          ...order,
          items: itemsWithDishes.filter(item => item !== null) as Array<OrderItem & { dish: Dish }>,
        };
      })
    );
    
    return ordersWithItems;
  }

  // Authentication
  async registerOwner(owner: InsertRestaurantOwner): Promise<Omit<RestaurantOwner, 'password'>> {
    // Check if email already exists
    const existing = await this.getOwnerByEmail(owner.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = hashPassword(owner.password);
    const now = Timestamp.now();
    
    const ownerData = {
      email: owner.email,
      password: hashedPassword,
      restaurantName: owner.restaurantName,
      ownerName: owner.ownerName,
      phone: owner.phone,
      address: owner.address,
      cuisine: owner.cuisine,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.RESTAURANT_OWNERS).add(ownerData);
    
    const { password, ...ownerWithoutPassword } = ownerData;
    return {
      id: docRef.id,
      ...ownerWithoutPassword,
      createdAt: ownerData.createdAt.toDate(),
      updatedAt: ownerData.updatedAt.toDate(),
    };
  }

  async loginOwner(credentials: LoginCredentials): Promise<Omit<RestaurantOwner, 'password'> | null> {
    const owner = await this.getOwnerByEmail(credentials.email);
    if (!owner) {
      return null;
    }

    const isValid = verifyPassword(credentials.password, owner.password);
    if (!isValid) {
      return null;
    }

    const { password, ...ownerWithoutPassword } = owner;
    return ownerWithoutPassword;
  }

  async getOwnerByEmail(email: string): Promise<RestaurantOwner | undefined> {
    const snapshot = await db.collection(COLLECTIONS.RESTAURANT_OWNERS)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as RestaurantOwner;
  }

  async getOwnerById(id: string): Promise<Omit<RestaurantOwner, 'password'> | undefined> {
    const doc = await db.collection(COLLECTIONS.RESTAURANT_OWNERS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    const { password, ...ownerWithoutPassword } = data;
    return {
      id: doc.id,
      ...ownerWithoutPassword,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Omit<RestaurantOwner, 'password'>;
  }

  async updateOwnerProfile(id: string, updates: Partial<Omit<InsertRestaurantOwner, 'email' | 'password'>>): Promise<Omit<RestaurantOwner, 'password'> | undefined> {
    const docRef = db.collection(COLLECTIONS.RESTAURANT_OWNERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    await docRef.update(updateData);
    return this.getOwnerById(id);
  }
}

export const storage = new DatabaseStorage();
