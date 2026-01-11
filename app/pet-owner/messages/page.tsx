"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Search,
  Archive,
  MoreVertical,
  ArrowLeft,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  subject: string | null;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  otherParticipant: {
    id: string;
    name: string;
    image: string | null;
  };
  listing: {
    id: string;
    title: string;
    category: string;
  } | null;
}

export default function PetOwnerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const params = new URLSearchParams();
        if (showArchived) params.append('archived', 'true');

        const res = await fetch(`/api/conversations?${params}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [showArchived]);

  // Format relative time
  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }

  // Get initials for avatar
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherParticipant.name.toLowerCase().includes(query) ||
      conv.listing?.title?.toLowerCase().includes(query) ||
      conv.lastMessagePreview?.toLowerCase().includes(query)
    );
  });

  // Handle archive conversation
  async function handleArchive(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: showArchived ? 'unarchive' : 'archive' }),
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className=" mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground text-sm">
              Communicate with sellers
            </p>
          </div>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Show Active' : 'Archived'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${
                      conv.unreadCount > 0 ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Link
                      href={`/buyer/messages/${conv.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar className="h-12 w-12">
                        {conv.otherParticipant.image ? (
                          <AvatarImage src={conv.otherParticipant.image} />
                        ) : null}
                        <AvatarFallback>
                          {getInitials(conv.otherParticipant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${
                            conv.unreadCount > 0 ? 'font-semibold' : ''
                          }`}>
                            {conv.otherParticipant.name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.listing && (
                          <p className="text-xs text-primary truncate">
                            {conv.listing.title}
                          </p>
                        )}
                        <p className={`text-sm truncate ${
                          conv.unreadCount > 0
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                          {conv.lastMessagePreview || 'No messages yet'}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conv.lastMessageAt ? formatRelativeTime(conv.lastMessageAt) : ''}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleArchive(conv.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            {showArchived ? 'Unarchive' : 'Archive'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {showArchived ? 'No archived conversations' : 'No conversations yet'}
                </p>
                <p className="text-sm mt-1">
                  {showArchived
                    ? 'Archived conversations will appear here'
                    : 'Start a conversation by contacting a seller'}
                </p>
                {!showArchived && (
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
