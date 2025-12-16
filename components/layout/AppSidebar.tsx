"use client";

import { useState, useEffect } from "react";
import { Home, PawPrint, Activity, CheckSquare, ShoppingBag, Calculator, Users, FileText, Settings, Wallet, BadgeCheck, GitBranch, DollarSign, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useRealtimeMessagingConditional } from "@/hooks/useRealtimeMessaging";

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
    url: "/messages",
    icon: MessageSquare,
    badge: true,
  },
  {
    title: "My Purchases",
    url: "/purchases",
    icon: ShoppingBag,
  },
  {
    title: "Saved Listings",
    url: "/saved",
    icon: Heart,
  },
  {
    title: "My Sales",
    url: "/sales",
    icon: DollarSign,
  },
];

const secondaryItems = [
  // TODO: Implement Wallet feature
  // {
  //   title: "Wallet",
  //   url: "/wallet",
  //   icon: Wallet,
  // },
  // TODO: Implement Verification feature
  // {
  //   title: "Verification",
  //   url: "/verification",
  //   icon: BadgeCheck,
  // },
  {
    title: "Breeders",
    url: "/breeders",
    icon: Users,
  },
  // TODO: Implement Documents feature
  // {
  //   title: "Documents",
  //   url: "/documents",
  //   icon: FileText,
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [hasPurchases, setHasPurchases] = useState(false);
  const [hasSavedListings, setHasSavedListings] = useState(false);

  // Real-time messaging updates using SSE
  // For breeders: only show buyer messages (when they're purchasing from others)
  // Only show Messages link if breeder has conversations
  const { unreadCount, hasConversations } = useRealtimeMessagingConditional({
    showOnlyAsBuyer: true, // Breeders only see messages where they're the buyer
  });

  // Check if user has purchases or saved listings
  useEffect(() => {
    async function checkUserData() {
      try {
        // Check for purchases
        const purchasesRes = await fetch('/api/purchases');
        if (purchasesRes.ok) {
          const purchasesData = await purchasesRes.json();
          setHasPurchases(purchasesData.purchases?.length > 0);
        }

        // Check for saved listings
        const savedRes = await fetch('/api/marketplace/saved');
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setHasSavedListings(savedData.saved?.length > 0);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    }

    checkUserData();
  }, []);

  // Filter menu items - only show if user has relevant data
  const filteredMenuItems = menuItems.filter(item => {
    if (item.title === 'Messages') {
      return hasConversations; // Only show if breeder has conversations
    }
    if (item.title === 'My Purchases') {
      return hasPurchases; // Only show if breeder has purchases
    }
    if (item.title === 'Saved Listings') {
      return hasSavedListings; // Only show if breeder has saved listings
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