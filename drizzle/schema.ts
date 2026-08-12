import {
  boolean,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow (provided by the template).
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * PRODUCTS — kitchen and wardrobe catalog.
 * All business-unknown values are marked (see docs/01) — mock seed data is
 * clearly placeholder and must be replaced with real data from the owner.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 32 }).unique(),
  category: mysqlEnum("category", ["kitchen", "wardrobe"]).notNull(),
  nameKk: text("nameKk").notNull(),
  nameRu: text("nameRu").notNull(),
  descriptionKk: text("descriptionKk"),
  descriptionRu: text("descriptionRu"),
  style: mysqlEnum("style", ["modern", "classic", "minimalist", "loft", "classicModern"]).notNull(),
  material: varchar("material", { length: 128 }).notNull(),
  materialKk: varchar("materialKk", { length: 128 }),
  materialRu: varchar("materialRu", { length: 128 }),
  facade: varchar("facade", { length: 128 }),
  facadeKk: varchar("facadeKk", { length: 128 }),
  facadeRu: varchar("facadeRu", { length: 128 }),
  colors: json("colors").$type<string[]>(),
  colorsKk: json("colorsKk").$type<string[]>(),
  colorsRu: json("colorsRu").$type<string[]>(),
  photoUrl: text("photoUrl").notNull(),
  widthMm: int("widthMm"),
  heightMm: int("heightMm"),
  depthMm: int("depthMm"),
  basePriceKzt: int("basePriceKzt").notNull(),
  priceUnit: mysqlEnum("priceUnit", ["per_meter", "per_m2", "fixed"]).notNull().default("per_meter"),
  features: json("features").$type<string[]>(),
  featuresKk: json("featuresKk").$type<string[]>(),
  featuresRu: json("featuresRu").$type<string[]>(),
  leadTimeDays: int("leadTimeDays"),
  /** Direct Kaspi product page URL (sold on Kaspi marketplace). */
  kaspiUrl: varchar("kaspiUrl", { length: 512 }),
  /** Real review count from the Kaspi product page. */
  kaspiReviews: int("kaspiReviews"),
  /** Average rating from the Kaspi product export supplied by the store owner. */
  kaspiRating: float("kaspiRating"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * FAQ — company knowledge base (delivery, payment, warranty, ordering, etc.)
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  questionKk: text("questionKk").notNull(),
  questionRu: text("questionRu").notNull(),
  answerKk: text("answerKk").notNull(),
  answerRu: text("answerRu").notNull(),
  category: mysqlEnum("category", [
    "company",
    "products",
    "materials",
    "price",
    "ordering",
    "payment",
    "delivery",
    "installation",
    "warranty",
    "custom",
  ]).notNull(),
  keywords: text("keywords"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

/**
 * PRICING RULES — the single source of truth for price math.
 * The AI never computes prices; it calls the backend calculator built on these rows.
 */
export const pricingRules = mysqlTable("pricingRules", {
  id: int("id").autoincrement().primaryKey(),
  productType: mysqlEnum("productType", ["kitchen", "wardrobe"]).notNull(),
  ruleKey: varchar("ruleKey", { length: 64 }).notNull(),
  value: float("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;

/**
 * LEADS — qualified customer leads created by the AI assistant.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 32 }),
  source: mysqlEnum("source", ["website_ai", "instagram", "whatsapp", "kaspi", "manager"]).default("website_ai").notNull(),
  product: mysqlEnum("product", ["kitchen", "wardrobe", "unknown"]).default("unknown").notNull(),
  score: mysqlEnum("score", ["hot", "warm", "cold", "unqualified"]).default("unqualified").notNull(),
  scoreReason: text("scoreReason"),
  sizeMeters: float("sizeMeters"),
  style: varchar("style", { length: 64 }),
  material: varchar("material", { length: 128 }),
  budgetKzt: int("budgetKzt"),
  location: varchar("location", { length: 128 }),
  deadline: varchar("deadline", { length: 64 }),
  estimatedTotalKzt: int("estimatedTotalKzt"),
  notes: text("notes"),
  needsHuman: boolean("needsHuman").default(false).notNull(),
  humanReason: text("humanReason"),
  status: mysqlEnum("status", ["new", "contacted", "measuring", "quote_sent", "closed", "lost"]).default("new").notNull(),
  conversationId: varchar("conversationId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * COMPANY SETTINGS — key/value store for verified business facts.
 */
export const companySettings = mysqlTable("companySettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySetting = typeof companySettings.$inferSelect;
export type InsertCompanySetting = typeof companySettings.$inferInsert;
