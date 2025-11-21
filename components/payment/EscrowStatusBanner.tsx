"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/services/payment";

interface EscrowStatusBannerProps {
  status: string;
  amount: number;
  currency?: string;
  platformFee?: number;
  sellerAmount?: number;
  releaseDate?: Date | string | null;
  buyerConfirmed?: boolean;
  sellerConfirmed?: boolean;
  onConfirmReceipt?: () => void;
  isBuyer?: boolean;
}

export function EscrowStatusBanner({
  status,
  amount,
  currency = "USD",
  platformFee,
  sellerAmount,
  releaseDate,
  buyerConfirmed,
  sellerConfirmed,
  onConfirmReceipt,
  isBuyer,
}: EscrowStatusBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          title: "Payment Pending",
          description: "Waiting for payment to be processed",
          variant: "default" as const,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        };
      case "held":
        return {
          icon: Shield,
          title: "Funds Secured in Escrow",
          description: isBuyer
            ? "Your payment is held securely. It will be released to the seller once you confirm receipt."
            : "Buyer's payment is held in escrow. Funds will be released when buyer confirms receipt.",
          variant: "default" as const,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
        };
      case "released":
        return {
          icon: CheckCircle2,
          title: "Payment Released",
          description: "Funds have been released to the seller's wallet",
          variant: "default" as const,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/20",
        };
      case "refunded":
        return {
          icon: Wallet,
          title: "Payment Refunded",
          description: "Funds have been returned to the buyer",
          variant: "default" as const,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
        };
      case "disputed":
        return {
          icon: AlertCircle,
          title: "Under Dispute",
          description: "This transaction is being reviewed by our team",
          variant: "destructive" as const,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        };
      default:
        return {
          icon: Shield,
          title: "Escrow Status",
          description: `Status: ${status}`,
          variant: "default" as const,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Calculate days until auto-release
  const daysUntilRelease = releaseDate
    ? Math.ceil(
        (new Date(releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Alert className={`${config.bgColor} border-none`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
      <AlertTitle className={`font-semibold ${config.color}`}>
        {config.title}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm text-muted-foreground">{config.description}</p>

        {/* Amount details */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="font-mono">
            {formatCurrency(amount, currency)}
          </Badge>
          {platformFee && platformFee > 0 && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="secondary" className="font-mono text-xs">
                Fee: {formatCurrency(platformFee, currency)}
              </Badge>
              {sellerAmount && (
                <Badge variant="default" className="font-mono">
                  Seller receives: {formatCurrency(sellerAmount, currency)}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          {buyerConfirmed && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Buyer Confirmed
            </Badge>
          )}
          {sellerConfirmed && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Seller Confirmed Handover
            </Badge>
          )}
        </div>

        {/* Auto-release countdown */}
        {status === "held" && daysUntilRelease !== null && daysUntilRelease > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Auto-release in {daysUntilRelease} day{daysUntilRelease !== 1 ? "s" : ""}
              {!buyerConfirmed && " if not confirmed"}
            </span>
          </div>
        )}

        {/* Confirm receipt button for buyer */}
        {isBuyer && status === "held" && !buyerConfirmed && onConfirmReceipt && (
          <Button
            onClick={onConfirmReceipt}
            className="mt-2"
            size="sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm Receipt & Release Payment
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
