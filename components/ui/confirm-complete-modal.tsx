"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ConfirmCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  confirmLoadingText?: string;
}

export function ConfirmCompleteModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Complete Heat Cycle",
  description,
  itemName,
  isLoading = false,
  confirmText = "Complete Cycle",
  confirmLoadingText = "Completing...",
}: ConfirmCompleteModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const defaultDescription = itemName
    ? `Mark the heat cycle for "${itemName}" as completed? The cycle will be moved to the Completed tab and a reminder will be set for the next expected heat cycle.`
    : "Mark this heat cycle as completed? The cycle will be moved to the Completed tab and a reminder will be set for the next expected heat cycle.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed pt-2">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {confirmLoadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
