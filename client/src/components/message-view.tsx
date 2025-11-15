import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import type { Contact, Message } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MessageViewProps {
  contact: Contact;
  messages: Message[];
  onBack: () => void;
}

export function MessageView({ contact, messages, onBack }: MessageViewProps) {
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();

  const sendMutation = useMutation({
    mutationFn: async (data: { to: string; message: string }) => {
      return await apiRequest("POST", "/api/send-message", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contact.id] });
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: "Could not send the message. Please try again.",
      });
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMutation.mutate({
      to: contact.number,
      message: messageText,
    });
  };

  const getInitials = (contact: Contact) => {
    const name = contact.name || contact.pushname || contact.number;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (contact: Contact) => {
    return contact.name || contact.pushname || contact.number;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 h-16 px-6 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="lg:hidden"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(contact)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold" data-testid="text-contact-name">
            {getDisplayName(contact)}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">{contact.number}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 ${
                    message.isFromMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isFromMe
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-card">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="min-h-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            data-testid="input-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
