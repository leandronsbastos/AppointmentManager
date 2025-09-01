import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  serial,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "agent", "customer"]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "pending_customer",
  "pending_third_party",
  "resolved",
  "closed",
  "cancelled"
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "normal", "high", "critical"]);
export const messageDirectionEnum = pgEnum("message_direction", ["in", "out"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "image", "audio", "document", "video", "location", "contact"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read", "failed"]);
export const customerSegmentEnum = pgEnum("customer_segment", ["residential", "business", "enterprise"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: userRoleEnum("role").notNull().default("agent"),
  teamId: varchar("team_id"),
  isActive: boolean("is_active").default(true),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  document: varchar("document"), // CPF/CNPJ
  segment: customerSegmentEnum("segment").default("residential"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Additional customer data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table (WhatsApp numbers linked to customers)
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  whatsappNumber: varchar("whatsapp_number").notNull().unique(),
  name: varchar("name"),
  isOptOut: boolean("is_opt_out").default(false),
  language: varchar("language").default("pt-BR"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  parentId: varchar("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// SLA Policies table
export const slaPolicies = pgTable("sla_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  priority: ticketPriorityEnum("priority").notNull(),
  firstResponseTarget: integer("first_response_target").notNull(), // minutes
  resolutionTarget: integer("resolution_target").notNull(), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: varchar("number").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open"),
  priority: ticketPriorityEnum("priority").default("normal"),
  customerId: varchar("customer_id").notNull(),
  contactId: varchar("contact_id").notNull(),
  assignedAgentId: varchar("assigned_agent_id"),
  teamId: varchar("team_id"),
  categoryId: varchar("category_id"),
  slaPolicyId: varchar("sla_policy_id"),
  channel: varchar("channel").notNull().default("whatsapp"),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  slaBreached: boolean("sla_breached").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  direction: messageDirectionEnum("direction").notNull(),
  type: messageTypeEnum("type").default("text"),
  content: text("content").notNull(),
  mediaUrl: varchar("media_url"),
  mediaMetadata: jsonb("media_metadata"),
  senderId: varchar("sender_id"), // user ID for outgoing, contact ID for incoming
  providerMessageId: varchar("provider_message_id"), // WhatsApp message ID
  status: messageStatusEnum("status").default("sent"),
  isInternal: boolean("is_internal").default(false), // Internal notes
  createdAt: timestamp("created_at").defaultNow(),
});

// Evolution API Instances table
export const evolutionInstances = pgTable("evolution_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  instanceKey: varchar("instance_key").notNull().unique(),
  number: varchar("number"),
  status: varchar("status").default("disconnected"), // connected, disconnected, connecting
  apiUrl: varchar("api_url").notNull(),
  token: varchar("token").notNull(),
  webhookUrl: varchar("webhook_url"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  color: varchar("color").default("#3B82F6"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket Tags junction table
export const ticketTags = pgTable("ticket_tags", {
  ticketId: varchar("ticket_id").notNull(),
  tagId: varchar("tag_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Satisfaction Surveys table
export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  score: integer("score").notNull(), // 1-5
  comment: text("comment"),
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Knowledge Articles table
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  categoryId: varchar("category_id"),
  authorId: varchar("author_id").notNull(),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  assignedTickets: many(tickets),
  sentMessages: many(messages),
  knowledgeArticles: many(knowledgeArticles),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(users),
  tickets: many(tickets),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  contacts: many(contacts),
  tickets: many(tickets),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [contacts.customerId],
    references: [customers.id],
  }),
  tickets: many(tickets),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  tickets: many(tickets),
  knowledgeArticles: many(knowledgeArticles),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  contact: one(contacts, {
    fields: [tickets.contactId],
    references: [contacts.id],
  }),
  assignedAgent: one(users, {
    fields: [tickets.assignedAgentId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [tickets.teamId],
    references: [teams.id],
  }),
  category: one(categories, {
    fields: [tickets.categoryId],
    references: [categories.id],
  }),
  slaPolicy: one(slaPolicies, {
    fields: [tickets.slaPolicyId],
    references: [slaPolicies.id],
  }),
  messages: many(messages),
  tags: many(ticketTags),
  satisfactionSurvey: one(satisfactionSurveys),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [messages.ticketId],
    references: [tickets.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const ticketTagsRelations = relations(ticketTags, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketTags.ticketId],
    references: [tickets.id],
  }),
  tag: one(tags, {
    fields: [ticketTags.tagId],
    references: [tags.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  number: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertEvolutionInstanceSchema = createInsertSchema(evolutionInstances).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type EvolutionInstance = typeof evolutionInstances.$inferSelect;
export type InsertEvolutionInstance = z.infer<typeof insertEvolutionInstanceSchema>;
export type Tag = typeof tags.$inferSelect;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
