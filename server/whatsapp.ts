import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  type WASocket,
  type ConnectionState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { storage } from "./storage";
import type { Server as SocketIOServer } from "socket.io";
import pino from "pino";

const logger = pino({ level: "silent" });

export class WhatsAppService {
  private sock: WASocket | null = null;
  private io: SocketIOServer | null = null;
  private isInitialized = false;
  private qrCode: string | null = null;

  async initialize(io: SocketIOServer) {
    if (this.isInitialized) {
      console.log("WhatsApp service already initialized");
      return;
    }

    console.log("Initializing Baileys WhatsApp service...");
    this.io = io;
    this.isInitialized = true;

    try {
      await this.connectToWhatsApp();
    } catch (error) {
      console.error("Failed to initialize WhatsApp service:", error);
      throw error;
    }
  }

  private async connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./.sessions/baileys");
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: true,
    });

    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("connection.update", async (update) => {
      await this.handleConnectionUpdate(update);
    });
    this.sock.ev.on("messages.upsert", async ({ messages }) => {
      await this.handleIncomingMessages(messages);
    });

    console.log("Baileys WhatsApp client initialized");
  }

  private async handleConnectionUpdate(update: Partial<ConnectionState>) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR code received");
      this.qrCode = qr;
      
      await storage.updateSession({
        qrCode: qr,
        isConnected: false,
      });
      this.io?.emit("qr", { qr });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log("Connection closed. Reconnecting:", shouldReconnect);
      
      await storage.updateSession({
        isConnected: false,
        phoneNumber: null,
        qrCode: null,
      });
      
      this.io?.emit("disconnected", { reason: "Connection closed" });

      if (shouldReconnect) {
        setTimeout(() => {
          this.connectToWhatsApp();
        }, 3000);
      }
    } else if (connection === "open") {
      console.log("WhatsApp connected successfully");
      this.qrCode = null;
      
      const phoneNumber = this.sock?.user?.id?.split(":")[0] || null;
      
      await storage.updateSession({
        phoneNumber,
        isConnected: true,
        qrCode: null,
        lastConnected: new Date(),
      });
      
      this.io?.emit("ready");
      await this.loadContacts();
    }
  }

  private async handleIncomingMessages(messages: any[]) {
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      try {
        const chatId = msg.key.remoteJid || "";
        const from = chatId;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const contactName = msg.pushName || null;

        await storage.createOrUpdateContact({
          id: chatId,
          name: contactName,
          number: chatId.split("@")[0],
          pushname: contactName,
          isGroup: chatId.includes("@g.us"),
        });

        await storage.createMessage({
          chatId,
          from,
          to: this.sock?.user?.id || "",
          body,
          timestamp: new Date(msg.messageTimestamp * 1000),
          isFromMe: false,
        });

        this.io?.emit("message", {
          chatId,
          from,
          body,
        });
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }

  private async loadContacts() {
    try {
      if (!this.sock) return;

      const chats = await this.sock.groupFetchAllParticipating();
      
      for (const [chatId, chat] of Object.entries(chats)) {
        try {
          await storage.createOrUpdateContact({
            id: chatId,
            name: chat.subject || null,
            number: chatId.split("@")[0],
            pushname: chat.subject || null,
            isGroup: chatId.includes("@g.us"),
          });
        } catch (error) {
          console.error("Error loading contact:", error);
        }
      }
      
      console.log(`Loaded ${Object.keys(chats).length} contacts`);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  }

  async sendMessage(to: string, message: string) {
    if (!this.sock) {
      throw new Error("WhatsApp client not initialized");
    }

    const session = await storage.getSession();
    if (!session?.isConnected) {
      throw new Error("WhatsApp is not connected");
    }

    let chatId = to;
    if (!to.includes("@")) {
      chatId = `${to}@s.whatsapp.net`;
    }

    try {
      const result = await this.sock.sendMessage(chatId, { text: message });
      
      const contact = await storage.getContact(chatId);
      if (!contact) {
        await storage.createOrUpdateContact({
          id: chatId,
          name: null,
          number: to,
          pushname: null,
          isGroup: chatId.includes("@g.us"),
        });
      }

      const savedMessage = await storage.createMessage({
        chatId,
        from: this.sock.user?.id || chatId,
        to: chatId,
        body: message,
        timestamp: new Date(),
        isFromMe: true,
      });

      return savedMessage;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw new Error(error.message || "Failed to send message");
    }
  }

  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
      }

      await storage.updateSession({
        isConnected: false,
        phoneNumber: null,
        qrCode: null,
      });

      this.isInitialized = false;
      console.log("WhatsApp disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting:", error);
      throw error;
    }
  }

  getClient() {
    return this.sock;
  }
}

export const whatsappService = new WhatsAppService();
