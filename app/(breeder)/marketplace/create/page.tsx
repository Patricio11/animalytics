"use client";

import { CreateListingWizard } from "@/components/breeder/marketplace/CreateListingWizard";
import { Plus } from "lucide-react";

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Listing</h1>
            <p className="text-muted-foreground">List your animal or services in the marketplace</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Wizard */}
        <CreateListingWizard />
      </div>
    </div>
  );
}