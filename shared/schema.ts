import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("farmer"), // 'farmer' | 'provider'
});

export const facilities = pgTable("facilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  distance: doublePrecision("distance").notNull().default(0),
  type: text("type").array().notNull(),
  pricePerKgPerDay: doublePrecision("price_per_kg_per_day").notNull(),
  totalCapacity: integer("total_capacity").notNull(),
  availableCapacity: integer("available_capacity").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  certifications: text("certifications").array().notNull().default(sql`'{}'::text[]`),
  contactPhone: text("contact_phone").notNull(),
  operatingHours: text("operating_hours").notNull(),
  minBookingDays: integer("min_booking_days").notNull().default(1),
  amenities: text("amenities").array().notNull().default(sql`'{}'::text[]`),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  facilityId: varchar("facility_id").notNull().references(() => facilities.id),
  facilityName: text("facility_name").notNull(),
  facilityLocation: text("facility_location").notNull(),
  quantity: integer("quantity").notNull(),
  duration: integer("duration").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  totalCost: doublePrecision("total_cost").notNull(),
  pricePerKgPerDay: doublePrecision("price_per_kg_per_day").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled', 'pending'
  storageType: text("storage_type").notNull(),
});

export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'weather', 'market', 'demand'
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'danger'
  icon: text("icon").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertFacilitySchema = createInsertSchema(facilities);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertInsightSchema = createInsertSchema(insights);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Facility = typeof facilities.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingType = typeof bookings.$inferSelect;

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type InsightType = typeof insights.$inferSelect;
