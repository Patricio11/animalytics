"use client";

import { Eye, Package, Star, MessageCircle, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="shadow-card hover-elevate transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-surface ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

interface ProfileStatsProps {
  profileViews?: number;
  totalSales?: number;
  averageRating?: string;
  responseRate?: number;
}

export function ProfileStats({
  profileViews = 0,
  totalSales = 0,
  averageRating = '0.0',
  responseRate = 0,
}: ProfileStatsProps) {
  const stats = [
    {
      label: 'Profile Views',
      value: profileViews.toLocaleString(),
      icon: Eye,
      color: 'text-primary',
    },
    {
      label: 'Total Sales',
      value: totalSales,
      icon: Package,
      color: 'text-chart-3',
    },
    {
      label: 'Avg. Rating',
      value: averageRating,
      icon: Star,
      color: 'text-chart-2',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: MessageCircle,
      color: 'text-chart-4',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
