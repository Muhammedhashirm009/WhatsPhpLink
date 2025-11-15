import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import { storage } from "./storage";
import type { Server as SocketIOServer } from "socket.io";
import { execSync } from "child_process";

function getChromiumPath(): string | undefined {
  try {
    const path = execSync("which chromium", { encoding: "utf-8" }).trim();
    return path || undefined;
  } catch {
    return undefined;
  }
}

export class WhatsAppService {
  private client: Client | null = null;
  private io: SocketIOServer | null = null;
  private isInitialized = false;

  async initialize(io: SocketIOServer) {
    if (this.isInitialized) {
      console.log("WhatsApp service already initialized");
      return;
    }

    console.log("Initializing WhatsApp service...");
    this.io = io;
    this.isInitialized = true;

    const chromiumPath = getChromiumPath();
    const puppeteerConfig: any = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    };

    if (chromiumPath) {
      console.log(`Using system Chromium at: ${chromiumPath}`);
      puppeteerConfig.executablePath = chromiumPath;
    } else {
      console.log("Using bundled Chromium from Puppeteer");
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "./.wwebjs_auth",
      }),
      puppeteer: puppeteerConfig,
    });

    this.setupEventHandlers();
    
    console.log("Starting WhatsApp client initialization...");
    try {
      await this.client.initialize();
      console.log("WhatsApp client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WhatsApp client:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
    }
  }

  private setupEventHandlers() {
    if (!this.client || !this.io) return;

    this.client.on("qr", async (qr: string) => {
      console.log("QR code received");
      await storage.updateSession({
        qrCode: qr,
        isConnected: false,
      });
      this.io?.emit("qr", { qr });
    });

    this.client.on("ready", async () => {
      console.log("WhatsApp client is ready");
      const info = this.client?.info;
      await storage.updateSession({
        phoneNumber: info?.wid?.user || null,
        isConnected: true,
        qrCode: null,
        lastConnected: new Date(),
      });
      this.io?.emit("ready");
      
      await this.loadContacts();
    });

    this.client.on("authenticated", async () => {
      console.log("WhatsApp client authenticated");
      this.io?.emit("authenticated");
    });

    this.client.on("auth_failure", async (msg: string) => {
      console.error("Authentication failed:", msg);
      await storage.updateSession({
        isConnected: false,
        qrCode: null,
      });
    });

    this.client.on("disconnected", async (reason: string) => {
      console.log("WhatsApp client disconnected:", reason);
      await storage.updateSession({
        isConnected: false,
        phoneNumber: null,
        qrCode: null,
      });
      this.io?.emit("disconnected", { reason });
    });

    this.client.on("message", async (msg: any) => {
      try {
        const chat = await msg.getChat();
        const contact = await msg.getContact();

        await storage.createOrUpdateContact({
          id: contact.id._serialized,
          name: contact.name || null,
          number: contact.number,
          pushname: contact.pushname || null,
          isGroup: chat.isGroup,
        });

        await storage.createMessage({
          chatId: chat.id._serialized,
          from: msg.from,
          to: msg.to,
          body: msg.body,
          timestamp: new Date(msg.timestamp * 1000),
          isFromMe: msg.fromMe,
        });

        this.io?.emit("message", {
          chatId: chat.id._serialized,
          from: msg.from,
          body: msg.body,
        });
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });
  }

  private async loadContacts() {
    try {
      if (!this.client) return;

      const chats = await this.client.getChats();
      
      for (const chat of chats) {
        try {
          const contact = await chat.getContact();
          await storage.createOrUpdateContact({
            id: contact.id._serialized,
            name: contact.name || null,
            number: contact.number,
            pushname: contact.pushname || null,
            isGroup: chat.isGroup,
          });
        } catch (error) {
          console.error("Error loading contact:", error);
        }
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  }

  async sendMessage(to: string, message: string) {
    if (!this.client) {
      throw new Error("WhatsApp client not initialized");
    }

    const session = await storage.getSession();
    if (!session?.isConnected) {
      throw new Error("WhatsApp is not connected");
    }

    let chatId = to;
    if (!to.includes("@")) {
      chatId = `${to}@c.us`;
    }

    try {
      const sentMessage = await this.client.sendMessage(chatId, message);
      
      const chat = await sentMessage.getChat();
      const contact = await chat.getContact();

      await storage.createOrUpdateContact({
        id: contact.id._serialized,
        name: contact.name || null,
        number: contact.number,
        pushname: contact.pushname || null,
        isGroup: chat.isGroup,
      });

      const savedMessage = await storage.createMessage({
        chatId: chat.id._serialized,
        from: sentMessage.from,
        to: sentMessage.to,
        body: message,
        timestamp: new Date(sentMessage.timestamp * 1000),
        isFromMe: true,
      });

      return savedMessage;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw new Error(error.message || "Failed to send message");
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isInitialized = false;
      await storage.updateSession({
        isConnected: false,
        phoneNumber: null,
        qrCode: null,
      });
    }
  }

  getClient() {
    return this.client;
  }
}

export const whatsappService = new WhatsAppService();
