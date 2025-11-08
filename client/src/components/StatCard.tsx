import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  iconBg?: string;
}

export function StatCard({ title, value, trend, icon: Icon, iconBg = "bg-primary/10" }: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold tabular-nums" data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
