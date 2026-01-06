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
  ShoppingBag,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Conversation {
  id: string;
  subject: string | null;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  userRole: 'pet_owner' | 'seller';
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

export default function BreederMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

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

  // Separate conversations by role
  const buyingConversations = conversations.filter(conv => conv.userRole === 'pet_owner');
  const sellingConversations = conversations.filter(conv => conv.userRole === 'seller');

  // Filter conversations by search
  const filterConversations = (convs: Conversation[]) => {
    return convs.filter(conv => {
      const matchesSearch =
        conv.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredBuyingConversations = filterConversations(buyingConversations);
  const filteredSellingConversations = filterConversations(sellingConversations);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your conversations with pet owners and sellers
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(!showArchived)}
                className="whitespace-nowrap"
              >
                <Archive className="w-4 h-4 mr-2" />
                {showArchived ? 'Show Active' : 'Show Archived'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Buying vs Selling */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buying' | 'selling')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buying" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Buying ({buyingConversations.length})
            </TabsTrigger>
            <TabsTrigger value="selling" className="gap-2">
              <Package className="w-4 h-4" />
              Selling ({sellingConversations.length})
            </TabsTrigger>
          </TabsList>

          {/* Buying Tab */}
          <TabsContent value="buying" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBuyingConversations.length > 0 ? (
              <div className="space-y-4">
                {filteredBuyingConversations.map((conversation) => (
                  <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                    <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.otherParticipant.image || undefined} />
                            <AvatarFallback>
                              {getInitials(conversation.otherParticipant.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {conversation.otherParticipant.name}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(conversation.lastMessageAt)}
                              </span>
                            </div>

                            {conversation.listing && (
                              <p className="text-sm text-muted-foreground truncate mb-1">
                                {conversation.listing.title}
                              </p>
                            )}

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {conversation.lastMessagePreview}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unreadCount} new
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Buying
                              </Badge>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No buying conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    Conversations about animals you're purchasing will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Selling Tab */}
          <TabsContent value="selling" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSellingConversations.length > 0 ? (
              <div className="space-y-4">
                {filteredSellingConversations.map((conversation) => (
                  <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                    <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.otherParticipant.image || undefined} />
                            <AvatarFallback>
                              {getInitials(conversation.otherParticipant.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {conversation.otherParticipant.name}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(conversation.lastMessageAt)}
                              </span>
                            </div>

                            {conversation.listing && (
                              <p className="text-sm text-muted-foreground truncate mb-1">
                                {conversation.listing.title}
                              </p>
                            )}

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {conversation.lastMessagePreview}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unreadCount} new
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                Selling
                              </Badge>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No selling conversations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conversations with potential pet owners will appear here
                  </p>
                  <Link href="/marketplace/create">
                    <Button className="bg-gradient-brand hover:opacity-90">
                      Create Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
