import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dishes = pgTable("dishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  veg: boolean("veg").notNull().default(true),
  image: text("image"),
  available: boolean("available").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableNumber: text("table_number"),
  guests: integer("guests").default(1),
  type: text("type").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  dishId: varchar("dish_id").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  lastVisit: timestamp("last_visit"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0"),
});

export const insertDishSchema = createInsertSchema(dishes).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
