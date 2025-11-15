import { 
  type Message, 
  type InsertMessage,
  type Contact,
  type InsertContact,
  type WhatsAppSession,
  type InsertWhatsAppSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatId?: string, limit?: number): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  
  // Contacts
  createOrUpdateContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  
  // WhatsApp Session
  getSession(): Promise<WhatsAppSession | undefined>;
  updateSession(session: Partial<InsertWhatsAppSession>): Promise<WhatsAppSession>;
  createSession(session: InsertWhatsAppSession): Promise<WhatsAppSession>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private contacts: Map<string, Contact>;
  private session: WhatsAppSession | undefined;

  constructor() {
    this.messages = new Map();
    this.contacts = new Map();
    this.session = undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: insertMessage.timestamp || new Date(),
      isFromMe: insertMessage.isFromMe ?? false
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(chatId?: string, limit: number = 100): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values());
    
    const filtered = chatId 
      ? allMessages.filter(m => m.chatId === chatId)
      : allMessages;
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createOrUpdateContact(contact: InsertContact): Promise<Contact> {
    this.contacts.set(contact.id, contact as Contact);
    return contact as Contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .sort((a, b) => (a.name || a.pushname || a.number).localeCompare(b.name || b.pushname || b.number));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getSession(): Promise<WhatsAppSession | undefined> {
    return this.session;
  }

  async updateSession(sessionUpdate: Partial<InsertWhatsAppSession>): Promise<WhatsAppSession> {
    if (!this.session) {
      this.session = {
        id: randomUUID(),
        phoneNumber: null,
        isConnected: false,
        qrCode: null,
        lastConnected: null,
        ...sessionUpdate
      };
    } else {
      this.session = {
        ...this.session,
        ...sessionUpdate
      };
    }
    return this.session;
  }

  async createSession(insertSession: InsertWhatsAppSession): Promise<WhatsAppSession> {
    const id = randomUUID();
    this.session = { 
      id,
      phoneNumber: insertSession.phoneNumber ?? null,
      isConnected: insertSession.isConnected ?? false,
      qrCode: insertSession.qrCode ?? null,
      lastConnected: insertSession.lastConnected ?? null
    };
    return this.session;
  }
}

export const storage = new MemStorage();
