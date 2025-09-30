"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FrozenSemenProfileTabs } from "@/components/breeder/frozen-semen/FrozenSemenProfileTabs";
import { getFrozenSemenById } from "@/lib/mock-data/frozen-semen";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FrozenSemenDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function FrozenSemenDetailPage({ params }: FrozenSemenDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const batch = getFrozenSemenById(id);

  if (!batch) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card className="shadow-card bg-surface border-0 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">❄️</div>
            <h2 className="text-xl font-bold text-foreground">Batch Not Found</h2>
            <p className="text-muted-foreground">The frozen semen batch you&apos;re looking for doesn&apos;t exist.</p>
            <Button
              onClick={() => router.push('/frozen-semen')}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/frozen-semen')}
            className="hover:bg-primary/10 hover:border-primary shadow-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive shadow-card"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Profile Tabs */}
        <FrozenSemenProfileTabs batch={batch} />
      </div>
    </div>
  );
}