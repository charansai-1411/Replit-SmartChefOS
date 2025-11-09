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
  dishes,
  orders,
  orderItems,
  customers,
  tables,
  ingredients,
  dishIngredients
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, gte, and } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  // Dishes
  async getAllDishes(): Promise<Dish[]> {
    return await db.select().from(dishes);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const result = await db.select().from(dishes).where(eq(dishes.id, id));
    return result[0];
  }

  async createDish(dish: InsertDish): Promise<Dish> {
    const result = await db.insert(dishes).values(dish).returning();
    return result[0];
  }

  async updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
    const result = await db.update(dishes).set(dish).where(eq(dishes.id, id)).returning();
    return result[0];
  }

  async deleteDish(id: string): Promise<void> {
    await db.delete(dishes).where(eq(dishes.id, id));
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.lastVisit));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return result[0];
  }

  // Tables
  async getAllTables(): Promise<Table[]> {
    return await db.select().from(tables).orderBy(asc(tables.section), asc(tables.number));
  }

  async getTable(id: string): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.id, id));
    return result[0];
  }

  async createTable(table: InsertTable): Promise<Table> {
    const result = await db.insert(tables).values(table).returning();
    return result[0];
  }

  async updateTable(id: string, table: Partial<InsertTable>): Promise<Table | undefined> {
    const result = await db.update(tables).set(table).where(eq(tables.id, id)).returning();
    return result[0];
  }

  async deleteTable(id: string): Promise<void> {
    await db.delete(tables).where(eq(tables.id, id));
  }

  // Analytics
  async getDailySales(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    return parseFloat(result[0]?.total || '0');
  }

  async getOrderCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    return Number(result[0]?.count ?? 0);
  }

  async getAverageTicket(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ avg: sql<string>`COALESCE(AVG(${orders.total}), 0)` })
      .from(orders)
      .where(gte(orders.createdAt, today));
    
    return parseFloat(result[0]?.avg || '0');
  }

  async getTopDishes(limit: number = 3): Promise<Array<{ dishId: string; name: string; image: string | null; orders: number }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({
        dishId: orderItems.dishId,
        name: dishes.name,
        image: dishes.image,
        orders: sql<string>`COUNT(DISTINCT ${orderItems.orderId})`,
      })
      .from(orderItems)
      .innerJoin(dishes, eq(orderItems.dishId, dishes.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(gte(orders.createdAt, today))
      .groupBy(orderItems.dishId, dishes.name, dishes.image)
      .orderBy(sql`COUNT(DISTINCT ${orderItems.orderId}) DESC`)
      .limit(limit);
    
    return result.map(r => ({ ...r, orders: Number(r.orders) }));
  }

  // Ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients).orderBy(asc(ingredients.name));
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    const result = await db.select().from(ingredients).where(eq(ingredients.id, id));
    return result[0];
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const result = await db.insert(ingredients).values({
      ...ingredient,
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateIngredient(id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const result = await db.update(ingredients).set({
      ...ingredient,
      updatedAt: new Date(),
    }).where(eq(ingredients.id, id)).returning();
    return result[0];
  }

  async deleteIngredient(id: string): Promise<void> {
    await db.delete(ingredients).where(eq(ingredients.id, id));
  }

  async updateIngredientStock(id: string, quantity: number): Promise<Ingredient | undefined> {
    const ingredient = await this.getIngredient(id);
    if (!ingredient) return undefined;
    
    const newStock = parseFloat(ingredient.currentStock) + quantity;
    const result = await db.update(ingredients)
      .set({ 
        currentStock: newStock.toString(),
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();
    return result[0];
  }

  async getLowStockIngredients(): Promise<Ingredient[]> {
    return await db.select()
      .from(ingredients)
      .where(sql`${ingredients.currentStock} <= ${ingredients.minLevel}`)
      .orderBy(asc(ingredients.name));
  }

  // Dish Ingredients
  async getDishIngredients(dishId: string): Promise<Array<DishIngredient & { ingredient: Ingredient }>> {
    const result = await db
      .select({
        id: dishIngredients.id,
        dishId: dishIngredients.dishId,
        ingredientId: dishIngredients.ingredientId,
        quantity: dishIngredients.quantity,
        createdAt: dishIngredients.createdAt,
        ingredient: ingredients,
      })
      .from(dishIngredients)
      .innerJoin(ingredients, eq(dishIngredients.ingredientId, ingredients.id))
      .where(eq(dishIngredients.dishId, dishId));
    
    return result.map(r => ({
      id: r.id,
      dishId: r.dishId,
      ingredientId: r.ingredientId,
      quantity: r.quantity,
      createdAt: r.createdAt,
      ingredient: r.ingredient,
    }));
  }

  async addDishIngredient(dishIngredient: InsertDishIngredient): Promise<DishIngredient> {
    const result = await db.insert(dishIngredients).values(dishIngredient).returning();
    return result[0];
  }

  async removeDishIngredient(id: string): Promise<void> {
    await db.delete(dishIngredients).where(eq(dishIngredients.id, id));
  }

  async updateDishIngredient(id: string, dishIngredient: Partial<InsertDishIngredient>): Promise<DishIngredient | undefined> {
    const result = await db.update(dishIngredients)
      .set(dishIngredient)
      .where(eq(dishIngredients.id, id))
      .returning();
    return result[0];
  }

  // Orders - Kitchen
  async getActiveOrders(): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(sql`${orders.status} IN ('pending', 'confirmed', 'preparing')`)
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderKitchenStatus(id: string, kitchenStatus: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ kitchenStatus })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async getKOTOrders(): Promise<Array<Order & { items: Array<OrderItem & { dish: Dish }> }>> {
    const kotOrders = await db.select()
      .from(orders)
      .where(sql`${orders.kitchenStatus} IN ('sent', 'preparing')`)
      .orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      kotOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            dishId: orderItems.dishId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            notes: orderItems.notes,
            dish: dishes,
          })
          .from(orderItems)
          .innerJoin(dishes, eq(orderItems.dishId, dishes.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            orderId: item.orderId,
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            dish: item.dish,
          })),
        };
      })
    );
    
    return ordersWithItems;
  }
}

export const storage = new DatabaseStorage();
