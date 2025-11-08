import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderCardProps {
  orderNumber: string;
  table: string;
  itemCount: number;
  status: string;
  time: string;
}

const statusColors: Record<string, string> = {
  'In Kitchen': 'bg-primary text-primary-foreground',
  'Ready': 'bg-chart-3 text-foreground',
  'Wait List': 'bg-destructive text-destructive-foreground',
};

export function OrderCard({ orderNumber, table, itemCount, status, time }: OrderCardProps) {
  return (
    <Card className="p-4 min-w-[200px] hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-order-${orderNumber}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-sm" data-testid={`text-order-${orderNumber}`}>{orderNumber}</p>
          <p className="text-xs text-muted-foreground">{table}</p>
        </div>
        <Badge className={`rounded-md ${statusColors[status] || ''}`}>
          {status}
        </Badge>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Item: {itemCount}X</span>
        <span>{time}</span>
      </div>
    </Card>
  );
}
