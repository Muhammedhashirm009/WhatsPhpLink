# WhatsApp Bot API - PHP Integration Guide

This guide will help you integrate the WhatsApp Bot REST API into your PHP application to send automated messages (e.g., welcome messages when users register).

---

## 📋 API Overview

**Base URL:** `http://your-whatsapp-bot-server:5000`

**Authentication:** None (secure at network/proxy layer)

**Content-Type:** `application/json`

---

## 🔌 Available Endpoints

### 1. **Send Message**
Send a WhatsApp message to a phone number.

**Endpoint:** `POST /api/send-message`

**Request Body:**
```json
{
  "phoneNumber": "918590000953",
  "message": "Hello! Welcome to our service."
}
```

**Request Fields:**
- `phoneNumber` (string, required): Phone number in international format without '+' (e.g., "918590000953" for India)
- `message` (string, required): Text message to send

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Responses:**

*400 Bad Request* - Invalid input:
```json
{
  "error": "Validation error message"
}
```

*500 Internal Server Error* - WhatsApp client not ready or sending failed:
```json
{
  "error": "WhatsApp client is not connected"
}
```

---

### 2. **Get Session Status**
Check if WhatsApp is connected and get QR code if needed.

**Endpoint:** `GET /api/session`

**Success Response (200):**
```json
{
  "id": "unique-session-id",
  "phoneNumber": "918590000953",
  "isConnected": true,
  "qrCode": null,
  "lastConnected": "2025-11-15T12:30:00.000Z"
}
```

**Fields:**
- `isConnected` (boolean): Whether WhatsApp is authenticated and ready
- `qrCode` (string|null): QR code data URL for scanning (only when not connected)
- `phoneNumber` (string|null): Connected WhatsApp number
- `lastConnected` (Date|null): Last successful connection timestamp

---

### 3. **Get Contacts**
Retrieve all WhatsApp contacts.

**Endpoint:** `GET /api/contacts`

**Success Response (200):**
```json
[
  {
    "id": "918590000953@c.us",
    "name": "John Doe",
    "number": "918590000953",
    "pushname": "John"
  }
]
```

---

### 4. **Get Messages**
Retrieve message history for a specific contact.

**Endpoint:** `GET /api/messages?chatId=918590000953@c.us&limit=50`

**Query Parameters:**
- `chatId` (string, required): WhatsApp chat ID (format: `{phoneNumber}@c.us`)
- `limit` (number, optional): Number of messages to retrieve (default: 50)

**Success Response (200):**
```json
[
  {
    "id": "message-id-123",
    "chatId": "918590000953@c.us",
    "content": "Hello!",
    "timestamp": "2025-11-15T12:30:00.000Z",
    "isFromMe": false,
    "senderName": "John Doe"
  }
]
```

---

### 5. **Disconnect WhatsApp**
Logout and disconnect the WhatsApp session.

**Endpoint:** `POST /api/disconnect`

**Success Response (200):**
```json
{
  "success": true,
  "message": "WhatsApp disconnected successfully"
}
```

---

## 💻 PHP Implementation Examples

### Basic Setup - Create a WhatsApp API Client Class

```php
<?php

class WhatsAppAPI {
    private $baseUrl;
    
    public function __construct($baseUrl = 'http://localhost:5000') {
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    
    /**
     * Send a WhatsApp message
     * 
     * @param string $phoneNumber Phone number in international format without '+'
     * @param string $message Message text to send
     * @return array Response from API
     * @throws Exception on API errors
     */
    public function sendMessage($phoneNumber, $message) {
        $endpoint = $this->baseUrl . '/api/send-message';
        
        $data = [
            'phoneNumber' => $phoneNumber,
            'message' => $message
        ];
        
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            throw new Exception("CURL Error: " . $curlError);
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode !== 200) {
            $errorMsg = isset($result['error']) ? $result['error'] : 'Unknown error';
            throw new Exception("API Error ({$httpCode}): {$errorMsg}");
        }
        
        return $result;
    }
    
    /**
     * Check if WhatsApp is connected and ready
     * 
     * @return array Session status
     */
    public function getSessionStatus() {
        $endpoint = $this->baseUrl . '/api/session';
        
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Failed to get session status");
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Check if WhatsApp client is ready to send messages
     * 
     * @return bool True if connected and ready
     */
    public function isReady() {
        try {
            $session = $this->getSessionStatus();
            return isset($session['isConnected']) && $session['isConnected'] === true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get all WhatsApp contacts
     * 
     * @return array List of contacts
     */
    public function getContacts() {
        $endpoint = $this->baseUrl . '/api/contacts';
        
        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Failed to get contacts");
        }
        
        return json_decode($response, true);
    }
}

?>
```

