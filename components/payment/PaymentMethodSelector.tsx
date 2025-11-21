"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/services/payment";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  processingTime?: string;
  fee?: number;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
  walletBalance?: number;
  amount: number;
  currency?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Credit/Debit Card",
    description: "Pay securely with Stripe",
    icon: CreditCard,
    available: true,
    processingTime: "Instant",
    fee: 0,
  },
  {
    id: "wallet",
    name: "Platform Wallet",
    description: "Use your wallet balance",
    icon: Wallet,
    available: true,
    processingTime: "Instant",
    fee: 0,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer",
    icon: Building2,
    available: false,
    processingTime: "1-3 business days",
    fee: 0,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  walletBalance = 0,
  amount,
  currency = "USD",
}: PaymentMethodSelectorProps) {
  const hasEnoughBalance = walletBalance >= amount;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Payment Method</Label>

      <RadioGroup
        value={selectedMethod}
        onValueChange={onSelect}
        className="space-y-2"
      >
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isWallet = method.id === "wallet";
          const isDisabled = !method.available || (isWallet && !hasEnoughBalance);

          return (
            <div
              key={method.id}
              className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !isDisabled && onSelect(method.id)}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                disabled={isDisabled}
                className="mt-1"
              />

              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={method.id}
                  className={`flex items-center gap-2 font-medium ${
                    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {method.name}
                  {selectedMethod === method.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </Label>

                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {method.processingTime && (
                    <Badge variant="secondary" className="text-xs">
                      {method.processingTime}
                    </Badge>
                  )}

                  {isWallet && (
                    <Badge
                      variant={hasEnoughBalance ? "outline" : "destructive"}
                      className="text-xs"
                    >
                      Balance: {formatCurrency(walletBalance, currency)}
                    </Badge>
                  )}

                  {!method.available && (
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>

                {isWallet && !hasEnoughBalance && (
                  <p className="text-xs text-destructive mt-1">
                    Insufficient balance. Need {formatCurrency(amount - walletBalance, currency)} more.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>

      <div className="text-sm text-muted-foreground">
        Total: <strong>{formatCurrency(amount, currency)}</strong>
      </div>
    </div>
  );
}
