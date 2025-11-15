import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { whatsappService } from "./whatsapp";
import { sendMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    path: "/ws",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  await whatsappService.initialize(io);

  app.get("/api/session", async (req, res) => {
    try {
      const session = await storage.getSession();
      if (!session) {
        const newSession = await storage.createSession({
          phoneNumber: null,
          isConnected: false,
          qrCode: null,
          lastConnected: null,
        });
        return res.json(newSession);
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const { chatId, limit } = req.query;
      const messages = await storage.getMessages(
        chatId as string | undefined,
        limit ? parseInt(limit as string) : 100
      );
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/send-message", async (req, res) => {
    try {
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validation.error.errors 
        });
      }

      const { to, message } = validation.data;
      const sentMessage = await whatsappService.sendMessage(to, message);
      
      res.json({ 
        success: true, 
        message: "Message sent successfully",
        data: sentMessage 
      });
    } catch (error: any) {
      console.error("Send message error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to send message" 
      });
    }
  });

  app.post("/api/disconnect", async (req, res) => {
    try {
      await whatsappService.disconnect();
      res.json({ success: true, message: "Disconnected successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
