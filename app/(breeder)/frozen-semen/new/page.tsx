"use client";

import { FrozenSemenForm, FrozenSemenFormData } from "@/components/breeder/frozen-semen/FrozenSemenForm";
import { Snowflake } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddFrozenSemenPage() {
  const router = useRouter();

  const handleSave = (data: FrozenSemenFormData) => {
    // Here you would normally save to backend
    console.log('Saving frozen semen batch:', data);
    // Navigate to inventory
    router.push('/frozen-semen');
  };

  const handleCancel = () => {
    router.push('/frozen-semen');
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add Frozen Semen Batch</h1>
            <p className="text-muted-foreground">Add a new batch to your frozen semen inventory</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Form */}
        <FrozenSemenForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}