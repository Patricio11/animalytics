# Messaging System Documentation

## Overview

The Animalytics messaging system is a **future-proof, role-agnostic** real-time messaging platform built using Server-Sent Events (SSE). It supports all user roles and can be easily extended for new features.

## Supported User Roles

- **Buyer** - Users purchasing animals
- **Breeder** - Users selling/breeding animals (can also buy from other breeders)
- **Veterinarian** - Animal health professionals (future: consultations, health advice)
- **Event Organizer** - Show and event organizers (future: event communications)
- **Admin** - Platform administrators

## Architecture

### Core Components

1. **Messaging Service** (`lib/services/messaging-service.ts`)
   - Centralized service for all messaging operations
   - Role-agnostic functions that work for all user types
   - Future-proof design for multi-participant conversations

2. **SSE Endpoint** (`app/api/conversations/events/route.ts`)
   - Real-time updates via Server-Sent Events
   - Updates every 5 seconds (server-side polling)
   - Automatic reconnection and error handling

3. **React Hook** (`hooks/useRealtimeMessaging.ts`)
   - Reusable hook for all sidebars/components
   - Variants for different use cases:
     - `useRealtimeMessaging()` - Full messaging data
     - `useRealtimeMessagingAsBuyer()` - Only buyer messages
     - `useRealtimeMessagingAsSeller()` - Only seller messages
     - `useRealtimeMessagingConditional()` - Conditional display

4. **Database Schema**
   - `conversations` - Buyer-seller conversation threads
   - `messages` - Individual messages
   - `conversationParticipants` - Future: Multi-user conversations

## How It Works

### Real-time Updates Flow

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Client    │  SSE    │  API Route  │  Query  │   Database   │
│  (Sidebar)  │◄────────│   /events   │◄────────│ conversations│
└─────────────┘         └─────────────┘         └──────────────┘
       │                       │
       │ useRealtimeMessaging  │ Every 5 seconds
       │                       │
       └───────────────────────┘
```

1. Client establishes SSE connection to `/api/conversations/events`
2. Server queries database every 5 seconds for unread counts
3. Server pushes updates to all connected clients
4. Client updates UI in real-time

### Benefits Over Traditional Polling

| Traditional Polling (30s) | SSE (Current) |
|--------------------------|---------------|
| Client makes HTTP request every 30s | Single persistent connection |
| Updates visible every 30s | Updates within 5 seconds |
| Higher server load | Lower server load |
| Higher bandwidth usage | Lower bandwidth usage |
| No automatic reconnection | Built-in reconnection |

## Usage Examples

### For Breeder Sidebar

Breeders should only see messages where they're the buyer (purchasing from other breeders):

```typescript
import { useRealtimeMessagingConditional } from "@/hooks/useRealtimeMessaging";

export function BreederSidebar() {
  // Only show messages where breeder is buyer
  // Only show Messages link if they have conversations
  const { unreadCount, hasConversations } = useRealtimeMessagingConditional({
    showOnlyAsBuyer: true,
  });

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    if (item.title === 'Messages') {
      return hasConversations; // Only show if has conversations
    }
    return true;
  });

  return (
    // Render sidebar with badge showing unreadCount
  );
}
```

### For Buyer Sidebar

Buyers see all messages (both as buyer and when they might sell):

```typescript
import { useRealtimeMessaging } from "@/hooks/useRealtimeMessaging";

export function BuyerSidebar() {
  const { unreadCount } = useRealtimeMessaging();

  return (
    // Render sidebar with badge showing unreadCount
  );
}
```

### For Future: Veterinarian Sidebar

Vets will have their own messaging context for consultations:

```typescript
import { useRealtimeMessagingAsSeller } from "@/hooks/useRealtimeMessaging";

export function VetSidebar() {
  // Vets act as "sellers" in the messaging system
  // (they provide services, users are "buyers" of those services)
  const { unreadCount } = useRealtimeMessagingAsSeller();

  return (
    // Render sidebar with consultation messages
  );
}
```

### For Future: Event Organizer Sidebar

Event organizers can communicate with participants:

```typescript
import { useRealtimeMessaging } from "@/hooks/useRealtimeMessaging";

export function EventOrganizerSidebar() {
  const { unreadCount, hasConversations } = useRealtimeMessaging({
    onUpdate: (data) => {
      // Custom logic when messages update
      console.log('New event messages:', data);
    },
  });

  return (
    // Render sidebar with event communication messages
  );
}
```

## Database Schema

### Current Schema (Buyer-Seller Model)

```typescript
conversations {
  id: uuid
  buyerId: text  // User initiating conversation
  sellerId: text // User receiving inquiry
  listingId: uuid (optional)
  unreadCountBuyer: integer
  unreadCountSeller: integer
  archivedByBuyer: boolean
  archivedBySeller: boolean
  blockedByBuyer: boolean
  blockedBySeller: boolean
  status: enum('active', 'archived', 'blocked', 'deleted')
}
```

### Future Schema (Multi-Participant Model)

The `conversationParticipants` table is already in place for future expansion:

```typescript
conversationParticipants {
  id: uuid
  conversationId: uuid
  userId: text
  role: text // 'buyer', 'seller', 'vet', 'event_organizer', 'admin'
  lastReadAt: timestamp
  notificationsEnabled: boolean
  mutedUntil: timestamp
}
```

## Future Enhancements

### 1. Veterinarian Consultations

**Use Case**: Breeders can consult with vets about animal health

```typescript
// lib/services/vet-consultation-service.ts
export async function createVetConsultation(
  breederId: string,
  vetId: string,
  animalId: string,
  initialQuestion: string
) {
  // Create conversation with vet
  // Mark as consultation type
  // Attach animal health records
}
```

### 2. Event Organizer Communications

**Use Case**: Event organizers communicate with participants

```typescript
// lib/services/event-communication-service.ts
export async function createEventThread(
  eventId: string,
  organizerId: string,
  participantIds: string[]
) {
  // Create multi-participant conversation
  // Link to event
  // Enable announcements
}
```

### 3. Group Conversations

**Use Case**: Buyer + Breeder + Vet discussing animal health

```typescript
export async function createGroupConversation(
  participantIds: string[],
  subject: string,
  context: {
    type: 'health' | 'sale' | 'event';
    relatedId: string;
  }
) {
  // Use conversationParticipants table
  // Support multiple users
  // Different notification settings per participant
}
```

## API Endpoints

### GET `/api/conversations`
Get all conversations for current user

**Query Parameters:**
- `status` - Filter by status (default: 'active')
- `archived` - Show archived conversations (default: false)

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "subject": "Question about puppy",
      "unreadCount": 3,
      "userRole": "buyer",
      "otherParticipant": {
        "id": "user-id",
        "name": "John Doe",
        "image": "..."
      },
      "listing": { ... }
    }
  ]
}
```

