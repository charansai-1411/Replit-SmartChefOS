import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { StatusChips } from "@/components/StatusChips";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ItemCard } from "@/components/ItemCard";
import { OrderCard } from "@/components/OrderCard";
import { CartPanel } from "@/components/CartPanel";
import { Grid, List, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Dish, Order, Table } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderLine() {
  const [location, setLocation] = useLocation();
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guests, setGuests] = useState(2);
  const { toast } = useToast();

  // Get table from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get('table');
  const tableNumberParam = urlParams.get('tableNumber');
  const orderType = urlParams.get('type') || 'dine-in'; // dine-in, takeaway, or orders

  const { data: table } = useQuery<Table>({
    queryKey: [`/api/tables/${tableId}`],
    enabled: !!tableId,
    queryFn: async () => {
      if (!tableId) return null;
      const response = await fetch(`/api/tables/${tableId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  const tableNumber = table?.number || tableNumberParam || '04';
  
  // If type is 'orders', show existing orders view, otherwise show order creation
  const isOrdersView = orderType === 'orders';

  const { data: dishes = [], isLoading: dishesLoading } = useQuery<Dish[]>({
    queryKey: ['/api/dishes'],
  });

  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter out active orders - they should only appear in Online Orders page
  const orders = allOrders.filter(
    (order) => order.status === 'completed' || order.status === 'cancelled'
  );

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { order: any; items: any[] }) => {
      return await apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
    },
  });

  const statusCounts = {
    all: orders.length,
    'dine-in': orders.filter(o => o.type === 'dine-in').length,
    waitlist: orders.filter(o => o.status === 'waitlist').length,
    takeaway: orders.filter(o => o.type === 'takeaway').length,
    served: orders.filter(o => o.status === 'served').length,
  };

  const categories = ['All', ...Array.from(new Set(dishes.map(d => d.category)))];

  const filteredDishes = dishes.filter(dish => {
    if (activeCategory === 'All') return dish.available;
    return dish.category === activeCategory && dish.available;
  });

  const handleQuantityChange = (dishId: string, quantity: number) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== dishId));
      toast({ description: `${dish.name} removed from cart` });
    } else {
      const existingItem = cart.find(item => item.id === dishId);
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === dishId ? { ...item, quantity } : item
        ));
      } else {
        setCart([...cart, { 
          id: dishId, 
          name: dish.name, 
          price: parseFloat(dish.price), 
          quantity 
        }]);
        toast({ description: `${dish.name} added to cart` });
      }
    }
  };

  const handleCartUpdate = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({ 
        description: "Cart is empty",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      order: {
        tableNumber,
        guests,
        type: orderType === 'takeaway' ? 'takeaway' : 'dine-in',
        status: 'pending',
      },
      items: cart.map(item => ({
        dishId: item.id,
        quantity: item.quantity,
        notes: '',
      })),
    };

    try {
      await createOrderMutation.mutateAsync(orderData);
      toast({ 
        title: "Order Placed!", 
        description: `Order sent to kitchen` 
      });
      setCart([]);
    } catch (error) {
      toast({ 
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-testid="input-search"]')?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        toast({ description: "KOT sent to kitchen" });
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        toast({ description: "Bill printed" });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toast]);

  // Get current quantity for each dish from cart
  const getDishQuantity = (dishId: string) => {
    return cart.find(item => item.id === dishId)?.quantity || 0;
  };

  if (dishesLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // If orders view, show only orders list
  if (isOrdersView) {
    const filteredOrders = tableNumber 
      ? orders.filter(order => order.tableNumber === tableNumber)
      : orders;

    return (
      <div className="h-full overflow-hidden p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            {table ? (
              <p className="text-sm text-muted-foreground">
                Table {table.number} - {table.section}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                All Orders
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Orders</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {filteredOrders.slice(0, 10).map((order) => (
              <OrderCard 
                key={order.id}
                orderNumber={`Order #${order.id.slice(0, 6)}`}
                table={order.tableNumber || 'Takeaway'}
                itemCount={order.guests || 1}
                status={order.status === 'pending' ? 'In Kitchen' : order.status}
                time={formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                total={parseFloat(order.total)}
              />
            ))}
          </div>
          {filteredOrders.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {tableNumber ? "No orders found for this table" : "No orders found"}
              </p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-6">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="h-full overflow-y-auto pr-6 space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/")}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    {orderType === 'takeaway' ? 'Takeaway Order' : 'Dine-in Order'}
                  </h1>
                  {table && (
                    <p className="text-sm text-muted-foreground">
                      Table {table.number} - {table.section}
                    </p>
                  )}
                </div>
              </div>
              <StatusChips 
                activeStatus={activeStatus} 
                onStatusChange={setActiveStatus}
                counts={statusCounts}
              />
            </div>

            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Orders</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {orders.slice(0, 5).map((order) => (
                  <OrderCard 
                    key={order.id}
                    orderNumber={`Order #${order.id.slice(0, 6)}`}
                    table={order.tableNumber || 'Takeaway'}
                    itemCount={order.guests || 1}
                    status={order.status === 'pending' ? 'In Kitchen' : order.status}
                    time={formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    total={parseFloat(order.total)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Foodies Menu</h2>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="icon"
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid="button-filter">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CategoryFilter 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {filteredDishes.map((dish) => (
                <ItemCard
                  key={dish.id}
                  {...dish}
                  image={dish.image || ''}
                  price={parseFloat(dish.price)}
                  onQuantityChange={(id, qty) => handleQuantityChange(id, qty)}
                />
              ))}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full overflow-hidden">
            <CartPanel
              items={cart}
              tableNumber={tableNumber}
              guests={guests}
              onUpdateQuantity={handleCartUpdate}
              onRemoveItem={handleRemoveFromCart}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
