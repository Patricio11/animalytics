import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getUnreadCount, hasConversations as checkHasConversations } from '@/lib/services/messaging-service';

/**
 * GET /api/conversations/events
 * Server-Sent Events endpoint for real-time conversation updates
 * Streams updates when unread counts or conversation status changes
 *
 * Supports all user roles: Buyer, Breeder, Veterinarian, Event Organizer
 * Future-proof design for multi-participant conversations
 */
export async function GET(request: NextRequest) {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // Create a readable stream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Function to fetch and send current unread count
      const sendUpdate = async () => {
        try {
          // Use centralized messaging service (future-proof for all roles)
          const unreadData = await getUnreadCount(userId);
          const hasConversationsFlag = await checkHasConversations(userId);

          // Send SSE message
          const data = {
            unreadCount: unreadData.total,
            breakdown: unreadData.breakdown,
            hasConversations: hasConversationsFlag,
            userRole, // Include role for client-side logic
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('Error sending SSE update:', error);
          // Send error event to client
          const errorData = {
            error: true,
            message: 'Failed to fetch conversation updates',
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
        }
      };

      // Send initial update immediately
      await sendUpdate();

      // Poll database every 5 seconds for changes
      // This is more efficient than client-side polling because:
      // 1. Only one connection per client instead of repeated HTTP requests
      // 2. Server controls the update frequency
      // 3. Client receives updates as soon as they're available
      const interval = setInterval(sendUpdate, 5000);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
