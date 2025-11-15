import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Contact } from "@shared/schema";
import { Users } from "lucide-react";

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ContactList({ contacts, selectedContact, onSelectContact }: ContactListProps) {
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

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground text-center">
          No contacts yet. Start a conversation to see contacts here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-1 p-2">
        {contacts.map((contact) => (
          <Button
            key={contact.id}
            variant="ghost"
            className={`w-full justify-start h-16 px-3 ${
              selectedContact?.id === contact.id ? "bg-sidebar-accent" : ""
            }`}
            onClick={() => onSelectContact(contact)}
            data-testid={`contact-item-${contact.id}`}
          >
            <Avatar className="w-10 h-10 mr-3">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(contact)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left overflow-hidden">
              <p className="font-medium truncate text-sm" data-testid={`contact-name-${contact.id}`}>
                {getDisplayName(contact)}
              </p>
              <p className="text-xs text-muted-foreground truncate font-mono">
                {contact.number}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
