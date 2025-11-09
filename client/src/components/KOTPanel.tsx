import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KOTOrder {
  id: string;
  tableNumber: string | null;
  type: string;
  kitchenStatus: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    dishId: string;
    quantity: number;
    notes: string | null;
    dish: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
}

export function KOTPanel() {
  const { toast } = useToast();

  const { data: kotOrders = [], isLoading } = useQuery<KOTOrder[]>({
    queryKey: ['/api/kot'],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/orders/${orderId}/kitchen-status`, {
        kitchenStatus: status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kot'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
      toast({ description: "Order status updated" });
    },
  });

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'sent' ? 'preparing' : currentStatus === 'preparing' ? 'ready' : 'sent';
    updateStatusMutation.mutate({ orderId, status: nextStatus });
  };

  if (isLoading) {
    return (
      <Card className="h-full p-4">
        <div className="flex items-center justify-center h-full">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">KOT (Kitchen Order Ticket)</h2>
          <Badge variant="secondary">{kotOrders.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Active kitchen orders
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {kotOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active kitchen orders</p>
            </div>
          ) : (
            kotOrders.map((order) => (
              <Card key={order.id} className="p-5 space-y-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-lg">
                        #{order.id.slice(0, 6)}
                      </p>
                      <Badge
                        variant={
                          order.kitchenStatus === 'ready'
                            ? 'default'
                            : order.kitchenStatus === 'preparing'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-sm px-2 py-1"
                      >
                        {order.kitchenStatus === 'ready'
                          ? 'Ready'
                          : order.kitchenStatus === 'preparing'
                          ? 'Preparing'
                          : 'Sent'}
                      </Badge>
                    </div>
                    <p className="text-base text-muted-foreground">
                      {order.tableNumber || order.type}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">{item.dish.name}</span>
                          <Badge variant="outline" className="text-sm px-2">
                            x{item.quantity}
                          </Badge>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t">
                  <Button
                    size="default"
                    className="w-full h-10 text-base transition-all duration-200 hover:scale-105"
                    variant={
                      order.kitchenStatus === 'ready' ? 'default' : 'secondary'
                    }
                    onClick={() =>
                      handleStatusUpdate(order.id, order.kitchenStatus || 'sent')
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    {order.kitchenStatus === 'sent' ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Mark Preparing
                      </>
                    ) : order.kitchenStatus === 'preparing' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Mark Ready
                      </>
                    ) : (
                      'Completed'
                    )}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

