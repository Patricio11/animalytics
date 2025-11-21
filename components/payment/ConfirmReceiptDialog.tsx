"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Loader2,
  Star,
} from "lucide-react";
import { formatCurrency } from "@/lib/services/payment";

interface ConfirmReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: string;
  animalName?: string;
  sellerName?: string;
  amount: number;
  currency?: string;
  onConfirm: (notes?: string) => Promise<void>;
  onDispute?: () => void;
}

export function ConfirmReceiptDialog({
  open,
  onOpenChange,
  purchaseId,
  animalName,
  sellerName,
  amount,
  currency = "USD",
  onConfirm,
  onDispute,
}: ConfirmReceiptDialogProps) {
  const [notes, setNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(notes.trim() || undefined);
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      console.error("Error confirming receipt:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirm Receipt
          </DialogTitle>
          <DialogDescription>
            Confirm that you have received{" "}
            {animalName ? <strong>{animalName}</strong> : "your purchase"} in
            good condition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What happens explanation */}
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>What happens when you confirm:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>
                  {formatCurrency(amount, currency)} will be released to{" "}
                  {sellerName || "the seller"}
                </li>
                <li>The purchase will be marked as completed</li>
                <li>Ownership will be transferred to you</li>
                <li>You can leave a review for the seller</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Optional notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about the condition or the transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Only confirm if you have physically
              received the animal/item and verified it matches the listing
              description. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onDispute && (
            <Button
              type="button"
              variant="outline"
              onClick={onDispute}
              className="text-destructive hover:text-destructive"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Receipt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
