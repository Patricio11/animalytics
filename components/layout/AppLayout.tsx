"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PetOwnerSidebar } from "@/components/pet-owner/PetOwnerSidebar";
import { Header } from "@/components/layout/Header";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useOAuthInit } from "@/lib/hooks/use-oauth-init";
import { authClient } from "@/lib/auth/client";
import { useState, useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isTablet = useIsTablet();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role;

  // Initialize OAuth user profile if needed
  useOAuthInit();

  useEffect(() => {
    // Default to collapsed on tablet and mobile devices
    setDefaultOpen(!isTablet);
  }, [isTablet]);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.8rem",
  };

  // Determine which sidebar to show based on user role
  const Sidebar = userRole === 'pet_owner' ? PetOwnerSidebar : AppSidebar;

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}