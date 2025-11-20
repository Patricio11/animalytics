"use client";

import { Home, MessageSquare, ShoppingBag, Heart, User, Settings, Search, Bell, HelpCircle, Wallet } from "lucide-react";
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
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/buyer/dashboard",
    icon: Home,
  },
  {
    title: "Browse Listings",
    url: "/marketplace",
    icon: Search,
  },
  {
    title: "Messages",
    url: "/buyer/messages",
    icon: MessageSquare,
    badge: true, // Will show unread count
  },
  {
    title: "My Purchases",
    url: "/buyer/purchases",
    icon: ShoppingBag,
  },
  {
    title: "Saved Listings",
    url: "/buyer/saved",
    icon: Heart,
  },
];

const secondaryItems = [
  {
    title: "My Profile",
    url: "/buyer/profile",
    icon: User,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
];

export function BuyerSidebar() {
  const pathname = usePathname();

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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + '/')} tooltip={item.title}>
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

        <SidebarGroup className="border-t border-primary/10 pt-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">Account</SidebarGroupLabel>
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
