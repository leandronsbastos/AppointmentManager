import {
  users,
  customers,
  contacts,
  tickets,
  messages,
  evolutionInstances,
  tags,
  ticketTags,
  satisfactionSurveys,
  knowledgeArticles,
  categories,
  slaPolicies,
  teams,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Contact,
  type InsertContact,
  type Ticket,
  type InsertTicket,
  type Message,
  type InsertMessage,
  type EvolutionInstance,
  type InsertEvolutionInstance,
  type Tag,
  type KnowledgeArticle,
  type SatisfactionSurvey,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;

  // Customer operations
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer>;
  getCustomers(page?: number, limit?: number, search?: string): Promise<{ customers: Customer[]; total: number }>;

  // Contact operations
  getContact(id: string): Promise<Contact | undefined>;
  getContactByWhatsApp(number: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<Contact>): Promise<Contact>;

  // Ticket operations
  getTicket(id: string): Promise<any>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<Ticket>): Promise<Ticket>;
  getTickets(
    filters?: {
      status?: string;
      priority?: string;
      assignedAgentId?: string;
      customerId?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ tickets: any[]; total: number }>;
  generateTicketNumber(): Promise<string>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByTicket(ticketId: string): Promise<Message[]>;
  updateMessage(id: string, message: Partial<Message>): Promise<Message>;

  // Evolution API operations
  getEvolutionInstance(id: string): Promise<EvolutionInstance | undefined>;
  getEvolutionInstanceByKey(key: string): Promise<EvolutionInstance | undefined>;
  createEvolutionInstance(instance: InsertEvolutionInstance): Promise<EvolutionInstance>;
  updateEvolutionInstance(id: string, instance: Partial<EvolutionInstance>): Promise<EvolutionInstance>;
  getEvolutionInstances(): Promise<EvolutionInstance[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<any>;

  // Tags operations
  getTags(): Promise<Tag[]>;
  addTagToTicket(ticketId: string, tagId: string): Promise<void>;
  removeTagFromTicket(ticketId: string, tagId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Customer operations
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async getCustomers(page = 1, limit = 20, search = ""): Promise<{ customers: Customer[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = eq(customers.isActive, true);
    if (search) {
      whereClause = and(
        eq(customers.isActive, true),
        or(
          like(customers.name, `%${search}%`),
          like(customers.email, `%${search}%`),
          like(customers.document, `%${search}%`)
        )
      )!
    }

    const [customerResults, totalResults] = await Promise.all([
      db.select().from(customers).where(whereClause).limit(limit).offset(offset).orderBy(desc(customers.createdAt)),
      db.select({ count: count() }).from(customers).where(whereClause),
    ]);

    return {
      customers: customerResults,
      total: totalResults[0]?.count || 0,
    };
  }

  // Contact operations
  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async getContactByWhatsApp(number: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.whatsappNumber, number));
    return contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(contactData)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  // Ticket operations
  async getTicket(id: string): Promise<any> {
    const result = await db
      .select({
        ticket: tickets,
        customer: customers,
        contact: contacts,
        assignedAgent: users,
        category: categories,
      })
      .from(tickets)
      .leftJoin(customers, eq(tickets.customerId, customers.id))
      .leftJoin(contacts, eq(tickets.contactId, contacts.id))
      .leftJoin(users, eq(tickets.assignedAgentId, users.id))
      .leftJoin(categories, eq(tickets.categoryId, categories.id))
      .where(eq(tickets.id, id));

    return result[0] || null;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber();
    const [ticket] = await db
      .insert(tickets)
      .values({ ...insertTicket, number: ticketNumber })
      .returning();
    return ticket;
  }

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getTickets(filters: {
    status?: string;
    priority?: string;
    assignedAgentId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ tickets: any[]; total: number }> {
    const { status, priority, assignedAgentId, customerId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions: any[] = [];
    if (status) whereConditions.push(eq(tickets.status, status as any));
    if (priority) whereConditions.push(eq(tickets.priority, priority as any));
    if (assignedAgentId) whereConditions.push(eq(tickets.assignedAgentId, assignedAgentId));
    if (customerId) whereConditions.push(eq(tickets.customerId, customerId));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : sql`1=1`;

    const [ticketResults, totalResults] = await Promise.all([
      db
        .select({
          ticket: tickets,
          customer: customers,
          contact: contacts,
          assignedAgent: users,
        })
        .from(tickets)
        .leftJoin(customers, eq(tickets.customerId, customers.id))
        .leftJoin(contacts, eq(tickets.contactId, contacts.id))
        .leftJoin(users, eq(tickets.assignedAgentId, users.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(tickets.createdAt)),
      db
        .select({ count: count() })
        .from(tickets)
        .where(whereClause),
    ]);

    return {
      tickets: ticketResults,
      total: totalResults[0]?.count || 0,
    };
  }

  async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    
    // Get the count of tickets created today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const [result] = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(
        sql`${tickets.createdAt} >= ${startOfDay}`,
        sql`${tickets.createdAt} < ${endOfDay}`
      ));
    
    const sequence = (result?.count || 0) + 1;
    return `TK-${year}${month}-${String(sequence).padStart(4, "0")}`;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesByTicket(ticketId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.ticketId, ticketId))
      .orderBy(messages.createdAt);
  }

  async updateMessage(id: string, messageData: Partial<Message>): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set(messageData)
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // Evolution API operations
  async getEvolutionInstance(id: string): Promise<EvolutionInstance | undefined> {
    const [instance] = await db.select().from(evolutionInstances).where(eq(evolutionInstances.id, id));
    return instance;
  }

  async getEvolutionInstanceByKey(key: string): Promise<EvolutionInstance | undefined> {
    const [instance] = await db.select().from(evolutionInstances).where(eq(evolutionInstances.instanceKey, key));
    return instance;
  }

  async createEvolutionInstance(insertInstance: InsertEvolutionInstance): Promise<EvolutionInstance> {
    const [instance] = await db.insert(evolutionInstances).values(insertInstance).returning();
    return instance;
  }

  async updateEvolutionInstance(id: string, instanceData: Partial<EvolutionInstance>): Promise<EvolutionInstance> {
    const [instance] = await db
      .update(evolutionInstances)
      .set(instanceData)
      .where(eq(evolutionInstances.id, id))
      .returning();
    return instance;
  }

  async getEvolutionInstances(): Promise<EvolutionInstance[]> {
    return await db.select().from(evolutionInstances).where(eq(evolutionInstances.isActive, true));
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    const [openTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "open"));

    const [inProgressTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, "in_progress"));

    const [resolvedToday] = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(
        eq(tickets.status, "resolved"),
        sql`DATE(${tickets.resolvedAt}) = CURRENT_DATE`
      ));

    // Calculate average response time (mock for now)
    const avgResponseTime = 4.2;
    const slaCompliance = 94.5;
    const customerSatisfaction = 4.7;

    return {
      openTickets: openTickets?.count || 0,
      inProgressTickets: inProgressTickets?.count || 0,
      resolvedToday: resolvedToday?.count || 0,
      avgResponseTime,
      slaCompliance,
      customerSatisfaction,
    };
  }

  // Tags operations
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags).where(eq(tags.isActive, true));
  }

  async addTagToTicket(ticketId: string, tagId: string): Promise<void> {
    await db.insert(ticketTags).values({ ticketId, tagId });
  }

  async removeTagFromTicket(ticketId: string, tagId: string): Promise<void> {
    await db.delete(ticketTags).where(and(eq(ticketTags.ticketId, ticketId), eq(ticketTags.tagId, tagId)));
  }
}

export const storage = new DatabaseStorage();
