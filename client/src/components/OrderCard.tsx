import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderCardProps {
  orderNumber: string;
  table: string;
  itemCount: number;
  status: string;
  time: string;
  total?: number;
}

const statusColors: Record<string, string> = {
  'In Kitchen': 'bg-primary text-primary-foreground',
  'Ready': 'bg-chart-3 text-foreground',
  'Wait List': 'bg-destructive text-destructive-foreground',
};

export function OrderCard({ orderNumber, table, itemCount, status, time, total }: OrderCardProps) {
  return (
    <Card className="p-3 min-w-[180px] hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-order-${orderNumber}`}>
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <p className="font-semibold text-xs" data-testid={`text-order-${orderNumber}`}>{orderNumber}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{table}</p>
        </div>
        <Badge className={`rounded-md text-[10px] px-1.5 py-0.5 ${statusColors[status] || ''}`}>
          {status}
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
          <span>Items: {itemCount}</span>
          <span>{time}</span>
        </div>
        {total !== undefined && (
          <div className="text-xs font-semibold text-foreground pt-1 border-t">
            Total: ₹{total.toFixed(2)}
          </div>
        )}
      </div>
    </Card>
  );
}
