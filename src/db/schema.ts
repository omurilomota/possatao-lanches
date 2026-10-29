import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("utensils"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  available: boolean("available").notNull().default(true),
  tag: text("tag"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  totalSpentCents: integer("total_spent_cents").notNull().default(0),
  ordersCount: integer("orders_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  token: uuid("token").notNull().defaultRandom().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  orderType: text("order_type").notNull().default("entrega"), // entrega | retirada
  street: text("street"),
  number: text("number"),
  district: text("district"),
  complement: text("complement"),
  paymentMethod: text("payment_method").notNull().default("pix"), // pix | credito | debito | dinheiro
  changeForCents: integer("change_for_cents"),
  notes: text("notes"),
  subtotalCents: integer("subtotal_cents").notNull(),
  deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("novo"), // novo | preparo | rota | concluido | cancelado
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: integer("menu_item_id"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
  addonsJson: jsonb("addons_json")
    .$type<{ name: string; priceCents: number }[]>()
    .notNull()
    .default([]),
  notes: text("notes"),
});

export type Category = typeof categories.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;