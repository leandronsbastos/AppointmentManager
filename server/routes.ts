import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocket } from "./services/websocket";
import { EvolutionApiService } from "./services/evolutionApi";
import { insertUserSchema, insertCustomerSchema, insertContactSchema, insertTicketSchema, insertMessageSchema, insertEvolutionInstanceSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import express from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const upload = multer({ dest: "uploads/" });

interface AuthenticatedRequest extends Express.Request {
  user?: any;
  headers: any;
}

// Middleware for authentication
const authenticateToken = (req: AuthenticatedRequest, res: any, next: any) => {
  const authHeader = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const evolutionApi = new EvolutionApiService();

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      
      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      
      res.status(201).json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Tickets routes
  app.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const { status, priority, assignedAgentId, page = 1, limit = 20 } = req.query;
      const filters = {
        status: status as string,
        priority: priority as string,
        assignedAgentId: assignedAgentId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };
      
      const result = await storage.getTickets(filters);
      res.json(result);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", authenticateToken, async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Get ticket error:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", authenticateToken, async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      res.json(ticket);
    } catch (error) {
      console.error("Update ticket error:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Messages routes
  app.get("/api/tickets/:ticketId/messages", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessagesByTicket(req.params.ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/tickets/:ticketId/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
        senderId: req.user.userId,
        direction: "out",
      });

      const message = await storage.createMessage(messageData);

      // Send via WhatsApp if it's an outgoing message and not internal
      if (message.direction === "out" && !message.isInternal) {
        const ticket = await storage.getTicket(req.params.ticketId);
        if (ticket?.contact?.whatsappNumber) {
          await evolutionApi.sendMessage(
            ticket.contact.whatsappNumber,
            message.content,
            message.type || 'text',
            message.mediaUrl
          );
        }
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Customers routes
  app.get("/api/customers", authenticateToken, async (req, res) => {
    try {
      const { page = 1, limit = 20, search = "", segment = "" } = req.query;
      const result = await storage.getCustomers(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      res.json(result);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", authenticateToken, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Evolution API webhook
  app.post("/api/webhooks/evolution/:instanceKey", async (req, res) => {
    try {
      const { instanceKey } = req.params;
      const webhookData = req.body;

      console.log(`Webhook received for instance ${instanceKey}:`, webhookData);

      // Process webhook based on event type
      if (webhookData.event === "message.upsert") {
        await evolutionApi.processIncomingMessage(webhookData.data, instanceKey);
      } else if (webhookData.event === "message.status") {
        await evolutionApi.processMessageStatus(webhookData.data);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Evolution instances routes
  app.get("/api/evolution/instances", authenticateToken, async (req, res) => {
    try {
      const instances = await storage.getEvolutionInstances();
      res.json(instances);
    } catch (error) {
      console.error("Get evolution instances error:", error);
      res.status(500).json({ message: "Failed to fetch evolution instances" });
    }
  });

  app.post("/api/evolution/instances", authenticateToken, async (req, res) => {
    try {
      const instanceData = insertEvolutionInstanceSchema.parse(req.body);
      const instance = await storage.createEvolutionInstance(instanceData);
      res.status(201).json(instance);
    } catch (error) {
      console.error("Create evolution instance error:", error);
      res.status(500).json({ message: "Failed to create evolution instance" });
    }
  });

  // File upload route
  app.post("/api/upload", authenticateToken, upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.originalname });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  const httpServer = createServer(app);
  
  // Setup WebSocket
  setupWebSocket(httpServer);

  return httpServer;
}
