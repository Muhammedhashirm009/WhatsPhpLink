# WhatsApp Bot Dashboard Design Guidelines

## Design Approach

**System**: Modern messaging interface inspired by WhatsApp Web, Telegram Web, and Discord - prioritizing efficiency, clarity, and real-time information display.

**Principles**:
- Instant information visibility (connection status, incoming messages)
- Scannable interface with clear visual hierarchy
- Minimal friction for common actions (send message, view contacts)
- Reliable, professional aesthetic appropriate for business automation

---

## Layout System

**Spacing Units**: Use Tailwind units of `2, 4, 6, 8, 12, 16` for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section spacing: `gap-4` to `gap-8`
- Container margins: `m-8` to `m-12`

**Grid Structure**:
```
Desktop Layout (3-column):
├── Sidebar (w-80): Navigation, connection status, contact list
├── Main Panel (flex-1): Active chat/message view, QR display
└── Details Panel (w-64): Contact info, settings (collapsible)

Mobile Layout (stacked):
└── Full-width panels with tab navigation
```

**Container Strategy**:
- Main dashboard: `max-w-7xl mx-auto`
- Content panels: Full height with `h-screen` and overflow handling
- Forms/inputs: `max-w-2xl` for optimal readability

---

## Typography

**Font Family**: 
- Primary: Inter or System UI stack via Google Fonts
- Monospace: JetBrains Mono for phone numbers, IDs

**Hierarchy**:
- Dashboard title: `text-2xl font-semibold`
- Section headers: `text-lg font-medium`
- Message text: `text-base font-normal`
- Timestamps/metadata: `text-sm font-normal`
- Status indicators: `text-xs font-medium uppercase tracking-wide`

---

## Component Library

### Core Layout Components

**1. Connection Status Bar** (Top banner)
- Full-width sticky header
- Height: `h-14`
- Contains: Status indicator (dot + text), connected phone number, disconnect button
- Icons: Phone icon, signal strength indicator

**2. Navigation Sidebar**
- Fixed width: `w-80`
- Sections: Connection status, Recent chats, Contacts, Settings
- List items: `h-16` with avatar placeholder (initial letters), name, last message preview
- Active state: Subtle background change
- Scrollable contact list with `overflow-y-auto`

**3. QR Code Display Panel**
- Centered in main area when disconnected
- QR code size: `w-64 h-64`
- Instruction text above QR: `text-lg`
- Step-by-step guide below with numbered list
- Auto-refresh indicator when generating new QR
- Icon: QR code scanner illustration

### Messaging Components

**4. Chat Header**
- Height: `h-16`
- Contains: Contact name, phone number, online status
- Right actions: Search, info icon

**5. Message Container**
- Full height with `flex-1` and `overflow-y-auto`
- Messages: `max-w-lg` bubbles aligned left (received) or right (sent)
- Padding: `px-4 py-2` inside bubbles
- Timestamp: `text-xs` below each message
- Date separators: Centered `text-sm` with divider lines

**6. Message Input Area**
- Fixed bottom position
- Input field: `min-h-12` auto-expanding textarea
- Send button: Icon button on the right
- Attachment button: Icon button on the left
- Border top separator

### Forms & Inputs

**7. Send Message Form** (for API/manual sending)
- Phone number input: `w-full` with country code prefix
- Message textarea: `min-h-32` with character counter
- Template selector: Dropdown for pre-defined messages
- Send button: Full-width on mobile, right-aligned on desktop

**8. Contact List View**
- Virtualized list for performance
- Each contact: Avatar (circle with initials) + Name + Phone
- Search/filter bar at top: `h-12` with search icon
- Alphabetical section headers

### Real-time Features

**9. Status Indicators**
- Connection: Dot with pulsing animation (connected), static (disconnected)
- Message status: Single check (sent), double check (delivered), blue checks (read)
- Typing indicator: Three animated dots in chat

**10. Notification Badges**
- Unread count: Circle with number, positioned absolutely on contact items
- Size: `w-6 h-6 min-w-6` to accommodate 2-digit numbers

---

## Animations

**Minimal Motion Approach**:
- QR code fade-in: 200ms when generated
- Message send: Slide-in from right (sent), left (received) - 150ms
- Status indicator pulse: Gentle 2s loop for "connected" state
- No scroll-triggered animations
- No complex transitions between views

---

## Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Single column, tab navigation, full-screen panels
- Tablet (768px-1024px): Two-column (sidebar + main)
- Desktop (>1024px): Three-column layout with details panel

**Mobile Optimizations**:
- Collapsible sidebar accessed via hamburger menu
- Bottom navigation for Chats, Contacts, Settings
- Full-screen QR code display
- Simplified contact list with swipe actions

---

## Key User Flows

**1. Initial Authentication**:
- Hero area displays large QR code (centered, `w-80 h-80`)
- Clear instructions: "Scan with WhatsApp mobile app"
- Loading state while waiting for scan
- Success confirmation with phone number display

**2. Active Messaging**:
- Persistent sidebar showing all chats
- Click contact → Load chat in main panel
- Compose area always visible at bottom
- Real-time message arrival with subtle notification

**3. API Integration View**:
- Dedicated section showing API endpoint
- Code snippet for PHP integration
- Test message form
- Recent API calls log with status

---

## Accessibility

- All interactive elements: `min-h-11` touch targets
- Form labels: Always visible, not placeholder-dependent  
- Focus states: Clear outline on all inputs and buttons
- ARIA labels: For icon-only buttons (send, attach, search)
- Keyboard navigation: Full support for tab, enter, escape
- Screen reader announcements: For new messages, connection status changes

---

## Images

**Hero Section**: NO large hero image - this is a utility dashboard
**Avatars**: Circle placeholders with first letter of contact name
**QR Code**: Generated dynamically, displayed as centered focal point when not connected
**Icons**: Use Heroicons (outline style) via CDN for all UI icons
**Empty States**: Simple icon + text (no illustrations) for "No messages", "No contacts"