"use client";

import { User, Wallet, BadgeCheck, Settings, LogOut, ChevronRight } from "lucide-react";
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
import { NotificationBell } from "@/components/notifications";
import { VerifiedCheckmark } from "@/components/ui/verified-badge";
import { useAuth, useRole } from "@/lib/auth/client";
import { useVerificationStatus } from "@/lib/hooks/useVerificationStatus";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { user, signOut, isLoading } = useAuth();
  const { role, isBreeder } = useRole();
  const { data: verificationStatus } = useVerificationStatus(user?.id);
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent double clicks
    
    setIsSigningOut(true);
    
    try {
      await signOut();
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      
      // Force redirect to sign in page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Sign out error:', error);
      
      toast({
        title: "Error",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
      
      setIsSigningOut(false);
    }
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
    <header className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-50 flex items-center justify-between py-2 px-8">
      <SidebarTrigger data-testid="button-sidebar-toggle" className="hover-elevate" />

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <NotificationBell />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-auto px-3 py-2 hover-elevate rounded-lg flex items-center gap-3"
            >
              <Avatar className="h-9 w-9 shadow-card border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-brand text-white font-semibold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {user?.name || 'User'}
                  </span>
                  {verificationStatus?.isVerified && (
                    <VerifiedCheckmark isVerified={verificationStatus.isVerified} className="w-4 h-4" />
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-[10px] capitalize px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  {role?.replace('_', ' ') || 'User'}
                </Badge>
              </div>
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
              disabled={isLoading || isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}