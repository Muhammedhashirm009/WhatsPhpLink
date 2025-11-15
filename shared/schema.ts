import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: text("chat_id").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  body: text("body").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  isFromMe: boolean("is_from_me").notNull().default(false),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey(),
  name: text("name"),
  number: text("number").notNull(),
  pushname: text("pushname"),
  isGroup: boolean("is_group").notNull().default(false),
});

export const whatsappSession = pgTable("whatsapp_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number"),
  isConnected: boolean("is_connected").notNull().default(false),
  qrCode: text("qr_code"),
  lastConnected: timestamp("last_connected"),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts);

export const insertWhatsAppSessionSchema = createInsertSchema(whatsappSession).omit({
  id: true,
});

export const sendMessageSchema = z.object({
  to: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertWhatsAppSession = z.infer<typeof insertWhatsAppSessionSchema>;
export type WhatsAppSession = typeof whatsappSession.$inferSelect;

export type SendMessage = z.infer<typeof sendMessageSchema>;
