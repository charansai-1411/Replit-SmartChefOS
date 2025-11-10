import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/OrderCard";
import { KOTPanel } from "@/components/KOTPanel";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function OnlineOrders() {
  const { toast } = useToast();

  const { data: activeOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/active'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const sendToKitchenMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest('PATCH', `/api/orders/${orderId}/kitchen-status`, {
        kitchenStatus: 'sent',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kot'] });
      toast({ description: "Order sent to kitchen" });
    },
  });

  const handleSendToKitchen = (orderId: string) => {
    sendToKitchenMutation.mutate(orderId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const pendingOrders = activeOrders.filter(
    (order) => !order.kitchenStatus || order.kitchenStatus === 'pending'
  );
  const sentOrders = activeOrders.filter(
    (order) => order.kitchenStatus === 'sent' || order.kitchenStatus === 'preparing'
  );

  return (
    <div className="flex gap-6 h-full overflow-hidden p-6">
      <div className="flex-1 overflow-y-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Online Orders</h1>
          <p className="text-muted-foreground">
            Manage active orders and send them to kitchen
          </p>
        </div>

        {activeOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No active orders at the moment</p>
          </Card>
        ) : (
          <>
            {pendingOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pending Orders</h2>
                  <Badge variant="secondary">{pendingOrders.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg">
                              Order #{order.id.slice(0, 6)}
                            </p>
                            <p className="text-base text-muted-foreground mt-1">
                              {order.tableNumber || order.type}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-sm px-3 py-1">{order.status}</Badge>
                        </div>
                        <div className="text-base">
                          <p className="text-muted-foreground">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          <p className="font-semibold text-lg mt-2">₹{parseFloat(order.total).toFixed(2)}</p>
                        </div>
                        <Button
                          className="w-full h-11 text-base transition-all duration-200 hover:scale-105"
                          onClick={() => handleSendToKitchen(order.id)}
                          disabled={sendToKitchenMutation.isPending}
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Send to Kitchen
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {sentOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Sent to Kitchen</h2>
                  <Badge variant="secondary">{sentOrders.length}</Badge>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {sentOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      orderNumber={`Order #${order.id.slice(0, 6)}`}
                      table={order.tableNumber || 'Takeaway'}
                      itemCount={order.guests || 1}
                      status={
                        order.kitchenStatus === 'preparing'
                          ? 'Preparing'
                          : order.kitchenStatus === 'ready'
                          ? 'Ready'
                          : 'In Kitchen'
                      }
                      time={formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                      total={parseFloat(order.total)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="w-80 flex-shrink-0">
        <KOTPanel />
      </div>
    </div>
  );
}

