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
import { initializeFirebase } from "./firebase";
import * as crypto from "crypto";

const db = initializeFirebase();

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
    const snapshot = await db.ref(COLLECTIONS.DISHES).once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, dish]: [string, any]) => ({ id, ...dish }));
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.DISHES}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    return { id, ...data };
  }

  async createDish(dish: InsertDish): Promise<Dish> {
    const id = generateId();
    const dishData = { ...dish, image: dish.image ?? null };
    await db.ref(`${COLLECTIONS.DISHES}/${id}`).set(dishData);
    return { id, ...dishData };
  }

  async updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
    const existing = await this.getDish(id);
    if (!existing) return undefined;
    await db.ref(`${COLLECTIONS.DISHES}/${id}`).update(dish);
    return { ...existing, ...dish };
  }

  async deleteDish(id: string): Promise<void> {
    await db.ref(`${COLLECTIONS.DISHES}/${id}`).remove();
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    const snapshot = await db.ref(COLLECTIONS.ORDERS).orderByChild('createdAt').once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data)
      .map(([id, order]: [string, any]) => ({
        id,
        ...order,
        createdAt: new Date(order.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.ORDERS}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    return {
      id,
      ...data,
      createdAt: new Date(data.createdAt),
    };
  }

  async getOrdersByTableNumber(tableNumber: string): Promise<Order[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.tableNumber === tableNumber);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = generateId();
    const orderData = {
      customerId: order.customerId ?? null,
      tableNumber: order.tableNumber ?? null,
      guests: order.guests,
      type: order.type,
      status: order.status,
      kitchenStatus: order.kitchenStatus,
      total: order.total,
      createdAt: new Date().toISOString(),
    };
    await db.ref(`${COLLECTIONS.ORDERS}/${id}`).set(orderData);
    return {
      id,
      ...orderData,
      createdAt: new Date(orderData.createdAt),
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = await this.getOrder(id);
    if (!existing) return undefined;
    await db.ref(`${COLLECTIONS.ORDERS}/${id}`).update({ status });
    return { ...existing, status };
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const snapshot = await db.ref(COLLECTIONS.ORDER_ITEMS).orderByChild('orderId').equalTo(orderId).once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, item]: [string, any]) => ({ id, ...item }));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = generateId();
    const itemData = {
      orderId: item.orderId,
      dishId: item.dishId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes ?? null,
    };
    await db.ref(`${COLLECTIONS.ORDER_ITEMS}/${id}`).set(itemData);
    return { id, ...itemData };
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const snapshot = await db.ref(COLLECTIONS.CUSTOMERS).once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data)
      .map(([id, customer]: [string, any]) => ({
        id,
        ...customer,
        lastVisit: customer.lastVisit ? new Date(customer.lastVisit) : null,
      }))
      .sort((a, b) => {
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return b.lastVisit.getTime() - a.lastVisit.getTime();
      });
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.CUSTOMERS}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    return {
      id,
      ...data,
      lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
    };
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = generateId();
    const customerData = {
      ...customer,
      lastVisit: customer.lastVisit ? customer.lastVisit.toISOString() : null,
    };
    await db.ref(`${COLLECTIONS.CUSTOMERS}/${id}`).set(customerData);
    return {
      id,
      ...customerData,
      lastVisit: customerData.lastVisit ? new Date(customerData.lastVisit) : null,
    };
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = await this.getCustomer(id);
    if (!existing) return undefined;
    const updateData: any = { ...customer };
    if (customer.lastVisit) {
      updateData.lastVisit = customer.lastVisit.toISOString();
    }
    await db.ref(`${COLLECTIONS.CUSTOMERS}/${id}`).update(updateData);
    return {
      ...existing,
      ...customer,
    };
  }

  // Tables
  async getAllTables(): Promise<Table[]> {
    const snapshot = await db.ref(COLLECTIONS.TABLES).once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data)
      .map(([id, table]: [string, any]) => ({
        id,
        ...table,
        createdAt: new Date(table.createdAt),
      }))
      .sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section);
        return a.number.localeCompare(b.number);
      });
  }

  async getTable(id: string): Promise<Table | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.TABLES}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    return {
      id,
      ...data,
      createdAt: new Date(data.createdAt),
    };
  }

  async createTable(table: InsertTable): Promise<Table> {
    // Check for duplicate table number in the same section
    const allTables = await this.getAllTables();
    const existing = allTables.find(t => t.number === table.number && t.section === table.section);
    if (existing) {
      throw new Error(`Table ${table.number} already exists in ${table.section} section`);
    }
    
    const id = generateId();
    const tableData = {
      ...table,
      createdAt: new Date().toISOString(),
    };
    await db.ref(`${COLLECTIONS.TABLES}/${id}`).set(tableData);
    return {
      id,
      ...tableData,
      createdAt: new Date(tableData.createdAt),
    };
  }

  async updateTable(id: string, table: Partial<InsertTable>): Promise<Table | undefined> {
    const existing = await this.getTable(id);
    if (!existing) return undefined;
    
    // Check for duplicate table number in the same section (excluding current table)
    if (table.number || table.section) {
      const numberToCheck = table.number || existing.number;
      const sectionToCheck = table.section || existing.section;
      
      const allTables = await this.getAllTables();
      const duplicate = allTables.find(t => 
        t.id !== id && 
        t.number === numberToCheck && 
        t.section === sectionToCheck
      );
      
      if (duplicate) {
        throw new Error(`Table ${numberToCheck} already exists in ${sectionToCheck} section`);
      }
    }
    
    await db.ref(`${COLLECTIONS.TABLES}/${id}`).update(table);
    return {
      ...existing,
      ...table,
    };
  }

  async deleteTable(id: string): Promise<void> {
    await db.ref(`${COLLECTIONS.TABLES}/${id}`).remove();
  }

  // Analytics
  async getDailySales(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const snapshot = await db.ref(COLLECTIONS.ORDERS).orderByChild('createdAt').startAt(todayISO).once('value');
    const data = snapshot.val();
    if (!data) return 0;
    
    let total = 0;
    Object.values(data).forEach((order: any) => {
      total += parseFloat(order.total || '0');
    });
    
    return total;
  }

  async getOrderCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const snapshot = await db.ref(COLLECTIONS.ORDERS).orderByChild('createdAt').startAt(todayISO).once('value');
    const data = snapshot.val();
    if (!data) return 0;
    
    return Object.keys(data).length;
  }

  async getAverageTicket(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const snapshot = await db.ref(COLLECTIONS.ORDERS).orderByChild('createdAt').startAt(todayISO).once('value');
    const data = snapshot.val();
    if (!data) return 0;
    
    const orders = Object.values(data);
    if (orders.length === 0) return 0;
    
    let total = 0;
    orders.forEach((order: any) => {
      total += parseFloat(order.total || '0');
    });
    
    return total / orders.length;
  }

  async getTopDishes(limit: number = 3): Promise<Array<{ dishId: string; name: string; image: string | null; orders: number }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    // Get today's orders
    const ordersSnapshot = await db.ref(COLLECTIONS.ORDERS).orderByChild('createdAt').startAt(todayISO).once('value');
    const ordersData = ordersSnapshot.val();
    if (!ordersData) return [];
    
    const orderIds = Object.keys(ordersData);
    
    // Get all order items
    const itemsSnapshot = await db.ref(COLLECTIONS.ORDER_ITEMS).once('value');
    const itemsData = itemsSnapshot.val();
    if (!itemsData) return [];
    
    // Count dishes per order
    const dishCounts = new Map<string, Set<string>>();
    Object.values(itemsData).forEach((item: any) => {
      if (orderIds.includes(item.orderId)) {
        if (!dishCounts.has(item.dishId)) {
          dishCounts.set(item.dishId, new Set());
        }
        dishCounts.get(item.dishId)!.add(item.orderId);
      }
    });
    
    // Get dish details and sort by count
    const dishesSnapshot = await db.ref(COLLECTIONS.DISHES).once('value');
    const dishesData = dishesSnapshot.val();
    
    const topDishes = Array.from(dishCounts.entries())
      .map(([dishId, orderIds]) => {
        const dish = dishesData?.[dishId];
        return {
          dishId,
          name: dish?.name || 'Unknown',
          image: dish?.image || null,
          orders: orderIds.size,
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);
    
    return topDishes;
  }

  // Ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    const snapshot = await db.ref(COLLECTIONS.INGREDIENTS).once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data)
      .map(([id, ingredient]: [string, any]) => ({
        id,
        ...ingredient,
        createdAt: new Date(ingredient.createdAt),
        updatedAt: new Date(ingredient.updatedAt),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.INGREDIENTS}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    return {
      id,
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const id = generateId();
    const now = new Date().toISOString();
    const ingredientData = {
      ...ingredient,
      createdAt: now,
      updatedAt: now,
    };
    await db.ref(`${COLLECTIONS.INGREDIENTS}/${id}`).set(ingredientData);
    return {
      id,
      ...ingredientData,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async updateIngredient(id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const existing = await this.getIngredient(id);
    if (!existing) return undefined;
    const updateData = {
      ...ingredient,
      updatedAt: new Date().toISOString(),
    };
    await db.ref(`${COLLECTIONS.INGREDIENTS}/${id}`).update(updateData);
    return {
      ...existing,
      ...ingredient,
      updatedAt: new Date(updateData.updatedAt),
    };
  }

  async deleteIngredient(id: string): Promise<void> {
    await db.ref(`${COLLECTIONS.INGREDIENTS}/${id}`).remove();
  }

  async updateIngredientStock(id: string, quantity: number): Promise<Ingredient | undefined> {
    const ingredient = await this.getIngredient(id);
    if (!ingredient) return undefined;
    
    const newStock = parseFloat(ingredient.currentStock) + quantity;
    await db.ref(`${COLLECTIONS.INGREDIENTS}/${id}`).update({
      currentStock: newStock.toString(),
      updatedAt: new Date().toISOString(),
    });
    
    return {
      ...ingredient,
      currentStock: newStock.toString(),
      updatedAt: new Date(),
    };
  }

  async getLowStockIngredients(): Promise<Ingredient[]> {
    const allIngredients = await this.getAllIngredients();
    return allIngredients.filter(ing => 
      parseFloat(ing.currentStock) <= parseFloat(ing.minLevel)
    );
  }

  // Dish Ingredients
  async getDishIngredients(dishId: string): Promise<Array<DishIngredient & { ingredient: Ingredient }>> {
    const snapshot = await db.ref(COLLECTIONS.DISH_INGREDIENTS).orderByChild('dishId').equalTo(dishId).once('value');
    const data = snapshot.val();
    if (!data) return [];
    
    const results = await Promise.all(
      Object.entries(data).map(async ([id, dishIngredient]: [string, any]) => {
        const ingredient = await this.getIngredient(dishIngredient.ingredientId);
        return {
          id,
          ...dishIngredient,
          createdAt: new Date(dishIngredient.createdAt),
          ingredient: ingredient!,
        };
      })
    );
    
    return results.filter(r => r.ingredient);
  }

  async addDishIngredient(dishIngredient: InsertDishIngredient): Promise<DishIngredient> {
    const id = generateId();
    const dishIngredientData = {
      ...dishIngredient,
      createdAt: new Date().toISOString(),
    };
    await db.ref(`${COLLECTIONS.DISH_INGREDIENTS}/${id}`).set(dishIngredientData);
    return {
      id,
      ...dishIngredientData,
      createdAt: new Date(dishIngredientData.createdAt),
    };
  }

  async removeDishIngredient(id: string): Promise<void> {
    await db.ref(`${COLLECTIONS.DISH_INGREDIENTS}/${id}`).remove();
  }

  async updateDishIngredient(id: string, dishIngredient: Partial<InsertDishIngredient>): Promise<DishIngredient | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.DISH_INGREDIENTS}/${id}`).once('value');
    const existing = snapshot.val();
    if (!existing) return undefined;
    
    await db.ref(`${COLLECTIONS.DISH_INGREDIENTS}/${id}`).update(dishIngredient);
    return {
      id,
      ...existing,
      ...dishIngredient,
      createdAt: new Date(existing.createdAt),
    };
  }

  // Orders - Kitchen
  async getActiveOrders(): Promise<Order[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status)
    );
  }

  async updateOrderKitchenStatus(id: string, kitchenStatus: string): Promise<Order | undefined> {
    const existing = await this.getOrder(id);
    if (!existing) return undefined;
    await db.ref(`${COLLECTIONS.ORDERS}/${id}`).update({ kitchenStatus });
    return { ...existing, kitchenStatus };
  }

  async getKOTOrders(): Promise<Array<Order & { items: Array<OrderItem & { dish: Dish }> }>> {
    const allOrders = await this.getAllOrders();
    const kotOrders = allOrders.filter(order => 
      ['sent', 'preparing'].includes(order.kitchenStatus)
    );
    
    const ordersWithItems = await Promise.all(
      kotOrders.map(async (order) => {
        const items = await this.getOrderItems(order.id);
        const itemsWithDishes = await Promise.all(
          items.map(async (item) => {
            const dish = await this.getDish(item.dishId);
            return {
              ...item,
              dish: dish!,
            };
          })
        );
        
        return {
          ...order,
          items: itemsWithDishes.filter(item => item.dish),
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

    const id = generateId();
    const hashedPassword = hashPassword(owner.password);
    const now = new Date().toISOString();
    
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

    await db.ref(`${COLLECTIONS.RESTAURANT_OWNERS}/${id}`).set(ownerData);
    
    const { password, ...ownerWithoutPassword } = ownerData;
    return {
      id,
      ...ownerWithoutPassword,
      createdAt: new Date(ownerData.createdAt),
      updatedAt: new Date(ownerData.updatedAt),
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
    const snapshot = await db.ref(COLLECTIONS.RESTAURANT_OWNERS)
      .orderByChild('email')
      .equalTo(email)
      .once('value');
    
    const data = snapshot.val();
    if (!data) return undefined;
    
    const [id, ownerData] = Object.entries(data)[0] as [string, any];
    return {
      id,
      ...ownerData,
      createdAt: new Date(ownerData.createdAt),
      updatedAt: new Date(ownerData.updatedAt),
    };
  }

  async getOwnerById(id: string): Promise<Omit<RestaurantOwner, 'password'> | undefined> {
    const snapshot = await db.ref(`${COLLECTIONS.RESTAURANT_OWNERS}/${id}`).once('value');
    const data = snapshot.val();
    if (!data) return undefined;
    
    const { password, ...ownerWithoutPassword } = data;
    return {
      id,
      ...ownerWithoutPassword,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async updateOwnerProfile(id: string, updates: Partial<Omit<InsertRestaurantOwner, 'email' | 'password'>>): Promise<Omit<RestaurantOwner, 'password'> | undefined> {
    const existing = await this.getOwnerById(id);
    if (!existing) return undefined;
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await db.ref(`${COLLECTIONS.RESTAURANT_OWNERS}/${id}`).update(updateData);
    
    return {
      ...existing,
      ...updates,
      updatedAt: new Date(updateData.updatedAt),
    };
  }
}

export const storage = new DatabaseStorage();
