/**
 * useRealtimeMessaging Hook
 * Provides real-time messaging updates via Server-Sent Events
 * Works for all user roles: Buyer, Breeder, Veterinarian, Event Organizer
 * Future-proof design for multi-participant conversations
 */

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

export interface MessagingData {
  unreadCount: number;
  breakdown: {
    asBuyer: number;
    asSeller: number;
  };
  hasConversations: boolean;
  userRole?: string;
}

export interface UseRealtimeMessagingOptions {
  /**
   * For role-specific sidebars (like breeder sidebar),
   * only show unread count for specific role context
   */
  showOnlyAsBuyer?: boolean;
  showOnlyAsSeller?: boolean;

  /**
   * Only show messages link if user has conversations
   * Useful for conditional rendering
   */
  hideIfNoConversations?: boolean;

  /**
   * Callback when messaging data updates
   */
  onUpdate?: (data: MessagingData) => void;

  /**
   * Callback when connection fails
   */
  onError?: (error: Error) => void;
}

export interface UseRealtimeMessagingReturn {
  /** Total unread count (or role-specific if filtered) */
  unreadCount: number;

  /** Whether user has any conversations */
  hasConversations: boolean;

  /** Whether SSE connection is active */
  isConnected: boolean;

  /** Whether there was a connection error */
  hasError: boolean;

  /** Full messaging data */
  data: MessagingData | null;
}

/**
 * Custom hook for real-time messaging updates
 * Uses Server-Sent Events for efficient, real-time updates
 */
export function useRealtimeMessaging(
  options: UseRealtimeMessagingOptions = {}
): UseRealtimeMessagingReturn {
  const {
    showOnlyAsBuyer = false,
    showOnlyAsSeller = false,
    hideIfNoConversations = false,
    onUpdate,
    onError,
  } = options;

  const [data, setData] = useState<MessagingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Check authentication status
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Don't connect if not authenticated or still loading
    if (!session || isPending) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      try {
        // Clear any existing connection
        if (eventSource) {
          eventSource.close();
        }

        setHasError(false);
        eventSource = new EventSource('/api/conversations/events');

        eventSource.onopen = () => {
          setIsConnected(true);
          setHasError(false);
        };

        eventSource.onmessage = (event) => {
          try {
            const messageData = JSON.parse(event.data);

            // Check for error messages from server
            if (messageData.error) {
              console.error('Server error:', messageData.message);
              setHasError(true);
              if (onError) {
                onError(new Error(messageData.message));
              }
              return;
            }

            // Update messaging data
            setData(messageData);
            setHasError(false);

            // Call update callback
            if (onUpdate) {
              onUpdate(messageData);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
            setHasError(true);
            if (onError && error instanceof Error) {
              onError(error);
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          setIsConnected(false);
          setHasError(true);

          if (onError) {
            onError(new Error('SSE connection failed'));
          }

          // Close the failed connection
          eventSource?.close();

          // Retry connection after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Reconnecting to SSE...');
            connectSSE();
          }, 5000);
        };
      } catch (error) {
        console.error('Error connecting to SSE:', error);
        setHasError(true);
        setIsConnected(false);

        if (onError && error instanceof Error) {
          onError(error);
        }

        // Retry connection after 5 seconds
        reconnectTimeout = setTimeout(() => {
          connectSSE();
        }, 5000);
      }
    };

    // Initial connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [session, isPending, onUpdate, onError]);

  // Calculate unread count based on options
  let unreadCount = 0;
  if (data) {
    if (showOnlyAsBuyer) {
      unreadCount = data.breakdown.asBuyer;
    } else if (showOnlyAsSeller) {
      unreadCount = data.breakdown.asSeller;
    } else {
      unreadCount = data.unreadCount;
    }
  }

  // Determine if should show conversations
  const hasConversations = data?.hasConversations ?? false;

  return {
    unreadCount,
    hasConversations: hideIfNoConversations ? hasConversations : true,
    isConnected,
    hasError,
    data,
  };
}

/**
 * Hook variant for buyer-specific sidebars
 * Shows only messages where user is the buyer
 */
export function useRealtimeMessagingAsBuyer(
  options: Omit<UseRealtimeMessagingOptions, 'showOnlyAsBuyer'> = {}
) {
  return useRealtimeMessaging({
    ...options,
    showOnlyAsBuyer: true,
  });
}

/**
 * Hook variant for seller-specific sidebars
 * Shows only messages where user is the seller (breeder, vet, event organizer)
 */
export function useRealtimeMessagingAsSeller(
  options: Omit<UseRealtimeMessagingOptions, 'showOnlyAsSeller'> = {}
) {
  return useRealtimeMessaging({
    ...options,
    showOnlyAsSeller: true,
  });
}

/**
 * Hook variant for conditional display
 * Only shows messages link if user has conversations
 * Useful for breeder sidebar where Messages should only appear if they have conversations
 */
export function useRealtimeMessagingConditional(
  options: Omit<UseRealtimeMessagingOptions, 'hideIfNoConversations'> = {}
) {
  return useRealtimeMessaging({
    ...options,
    hideIfNoConversations: true,
  });
}
