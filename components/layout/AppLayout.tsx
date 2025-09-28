"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useState, useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isTablet = useIsTablet();
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    // Default to collapsed on tablet and mobile devices
    setDefaultOpen(!isTablet);
  }, [isTablet]);

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
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