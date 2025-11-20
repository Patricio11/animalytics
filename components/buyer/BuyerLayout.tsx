"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { BuyerSidebar } from "@/components/buyer/BuyerSidebar";
import { Header } from "@/components/layout/Header";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useOAuthInit } from "@/lib/hooks/use-oauth-init";
import { useState, useEffect } from "react";

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  const isTablet = useIsTablet();
  const [defaultOpen, setDefaultOpen] = useState(true);

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

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <BuyerSidebar />
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
