import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { ConnectionStatusBanner } from "@/components/connection-status";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { ContactList } from "@/components/contact-list";
import { MessageView } from "@/components/message-view";
import { SendMessageForm } from "@/components/send-message-form";
import { APIIntegration } from "@/components/api-integration";
import type { Contact, Message, WhatsAppSession } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Code } from "lucide-react";

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState("chats");

  const { data: session, refetch: refetchSession } = useQuery<WhatsAppSession>({
    queryKey: ["/api/session"],
  });

  const { data: contacts = [], refetch: refetchContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: session?.isConnected || false,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedContact?.id],
    enabled: !!selectedContact,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = io(wsUrl, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
    });

    newSocket.on("qr", () => {
      refetchSession();
    });

    newSocket.on("ready", () => {
      refetchSession();
      refetchContacts();
    });

    newSocket.on("authenticated", () => {
      refetchSession();
    });

    newSocket.on("disconnected", () => {
      refetchSession();
      setSelectedContact(null);
    });

    newSocket.on("message", () => {
      refetchMessages();
      refetchContacts();
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const style = {
    "--sidebar-width": "20rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold" data-testid="text-app-title">WhatsApp Bot</h1>
                <p className="text-xs text-muted-foreground">Automated Messaging</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chats" className="text-xs" data-testid="button-tab-chats">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chats
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="text-xs" data-testid="button-tab-contacts">
                      <Users className="w-4 h-4 mr-1" />
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger value="api" className="text-xs" data-testid="button-tab-api">
                      <Code className="w-4 h-4 mr-1" />
                      API
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </SidebarGroupContent>
            </SidebarGroup>

            {session?.isConnected && (
              <SidebarGroup>
                <SidebarGroupLabel className="px-4">
                  {activeTab === "contacts" ? "All Contacts" : "Recent Chats"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <ContactList
                    contacts={contacts}
                    selectedContact={selectedContact}
                    onSelectContact={setSelectedContact}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <ConnectionStatusBanner session={session} />

          <main className="flex-1 overflow-hidden bg-background">
            {activeTab === "api" ? (
              <APIIntegration />
            ) : !session?.isConnected ? (
              <QRCodeDisplay qrCode={session?.qrCode} />
            ) : activeTab === "chats" && selectedContact ? (
              <MessageView
                contact={selectedContact}
                messages={messages}
                onBack={() => setSelectedContact(null)}
              />
            ) : activeTab === "chats" && !selectedContact ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a Chat</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose a contact from the sidebar to view your conversation
                  </p>
                </div>
              </div>
            ) : activeTab === "contacts" ? (
              <SendMessageForm />
            ) : null}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
