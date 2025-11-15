import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Smartphone, Scan } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QRCodeDisplayProps {
  qrCode: string | null | undefined;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  const isImageQR = qrCode?.startsWith("data:image");
  
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Scan className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Connect to WhatsApp</h2>
            <p className="text-muted-foreground">
              Scan the QR code below with your WhatsApp mobile app to link your account
            </p>
          </div>

          <div className="flex justify-center py-6">
            {qrCode ? (
              <div className="p-6 bg-white rounded-lg" data-testid="qr-code-container">
                {isImageQR ? (
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64"
                    data-testid="qr-image"
                  />
                ) : (
                  <QRCodeSVG value={qrCode} size={256} level="M" />
                )}
              </div>
            ) : (
              <div className="p-6 bg-muted rounded-lg">
                <Skeleton className="w-64 h-64" data-testid="qr-loading-skeleton" />
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-start gap-3 text-left">
              <Smartphone className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">How to connect:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu or Settings and select <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong></li>
                  <li>Point your phone at this screen to scan the QR code</li>
                </ol>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your connection is secure and end-to-end encrypted. The QR code refreshes automatically.
          </p>
        </div>
      </Card>
    </div>
  );
}
