"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Settings as SettingsIcon } from "lucide-react";
import { PaymentSettings } from "@/components/settings/PaymentSettings";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and payment options</p>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 bg-surface shadow-card">
            <TabsTrigger value="payments" className="text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Payment Settings</span>
              <span className="sm:hidden">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">
              <SettingsIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">System Configuration</span>
              <span className="sm:hidden">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Payment Settings */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentSettings />
          </TabsContent>

          {/* System Settings (placeholder for future enhancements) */}
          <TabsContent value="system" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <SettingsIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">System Configuration</h3>
              <p className="text-sm">Additional system settings coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
