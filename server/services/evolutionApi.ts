import axios from "axios";
import { storage } from "../storage";

export interface EvolutionApiConfig {
  apiUrl: string;
  token: string;
  instanceKey: string;
}

export class EvolutionApiService {
  private configs: Map<string, EvolutionApiConfig> = new Map();

  constructor() {
    this.loadConfigs();
  }

  private async loadConfigs() {
    try {
      const instances = await storage.getEvolutionInstances();
      instances.forEach(instance => {
        this.configs.set(instance.instanceKey, {
          apiUrl: instance.apiUrl,
          token: instance.token,
          instanceKey: instance.instanceKey,
        });
      });
    } catch (error) {
      console.error("Failed to load Evolution API configs:", error);
    }
  }

  private getConfig(instanceKey: string): EvolutionApiConfig | null {
    return this.configs.get(instanceKey) || null;
  }

  async sendMessage(
    to: string,
    content: string,
    type: string = "text",
    mediaUrl?: string,
    instanceKey?: string
  ): Promise<boolean> {
    try {
      // Use the first available instance if none specified
      const config = instanceKey 
        ? this.getConfig(instanceKey)
        : Array.from(this.configs.values())[0];

      if (!config) {
        throw new Error("No Evolution API instance configured");
      }

      const payload: any = {
        number: to,
      };

      if (type === "text") {
        payload.text = content;
      } else if (type === "image" && mediaUrl) {
        payload.mediaMessage = {
          mediatype: "image",
          media: mediaUrl,
          caption: content,
        };
      } else if (type === "document" && mediaUrl) {
        payload.mediaMessage = {
          mediatype: "document",
          media: mediaUrl,
          fileName: content,
        };
      }

      const response = await axios.post(
        `${config.apiUrl}/message/sendText/${config.instanceKey}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": config.token,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error("Error sending message via Evolution API:", error);
      return false;
    }
  }

  async processIncomingMessage(messageData: any, instanceKey: string): Promise<void> {
    try {
      const message = messageData.message;
      const fromNumber = messageData.key.remoteJid.replace("@s.whatsapp.net", "");
      
      console.log(`Processing incoming message from ${fromNumber}`);

      // Find or create contact
      let contact = await storage.getContactByWhatsApp(fromNumber);
      if (!contact) {
        // Create a new customer and contact
        const customer = await storage.createCustomer({
          name: message.pushName || fromNumber,
          segment: "residential",
        });

        contact = await storage.createContact({
          customerId: customer.id,
          whatsappNumber: fromNumber,
          name: message.pushName || fromNumber,
        });
      }

      // Find or create ticket
      const existingTickets = await storage.getTickets({
        customerId: contact.customerId,
        status: "open",
      });

      let ticket;
      if (existingTickets.tickets.length > 0) {
        // Use existing open ticket
        ticket = existingTickets.tickets[0].ticket;
      } else {
        // Create new ticket
        ticket = await storage.createTicket({
          title: "WhatsApp Support Request",
          description: message.conversation || message.extendedTextMessage?.text || "New WhatsApp message",
          customerId: contact.customerId,
          contactId: contact.id,
          channel: "whatsapp",
          priority: "normal",
          status: "open",
        });
      }

      // Create message record
      const messageContent = message.conversation || 
                           message.extendedTextMessage?.text ||
                           message.imageMessage?.caption ||
                           message.documentMessage?.title ||
                           "Media message";

      let messageType = "text";
      let mediaUrl;

      if (message.imageMessage) {
        messageType = "image";
        // In a real implementation, you'd download and store the media
        mediaUrl = "placeholder-image-url";
      } else if (message.documentMessage) {
        messageType = "document";
        mediaUrl = "placeholder-document-url";
      } else if (message.audioMessage) {
        messageType = "audio";
        mediaUrl = "placeholder-audio-url";
      }

      await storage.createMessage({
        ticketId: ticket.id,
        direction: "in",
        type: messageType as any,
        content: messageContent,
        mediaUrl,
        providerMessageId: messageData.key.id,
        status: "delivered",
      });

      console.log(`Message processed for ticket ${ticket.number}`);
    } catch (error) {
      console.error("Error processing incoming message:", error);
    }
  }

  async processMessageStatus(statusData: any): Promise<void> {
    try {
      const messageId = statusData.key.id;
      const status = statusData.status; // 1: sent, 2: delivered, 3: read

      let messageStatus = "sent";
      if (status === 2) messageStatus = "delivered";
      if (status === 3) messageStatus = "read";

      // Update message status in database
      // Note: You'd need to add a method to find message by provider ID
      console.log(`Message ${messageId} status updated to ${messageStatus}`);
    } catch (error) {
      console.error("Error processing message status:", error);
    }
  }

  async getInstanceInfo(instanceKey: string): Promise<any> {
    try {
      const config = this.getConfig(instanceKey);
      if (!config) {
        throw new Error("Instance not found");
      }

      const response = await axios.get(
        `${config.apiUrl}/instance/connectionState/${instanceKey}`,
        {
          headers: {
            "apikey": config.token,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting instance info:", error);
      return null;
    }
  }
}
