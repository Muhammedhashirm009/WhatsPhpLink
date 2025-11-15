import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, WifiOff, Wifi, LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { WhatsAppSession } from "@shared/schema";

interface ConnectionStatusBannerProps {
  session: WhatsAppSession | undefined;
}

export function ConnectionStatusBanner({ session }: ConnectionStatusBannerProps) {
  const { toast } = useToast();

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({
        title: "Disconnected",
        description: "WhatsApp session has been disconnected",
      });
    },
  });

  const isConnected = session?.isConnected || false;

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-primary" data-testid="icon-connected" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" data-testid="icon-disconnected" />
          )}
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="font-medium"
            data-testid="badge-status"
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-primary-foreground animate-pulse" : "bg-muted-foreground"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {session?.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            <span className="font-mono" data-testid="text-phone-number">{session.phoneNumber}</span>
          </div>
        )}
      </div>

      {isConnected && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
          data-testid="button-disconnect"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      )}
    </header>
  );
}
