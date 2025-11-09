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
  dishes,
  orders,
  orderItems,
  customers,
  tables
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, gte } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
