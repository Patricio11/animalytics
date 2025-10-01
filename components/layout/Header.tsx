"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { ThemeToggle } from "@/components/shared/ThemeToggle"; // Hidden for now, will work on it later
import { useState, useEffect } from "react";

export function Header() {
  const [notificationCount] = useState(3); // Static for now to avoid hydration issues

  return (
    <header className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-50 flex items-center justify-between p-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" className="hover-elevate" />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover-elevate">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center shadow-elevated">
              <span className="text-xs text-white font-medium">{notificationCount}</span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover-elevate">
              <Avatar className="h-9 w-9 shadow-card">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                  alt="Profile"
                />
                <AvatarFallback className="bg-gradient-brand text-white font-medium">AB</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 shadow-elevated" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Alex Breeder</p>
                <p className="text-xs leading-none text-muted-foreground">alex@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover-elevate">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="hover-elevate">Account</DropdownMenuItem>
            <DropdownMenuItem className="hover-elevate">Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive hover-elevate">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <ThemeToggle /> */}
      </div>
    </header>
  );
}