import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function APIIntegration() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const apiEndpoint = `${window.location.origin}/api/send-message`;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const phpExample = `<?php
// Send WhatsApp message from your PHP application

$url = '${apiEndpoint}';
$data = [
    'to' => '1234567890',  // Phone number with country code
    'message' => 'Welcome! Thanks for registering.'
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result !== false) {
    echo "Message sent successfully!";
} else {
    echo "Failed to send message";
}
?>`;

  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "1234567890",
    "message": "Hello from API!"
  }'`;

  const jsExample = `// JavaScript/Node.js Example
fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '1234567890',
    message: 'Welcome! Thanks for registering.'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`;

  const pythonExample = `# Python Example
import requests
import json

url = '${apiEndpoint}'
data = {
    'to': '1234567890',
    'message': 'Welcome! Thanks for registering.'
}

response = requests.post(url, json=data)
print(response.json())`;

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">API Integration</h2>
              <p className="text-muted-foreground">
                Connect your PHP application to send automated WhatsApp messages
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>API Endpoint</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(apiEndpoint, -1)}
                data-testid="button-copy-endpoint"
              >
                {copiedIndex === -1 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              POST requests to this endpoint to send WhatsApp messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 font-mono text-sm">
              <code data-testid="text-api-endpoint">{apiEndpoint}</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Format</CardTitle>
            <CardDescription>Send JSON data with these fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-md p-4">
                <pre className="text-sm overflow-x-auto">
{`{
  "to": "1234567890",      // Phone number with country code
  "message": "Your text"   // Message content
}`}
                </pre>
              </div>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">to</p>
                    <p className="text-xs text-muted-foreground">
                      Phone number with country code (no + or spaces). Example: 1234567890
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-sm">message</p>
                    <p className="text-xs text-muted-foreground">
                      The text message content to send
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Integration examples for different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="php">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="php" data-testid="button-tab-php">PHP</TabsTrigger>
                <TabsTrigger value="curl" data-testid="button-tab-curl">cURL</TabsTrigger>
                <TabsTrigger value="js" data-testid="button-tab-js">JavaScript</TabsTrigger>
                <TabsTrigger value="python" data-testid="button-tab-python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="php" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(phpExample, 0)}
                    data-testid="button-copy-php"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs">
                    <code>{phpExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="curl" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(curlExample, 1)}
                    data-testid="button-copy-curl"
                  >
                    {copiedIndex === 1 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs">
                    <code>{curlExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="js" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(jsExample, 2)}
                    data-testid="button-copy-js"
                  >
                    {copiedIndex === 2 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs">
                    <code>{jsExample}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="python" className="mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(pythonExample, 3)}
                    data-testid="button-copy-python"
                  >
                    {copiedIndex === 3 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs">
                    <code>{pythonExample}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Use Case: Welcome Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically send a WhatsApp welcome message when a customer registers on your PHP website:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Customer completes registration form on your PHP site</li>
              <li>Your PHP backend validates the registration</li>
              <li>Make a POST request to the API endpoint with customer's phone number</li>
              <li>Customer receives instant WhatsApp confirmation message</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