---

### Example 1: Send Welcome Message on User Registration

```php
<?php

// Include the WhatsApp API class
require_once 'WhatsAppAPI.php';

// Your user registration handler
function registerUser($username, $email, $phoneNumber, $password) {
    // 1. Create user in database
    $userId = createUserInDatabase($username, $email, $phoneNumber, $password);
    
    if (!$userId) {
        return ['success' => false, 'error' => 'Failed to create user'];
    }
    
    // 2. Send welcome WhatsApp message
    try {
        $whatsapp = new WhatsAppAPI('http://your-whatsapp-bot-server:5000');
        
        // Check if WhatsApp is ready before sending
        if (!$whatsapp->isReady()) {
            error_log("WhatsApp is not connected. Cannot send welcome message.");
            // Continue registration even if WhatsApp fails
        } else {
            // Format phone number (remove + and spaces)
            $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
            
            $welcomeMessage = "🎉 Welcome to our platform, {$username}!\n\n"
                            . "Thank you for registering. Your account is now active.\n"
                            . "If you need any help, feel free to reach out to our support team.";
            
            $result = $whatsapp->sendMessage($cleanPhone, $welcomeMessage);
            
            if ($result['success']) {
                error_log("Welcome message sent to {$phoneNumber}");
            }
        }
    } catch (Exception $e) {
        // Log the error but don't fail the registration
        error_log("Failed to send WhatsApp message: " . $e->getMessage());
    }
    
    return [
        'success' => true,
        'userId' => $userId,
        'message' => 'Registration successful'
    ];
}

// Example usage
$result = registerUser(
    'johndoe',
    'john@example.com',
    '918590000953',  // International format without +
    'securepassword123'
);

?>
```

---

### Example 2: Send Order Confirmation

```php
<?php

require_once 'WhatsAppAPI.php';

function sendOrderConfirmation($orderId, $customerPhone, $orderDetails) {
    try {
        $whatsapp = new WhatsAppAPI('http://your-whatsapp-bot-server:5000');
        
        if (!$whatsapp->isReady()) {
            throw new Exception("WhatsApp service is not ready");
        }
        
        $message = "✅ Order Confirmed!\n\n"
                 . "Order ID: {$orderId}\n"
                 . "Items: {$orderDetails['items']}\n"
                 . "Total: \${$orderDetails['total']}\n\n"
                 . "We'll notify you when your order ships!";
        
        $result = $whatsapp->sendMessage($customerPhone, $message);
        
        return $result['success'];
        
    } catch (Exception $e) {
        error_log("WhatsApp notification failed: " . $e->getMessage());
        return false;
    }
}

// Usage
sendOrderConfirmation('ORD-12345', '918590000953', [
    'items' => '2x Product A, 1x Product B',
    'total' => '149.99'
]);

?>
```

---

### Example 3: Bulk Message Sender (with Rate Limiting)

```php
<?php

require_once 'WhatsAppAPI.php';

function sendBulkMessages($recipients, $message, $delaySeconds = 2) {
    $whatsapp = new WhatsAppAPI('http://your-whatsapp-bot-server:5000');
    
    if (!$whatsapp->isReady()) {
        throw new Exception("WhatsApp is not ready. Please authenticate first.");
    }
    
    $results = [
        'sent' => 0,
        'failed' => 0,
        'errors' => []
    ];
    
    foreach ($recipients as $index => $phoneNumber) {
        try {
            // Clean phone number
            $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
            
            // Send message
            $result = $whatsapp->sendMessage($cleanPhone, $message);
            
            if ($result['success']) {
                $results['sent']++;
                echo "✓ Message sent to {$phoneNumber}\n";
            } else {
                $results['failed']++;
                $results['errors'][] = [
                    'phone' => $phoneNumber,
                    'error' => 'Send failed'
                ];
            }
            
        } catch (Exception $e) {
            $results['failed']++;
            $results['errors'][] = [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ];
            echo "✗ Failed to send to {$phoneNumber}: {$e->getMessage()}\n";
        }
        
        // Rate limiting: wait between messages
        if ($index < count($recipients) - 1) {
            sleep($delaySeconds);
        }
    }
    
    return $results;
}

// Usage
$customers = ['918590000953', '919876543210', '447700900000'];
$announcement = "🎁 Special Offer! Get 20% off your next purchase. Use code: SAVE20";

$results = sendBulkMessages($customers, $announcement, 3);

echo "\n--- Summary ---\n";
echo "Sent: {$results['sent']}\n";
echo "Failed: {$results['failed']}\n";

?>
```

