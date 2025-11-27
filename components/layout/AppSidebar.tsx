"use client";

import { Home, PawPrint, Activity, CheckSquare, ShoppingBag, Calculator, Users, FileText, Settings, Wallet, BadgeCheck, GitBranch, DollarSign, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Animals",
    url: "/animals",
    icon: PawPrint,
  },
  {
    title: "Pedigree",
    url: "/pedigree",
    icon: GitBranch,
  },
  {
    title: "Mating Calculator",
    url: "/calculators",
    icon: Calculator,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Activity,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Messages",
    url: "/buyer/messages",
    icon: MessageSquare,
    badge: true,
  },
  {
    title: "My Sales",
    url: "/sales",
    icon: DollarSign,
  },
];

const secondaryItems = [
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Verification",
    url: "/verification",
    icon: BadgeCheck,
  },
  {
    title: "Breeders",
    url: "/breeders",
    icon: Users,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasConversations, setHasConversations] = useState(false);

  // Fetch unread message count and check if user has conversations
  useEffect(() => {
    async function fetchMessagingData() {
      try {
        // Fetch unread count
        const unreadRes = await fetch('/api/conversations/unread');
        if (unreadRes.ok) {
          const unreadData = await unreadRes.json();
          const buyerUnread = unreadData.breakdown?.asBuyer || 0;
          setUnreadCount(buyerUnread);
        }

        // Fetch conversations to check if user has any as buyer
        const conversationsRes = await fetch('/api/conversations');
        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          setHasConversations(conversationsData.conversations?.length > 0);
        }
      } catch (error) {
        console.error('Error fetching messaging data:', error);
      }
    }

    fetchMessagingData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMessagingData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter menu items - only show Messages if breeder has conversations
  const filteredMenuItems = menuItems.filter(item => {
    if (item.title === 'Messages') {
      return hasConversations; // Only show if breeder has conversations
    }
    return true; // Show all other items
  });

  return (
    <Sidebar collapsible="icon" className="border-r bg-surface shadow-card">
      <SidebarContent className="bg-surface [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:transition-colors">
        <div className="p-4 group-data-[collapsible=icon]:p-2 border-b border-primary/10">
          <Link href="/" className="flex items-center justify-start group-data-[collapsible=icon]:justify-center hover:opacity-90 transition-all duration-200">
            <div className="w-40 h-auto flex items-center justify-start group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 overflow-hidden">
              <img
                src="/animalytics.png"
                alt="Animalytics Logo"
                className="w-full h-auto object-contain object-left group-data-[collapsible=icon]:scale-[9] group-data-[collapsible=icon]:translate-x-[395%]"
              />
            </div>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:gap-2">
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + '/')} tooltip={item.title}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                      <span>{item.title}</span>
                      {item.badge && unreadCount > 0 && (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-t border-primary/10 pt-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:gap-2">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}