### POST `/api/conversations`
Create new conversation or add message to existing

**Request Body:**
```json
{
  "sellerId": "user-id",
  "listingId": "listing-id (optional)",
  "subject": "Optional subject",
  "initialMessage": "Hello, I'm interested..."
}
```

### GET `/api/conversations/unread`
Get unread message count

**Response:**
```json
{
  "success": true,
  "unreadCount": 5,
  "breakdown": {
    "asBuyer": 3,
    "asSeller": 2
  }
}
```

### GET `/api/conversations/events` (SSE)
Real-time updates stream

**SSE Event Data:**
```json
{
  "unreadCount": 5,
  "breakdown": {
    "asBuyer": 3,
    "asSeller": 2
  },
  "hasConversations": true,
  "userRole": "breeder",
  "timestamp": "2025-11-29T..."
}
```

## Testing Scenarios

### Scenario 1: Breeder to Breeder Purchase
1. Breeder A browses Breeder B's listing
2. Breeder A sends message → appears in Breeder A's `/buyer/messages`
3. Breeder B receives → appears in Breeder B's `/sales` messages
4. Both see real-time unread counts update

### Scenario 2: Buyer Purchases from Breeder
1. Buyer sends inquiry about animal
2. Message appears in buyer's `/buyer/messages`
3. Breeder sees in their sales dashboard
4. Unread badges update in real-time

### Scenario 3: Future - Vet Consultation
1. Breeder requests vet consultation
2. Conversation created with vet
3. Health records attached to conversation
4. Vet receives in veterinarian dashboard
5. Real-time updates for both parties

## Error Handling

The system includes comprehensive error handling:

1. **Connection Failures**
   - Automatic reconnection after 5 seconds
   - Error callbacks for custom handling
   - Graceful degradation (UI doesn't break)

2. **API Errors**
   - Server sends error events via SSE
   - Client displays appropriate messages
   - Fallback to last known state

3. **Data Validation**
   - All user inputs validated
   - SQL injection prevention (parameterized queries)
   - XSS prevention (sanitized outputs)

## Performance Considerations

1. **Server-Side Polling**: 5-second intervals balance real-time vs server load
2. **Database Indexing**: Indexes on `buyerId`, `sellerId`, `unreadCount` columns
3. **Connection Pooling**: Drizzle ORM handles connection pooling
4. **Caching**: Consider Redis for high-traffic scenarios (future)

## Security

1. **Authentication**: All endpoints require valid session
2. **Authorization**: Users can only access their own conversations
3. **Input Validation**: All inputs sanitized and validated
4. **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
5. **XSS Prevention**: React auto-escapes all outputs

## Migration Guide

### Adding New User Role (e.g., Veterinarian)

1. **Update Database Schema** (if needed)
   ```sql
   -- Role already exists in userRoleEnum
   -- No schema changes needed for basic messaging
   ```

2. **Create Sidebar Component**
   ```typescript
   // components/vet/VetSidebar.tsx
   import { useRealtimeMessagingAsSeller } from "@/hooks/useRealtimeMessaging";

   export function VetSidebar() {
     const { unreadCount } = useRealtimeMessagingAsSeller();
     // ... rest of sidebar
   }
   ```

3. **Create Layout**
   ```typescript
   // app/vet/layout.tsx
   import { requireRole } from "@/lib/auth/server";

   export default async function VetLayout({ children }) {
     await requireRole(["veterinarian"]);
     return <VetLayout>{children}</VetLayout>;
   }
   ```

4. **Add Routes**
   ```typescript
   // app/vet/messages/page.tsx
   // Similar to buyer/messages but for vet context
   ```

That's it! The messaging service is already role-agnostic and will work automatically.

## Troubleshooting

### SSE Connection Not Working

1. Check browser console for errors
2. Verify `/api/conversations/events` endpoint is accessible
3. Check server logs for SSE errors
4. Ensure session is valid

### Unread Count Not Updating

1. Verify database `unreadCountBuyer`/`unreadCountSeller` columns
2. Check message creation updates these counts
3. Verify SSE connection is active
4. Check browser network tab for SSE events

### Messages Not Appearing

1. Verify conversation exists in database
2. Check `archivedBy*` and `blockedBy*` flags
3. Ensure user is participant (buyerId or sellerId)
4. Check conversation status is 'active'

## Contributing

When adding new messaging features:

1. Use `messaging-service.ts` for all database operations
2. Keep APIs role-agnostic
3. Update this documentation
4. Add tests for new scenarios
5. Consider future roles in design

## License

Part of Animalytics platform - Internal documentation
