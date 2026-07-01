import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // e.g. usr-demo, usr-admin
  username: text("username").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // 'admin' | 'customer'
  phone: text("phone").notNull(),
  addresses: jsonb("addresses").default([]),
  wishlist: jsonb("wishlist").default([]),
  profilePhoto: text("profile_photo"),
  notifications: jsonb("notifications").default([]),
  createdAt: timestamp("created_at").defaultNow()
});

// Products Table
export const products = pgTable("products", {
  id: text("id").primaryKey(), // e.g. prod-1
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Footwear' | 'Fashion' | 'Accessories'
  subCategory: text("sub_category").notNull(),
  brand: text("brand").notNull(),
  priceINR: integer("price_inr").notNull(),
  priceBDT: integer("price_bdt").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  stock: integer("stock").notNull(),
  sizes: jsonb("sizes").default([]),
  colors: jsonb("colors").default([]),
  images: jsonb("images").default([]),
  ratings: doublePrecision("ratings").default(5.0),
  reviews: jsonb("reviews").default([]),
  featured: boolean("featured").default(false),
  newArrival: boolean("new_arrival").default(false),
  bestSeller: boolean("best_seller").default(false),
  trending: boolean("trending").default(false),
  videoUrl: text("video_url"),
  is360Gallery: boolean("is_360_gallery").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Orders Table
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // e.g. ord-1
  orderNumber: text("order_number").notNull(),
  customerId: text("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address").notNull(),
  items: jsonb("items").notNull(),
  currency: text("currency").notNull(), // 'INR' | 'BDT'
  subtotal: doublePrecision("subtotal").notNull(),
  discountAmount: doublePrecision("discount_amount").notNull(),
  couponCodeUsed: text("coupon_code_used"),
  shippingCharge: doublePrecision("shipping_charge").notNull(),
  tax: doublePrecision("tax").notNull(),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(), // 'Pending' | 'Paid' | 'Failed'
  orderStatus: text("order_status").notNull(), // 'Pending' | 'Confirmed' | ...
  orderNotes: text("order_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coupons Table
export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(),
  discountPercent: integer("discount_percent").notNull(),
  minSpendINR: integer("min_spend_inr").notNull(),
  minSpendBDT: integer("min_spend_bdt").notNull(),
  isActive: boolean("is_active").default(true),
  expiryDate: text("expiry_date").notNull()
});

// System Settings Table
export const systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey(), // Always 'default'
  paymentGateways: jsonb("payment_gateways").notNull(),
  inrToBdtRate: doublePrecision("inr_to_bdt_rate").notNull(),
  taxPercent: doublePrecision("tax_percent").notNull(),
  shippingChargeINR: doublePrecision("shipping_charge_inr").notNull(),
  shippingChargeBDT: doublePrecision("shipping_charge_bdt").notNull(),
  announcement: text("announcement").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  user: text("user").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow()
});
