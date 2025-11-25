"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Settings,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  TestTube,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentSettingsData {
  id: string;
  standardFeePercent: number;
  premiumFeePercent: number;
  minimumFee: number;
  maximumFee: number;
  autoReleaseDays: number;
  disputeWindowDays: number;
  minimumWithdrawal: number;
  withdrawalProcessingDays: number;
  defaultCurrency: string;
}

interface PaymentProvider {
  id: string;
  providerKey: string;
  displayName: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  isDefault: boolean;
  apiKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  webhookUrl: string | null;
  environment: string;
  processingFeePercent: number;
  processingFeeFixed: number;
  lastTestedAt: string | null;
  lastTestSuccess: boolean | null;
  lastTestError: string | null;
}

export function PaymentSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Fetch settings and providers
  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, providersRes] = await Promise.all([
          fetch("/api/admin/payment-settings"),
          fetch("/api/admin/payment-providers"),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data.settings);
        }

        if (providersRes.ok) {
          const data = await providersRes.json();
          setProviders(data.providers);
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast({
          title: "Error",
          description: "Failed to load payment settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  // Save global settings
  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Payment settings have been updated",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update provider
  const handleUpdateProvider = async (provider: PaymentProvider, updates: Partial<PaymentProvider>) => {
    try {
      const response = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? data.provider : p))
        );
        toast({
          title: "Provider Updated",
          description: `${provider.displayName} has been updated`,
        });
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update provider",
        variant: "destructive",
      });
    }
  };

  // Test provider connection
  const handleTestConnection = async (provider: PaymentProvider) => {
    setTestingProvider(provider.id);
    try {
      const response = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: "POST",
      });

      const data = await response.json();

      // Refresh provider to get updated test results
      const providerRes = await fetch(`/api/admin/payment-providers/${provider.id}`);
      if (providerRes.ok) {
        const providerData = await providerRes.json();
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? providerData.provider : p))
        );
      }

      if (data.success) {
        toast({
          title: "Connection Successful",
          description: `${provider.displayName} is properly configured`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Could not connect to provider",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Providers
          </TabsTrigger>
          <TabsTrigger value="fees">
            <DollarSign className="h-4 w-4 mr-2" />
            Fees & Escrow
          </TabsTrigger>
        </TabsList>

        {/* Payment Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{provider.displayName}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Badge variant={provider.isEnabled ? "default" : "outline"}>
                      {provider.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor={`enable-${provider.id}`}>Enable Provider</Label>
                  <Switch
                    id={`enable-${provider.id}`}
                    checked={provider.isEnabled}
                    onCheckedChange={(checked) =>
                      handleUpdateProvider(provider, { isEnabled: checked })
                    }
                  />
                </div>

                <Separator />

                {/* API Keys */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>API Configuration</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          [provider.id]: !prev[provider.id],
                        }))
                      }
                    >
                      {showSecrets[provider.id] ? (
                        <EyeOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      {showSecrets[provider.id] ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${provider.id}`}>Publishable Key</Label>
                      <Input
                        id={`api-key-${provider.id}`}
                        type={showSecrets[provider.id] ? "text" : "password"}
                        placeholder="pk_..."
                        defaultValue={provider.apiKey || ""}
                        onBlur={(e) => {
                          if (e.target.value !== provider.apiKey) {
                            handleUpdateProvider(provider, { apiKey: e.target.value });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`secret-key-${provider.id}`}>Secret Key</Label>
                      <Input
                        id={`secret-key-${provider.id}`}
                        type={showSecrets[provider.id] ? "text" : "password"}
                        placeholder="sk_..."
                        defaultValue={provider.secretKey || ""}
                        onBlur={(e) => {
                          if (e.target.value !== provider.secretKey) {
                            handleUpdateProvider(provider, { secretKey: e.target.value });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`webhook-secret-${provider.id}`}>Webhook Secret</Label>
                      <Input
                        id={`webhook-secret-${provider.id}`}
                        type={showSecrets[provider.id] ? "text" : "password"}
                        placeholder="whsec_..."
                        defaultValue={provider.webhookSecret || ""}
                        onBlur={(e) => {
                          if (e.target.value !== provider.webhookSecret) {
                            handleUpdateProvider(provider, { webhookSecret: e.target.value });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`environment-${provider.id}`}>Environment</Label>
                      <Select
                        value={provider.environment}
                        onValueChange={(value) =>
                          handleUpdateProvider(provider, { environment: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">Test</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Test Connection */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Connection Status</Label>
                    {provider.lastTestedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last tested: {new Date(provider.lastTestedAt).toLocaleString()}
                      </p>
                    )}
                    {provider.lastTestError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {provider.lastTestError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.lastTestSuccess === true && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {provider.lastTestSuccess === false && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(provider)}
                      disabled={testingProvider === provider.id}
                    >
                      {testingProvider === provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-1" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Fees & Escrow Tab */}
        <TabsContent value="fees">
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Fee Configuration
                </CardTitle>
                <CardDescription>
                  Configure platform fees and escrow settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Fees */}
                <div className="space-y-4">
                  <h4 className="font-medium">Platform Fees</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="standard-fee">Standard Fee (%)</Label>
                      <Input
                        id="standard-fee"
                        type="number"
                        step="0.01"
                        value={(settings.standardFeePercent / 100).toFixed(2)}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            standardFeePercent: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Fee for standard sellers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="premium-fee">Premium Fee (%)</Label>
                      <Input
                        id="premium-fee"
                        type="number"
                        step="0.01"
                        value={(settings.premiumFeePercent / 100).toFixed(2)}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            premiumFeePercent: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Discounted fee for verified sellers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-fee">Minimum Fee ($)</Label>
                      <Input
                        id="min-fee"
                        type="number"
                        step="0.01"
                        value={(settings.minimumFee / 100).toFixed(2)}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            minimumFee: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-fee">Maximum Fee ($)</Label>
                      <Input
                        id="max-fee"
                        type="number"
                        step="0.01"
                        value={(settings.maximumFee / 100).toFixed(2)}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            maximumFee: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Escrow Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Escrow Settings
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="auto-release">Auto-Release Days</Label>
                      <Input
                        id="auto-release"
                        type="number"
                        value={settings.autoReleaseDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            autoReleaseDays: parseInt(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Days after delivery to auto-release escrow
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dispute-window">Dispute Window (days)</Label>
                      <Input
                        id="dispute-window"
                        type="number"
                        value={settings.disputeWindowDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            disputeWindowDays: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Withdrawal Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Withdrawal Settings</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="min-withdrawal">Minimum Withdrawal ($)</Label>
                      <Input
                        id="min-withdrawal"
                        type="number"
                        step="0.01"
                        value={(settings.minimumWithdrawal / 100).toFixed(2)}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            minimumWithdrawal: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="processing-days">Processing Days</Label>
                      <Input
                        id="processing-days"
                        type="number"
                        value={settings.withdrawalProcessingDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            withdrawalProcessingDays: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-currency">Default Currency</Label>
                      <Select
                        value={settings.defaultCurrency}
                        onValueChange={(value) =>
                          setSettings({ ...settings, defaultCurrency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