---

## ⚠️ Important Notes

### Phone Number Format
- **Always use international format WITHOUT the + symbol**
- Examples:
  - ✅ Correct: `918590000953` (India)
  - ✅ Correct: `447700900000` (UK)
  - ✅ Correct: `12025550123` (USA)
  - ❌ Wrong: `+918590000953`
  - ❌ Wrong: `8590000953` (missing country code)

### Error Handling
- Always wrap API calls in try-catch blocks
- Don't fail critical operations (like registration) if WhatsApp fails
- Log errors for monitoring and debugging
- Check `isReady()` before sending messages

### Rate Limiting
- WhatsApp may rate limit if you send too many messages too quickly
- Add delays between bulk messages (2-3 seconds recommended)
- Monitor for API errors indicating rate limits

### Security
- The API currently has **no authentication**
- Secure it at the network level (firewall, VPN, reverse proxy with auth)
- Consider implementing API key authentication for production
- Don't expose the WhatsApp bot server to the public internet

### Connection Management
- The WhatsApp bot must stay authenticated
- If disconnected, admin must scan QR code via web interface
- Monitor the `/api/session` endpoint to detect disconnections
- Set up alerts for when `isConnected` becomes false

---

## 🔧 Testing the Integration

### 1. Check Connection Status
```bash
curl http://localhost:5000/api/session
```

### 2. Send Test Message
```bash
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "918590000953",
    "message": "Test message from PHP app"
  }'
```

### 3. Test with PHP
```php
<?php
require_once 'WhatsAppAPI.php';

$whatsapp = new WhatsAppAPI('http://localhost:5000');

// Test connection
if ($whatsapp->isReady()) {
    echo "✓ WhatsApp is connected and ready\n";
    
    // Send test message
    try {
        $result = $whatsapp->sendMessage('918590000953', 'Hello from PHP!');
        echo "✓ Message sent successfully\n";
    } catch (Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "✗ WhatsApp is not connected\n";
}
?>
```

---

## 📊 Production Deployment Checklist

- [ ] WhatsApp bot deployed on reliable server (see Docker guide)
- [ ] Network security configured (firewall rules, private network)
- [ ] API endpoint URLs configured in PHP app
- [ ] Error logging and monitoring enabled
- [ ] Rate limiting implemented for bulk messages
- [ ] Fallback mechanism for when WhatsApp is disconnected
- [ ] Admin alerts for connection failures
- [ ] Backup communication channel (email) configured

---

## 🆘 Troubleshooting

### "WhatsApp client is not connected"
- Check if the bot is authenticated (scan QR code)
- Verify the bot server is running
- Check `/api/session` endpoint

### "CURL Error: Connection refused"
- Verify the bot server URL is correct
- Check if server is running on port 5000
- Verify network connectivity between PHP server and bot server

### Messages not being delivered
- Verify phone number format (international without +)
- Check if the recipient has WhatsApp installed
- Verify the WhatsApp bot has an active conversation with the recipient
- Check rate limits

### Timeout errors
- Increase CURL timeout in PHP
- Check bot server performance and logs
- Verify network latency

---

## 📚 Additional Resources

- WhatsApp Bot Web Interface: `http://your-bot-server:5000`
- API Integration Documentation: Available in web interface under "API Integration" tab
- Docker Deployment Guide: See `DOCKER_KOYEB_DEPLOYMENT.md`

---

**Need Help?** Check the WhatsApp bot server logs for detailed error messages and connection status.
