"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteMatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  matingInfo?: {
    bitchName: string;
    dogName: string;
    matingDate: string;
  };
  isDeleting?: boolean;
}

export function DeleteMatingDialog({
  open,
  onOpenChange,
  onConfirm,
  matingInfo,
  isDeleting = false,
}: DeleteMatingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Mating Record</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            <div className="space-y-3">
              {matingInfo ? (
                <>
                  <div>
                    Are you sure you want to delete the mating record between{" "}
                    <span className="font-semibold text-foreground">{matingInfo.bitchName}</span> and{" "}
                    <span className="font-semibold text-foreground">{matingInfo.dogName}</span>?
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mating Date: {matingInfo.matingDate}
                  </div>
                </>
              ) : (
                <div>Are you sure you want to delete this mating record?</div>
              )}
              <div className="text-destructive font-medium">
                This action cannot be undone. All associated data including ratings and notes will be permanently deleted.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Mating"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
