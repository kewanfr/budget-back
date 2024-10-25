// schema.js
const {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgSchema,
} = require("drizzle-orm/pg-core");

const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", 255).notNull(),
  icon: varchar("icon", 255),
  description: text("description"),
});

const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category_id: serial("category_id").references(categories.id),
  magasin: varchar("magasin", 255).notNull(),
  date: timestamp("date").notNull(),
  amount: serial("amount").notNull(),
  description: text("description"),
});

module.exports = { categories, expenses };
