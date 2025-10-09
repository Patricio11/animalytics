"use client";

import { Bell, User, Wallet, BadgeCheck, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth, useRole } from "@/lib/auth/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const [notificationCount] = useState(3); // TODO: Replace with real notification count
  const { user, signOut, isLoading } = useAuth();
  const { role, isBreeder } = useRole();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-50 flex items-center justify-between p-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" className="hover-elevate" />

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover-elevate">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center shadow-elevated">
                  <span className="text-xs text-white font-medium">{notificationCount}</span>
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 shadow-elevated" align="end" forceMount>
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="font-semibold">Notifications</span>
              <Badge variant="secondary" className="ml-auto">
                {notificationCount}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-y-auto">
              {/* TODO: Replace with real notifications */}
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover-elevate">
              <Avatar className="h-9 w-9 shadow-card border-2 border-primary/20">
                <AvatarImage
                  src={user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-gradient-brand text-white font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 shadow-elevated" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {role && (
                  <Badge variant="outline" className="mt-2 w-fit capitalize">
                    {role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {/* Breeder Profile Link (Breeder only) */}
              {isBreeder && (
                <DropdownMenuItem asChild className="hover-elevate cursor-pointer">
                  <Link href="/profile/breeder" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Breeder Profile</span>
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Wallet Link */}
              <DropdownMenuItem asChild className="hover-elevate cursor-pointer">
                <Link href="/wallet" className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </DropdownMenuItem>

              {/* KYC Verification Link (Non-admin only) */}
              {role !== 'admin' && (
                <DropdownMenuItem asChild className="hover-elevate cursor-pointer">
                  <Link href="/verification" className="flex items-center">
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    <span>Verification</span>
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Profile Settings Link */}
              <DropdownMenuItem asChild className="hover-elevate cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive hover-elevate cursor-pointer"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}