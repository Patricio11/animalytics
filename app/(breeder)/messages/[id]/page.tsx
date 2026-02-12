"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Archive,
  AlertTriangle,
  Image as ImageIcon,
  Paperclip,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  ShoppingCart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import { CheckoutDialog } from "@/components/marketplace/CheckoutDialog";
import type { UserRole } from "@/lib/utils/routing";

interface Message {
  id: string;
  senderId: string;
  message: string;
  messageType: string;
  attachments: string[] | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string | null;
  status: string;
  userRole: string;
  otherParticipant: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
  };
  listing: {
    id: string;
    slug?: string;
    title: string;
    category: string;
    price: number | null;
    currency: string | null;
    additionalImages?: string[];
    animalId?: string;
  } | null;
  isBlocked: boolean;
  blockedByMe: boolean;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation and messages
  useEffect(() => {
    async function fetchConversation() {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setConversation(data.conversation);
          setMessages(data.messages || []);
        } else if (res.status === 404) {
          router.push('/messages');
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!conversationId) return;

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages?limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Send message
  async function handleSend() {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: session?.user?.id || '',
      message: messageText,
      messageType: 'text',
      attachments: null,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic message with real one
        setMessages(prev =>
          prev.map(m => m.id === optimisticMessage.id ? data.message : m)
        );
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  // Handle key press
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Archive conversation
  async function handleArchive() {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (res.ok) {
        router.push('/messages');
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }

  // Format time
  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Get initials
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Check if message is from current user
  function isMyMessage(message: Message) {
    return message.senderId === session?.user?.id;
  }

  // Group messages by date
  function groupMessagesByDate(messages: Message[]) {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }

  // Format date header
  function formatDateHeader(dateString: string) {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-surface-secondary">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <Skeleton className="h-16 w-64 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-secondary">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col bg-surface-secondary">
      {/* Header */}
      <div className="border-b bg-surface p-4">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="lg:hidden">
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar className="h-10 w-10">
              {conversation.otherParticipant.image ? (
                <AvatarImage src={conversation.otherParticipant.image} />
              ) : null}
              <AvatarFallback>
                {getInitials(conversation.otherParticipant.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{conversation.otherParticipant.name}</h2>
              {conversation.listing && (
                <Link
                  href={`/marketplace/${conversation.listing.slug || conversation.listing.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  {conversation.listing.title}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {conversation.listing && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/marketplace/${conversation.listing.slug || conversation.listing.id}`}>
                  <Info className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto p-4 space-y-6">
          {/* Listing card if exists */}
          {conversation.listing && (
            <div className="flex justify-center">
              <Card className="max-w-md w-full shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-20 w-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      {conversation.listing.additionalImages && conversation.listing.additionalImages.length > 0 ? (
                        <img
                          src={conversation.listing.additionalImages[0]}
                          alt={conversation.listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1 line-clamp-2">
                        {conversation.listing.title}
                      </p>
                      <Badge variant="outline" className="text-xs mb-2">
                        {conversation.listing.category}
                      </Badge>
                      {conversation.listing.price && (
                        <p className="text-lg text-primary font-bold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: conversation.listing.currency || 'USD',
                          }).format(conversation.listing.price / 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Show Buy Now button only if breeder is the pet owner in this conversation */}
                    {conversation.userRole === 'pet_owner' && (
                      <Button 
                        className="flex-1 bg-gradient-brand hover:opacity-90"
                        onClick={() => setCheckoutOpen(true)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    )}
                    <Button variant="outline" asChild className={conversation.userRole === 'pet_owner' ? '' : 'flex-1'}>
                      <Link href={`/marketplace/${conversation.listing.slug || conversation.listing.id}`}>
                        View Listing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Message groups */}
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Date separator */}
              <div className="flex items-center justify-center">
                <div className="bg-muted px-3 py-1 rounded-full">
                  <span className="text-xs text-muted-foreground">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
              </div>

              {/* Messages */}
              {group.messages.map((message, messageIndex) => {
                const isMine = isMyMessage(message);
                const showAvatar = !isMine && (
                  messageIndex === 0 ||
                  group.messages[messageIndex - 1].senderId !== message.senderId
                );

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : ''}`}
                  >
                    {!isMine && (
                      <div className="w-8">
                        {showAvatar && (
                          <Avatar className="h-8 w-8">
                            {conversation.otherParticipant.image ? (
                              <AvatarImage src={conversation.otherParticipant.image} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {getInitials(conversation.otherParticipant.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] group ${isMine ? 'order-1' : ''}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMine ? 'justify-end' : ''
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatTime(message.createdAt)}
                        </span>
                        {isMine && (
                          <span className="text-muted-foreground">
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3 text-primary" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-surface p-4">
        <div className=" mx-auto">
          {conversation.isBlocked ? (
            <div className="text-center py-2 text-muted-foreground text-sm">
              You cannot send messages in this conversation
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button> */}
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 rounded-full"
                disabled={isSending}
              />
              <Button
                size="icon"
                className="shrink-0 rounded-full"
                onClick={handleSend}
                disabled={!newMessage.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Dialog */}
      {conversation?.listing && conversation.userRole === 'pet_owner' && (
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          listing={{
            id: conversation.listing.id,
            title: conversation.listing.title,
            category: conversation.listing.category,
            price: conversation.listing.price || 0,
            currency: conversation.listing.currency || 'USD',
            additionalImages: conversation.listing.additionalImages,
          }}
          conversationId={conversationId}
          userRole="breeder"
        />
      )}
    </div>
  );
}
