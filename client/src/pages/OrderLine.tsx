import { useState, useEffect } from "react";
import { StatusChips } from "@/components/StatusChips";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ItemCard } from "@/components/ItemCard";
import { OrderCard } from "@/components/OrderCard";
import { CartPanel } from "@/components/CartPanel";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import paneerImage from '@assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png';
import biryaniImage from '@assets/generated_images/Chicken_Biryani_dish_b8f84884.png';
import dosaImage from '@assets/generated_images/Masala_Dosa_breakfast_ea9368d7.png';
import dalImage from '@assets/generated_images/Dal_Makhani_dish_a3d3465f.png';
import tikkaImage from '@assets/generated_images/Chicken_Tikka_appetizer_4e11fe1a.png';
import kormaImage from '@assets/generated_images/Vegetable_Korma_curry_15f74555.png';
import gulabImage from '@assets/generated_images/Gulab_Jamun_dessert_982a82a2.png';
import butterChickenImage from '@assets/generated_images/Butter_Chicken_dish_96465dab.png';

// Mock data
const mockDishes = [
  { id: '1', name: 'Paneer Butter Masala', price: 320, category: 'Paneer', image: paneerImage, veg: true, available: true },
  { id: '2', name: 'Chicken Biryani', price: 450, category: 'Biryani', image: biryaniImage, veg: false, available: true },
  { id: '3', name: 'Masala Dosa', price: 180, category: 'South Indian', image: dosaImage, veg: true, available: true },
  { id: '4', name: 'Dal Makhani', price: 280, category: 'Dal', image: dalImage, veg: true, available: true },
  { id: '5', name: 'Chicken Tikka', price: 380, category: 'Starters', image: tikkaImage, veg: false, available: true },
  { id: '6', name: 'Vegetable Korma', price: 300, category: 'Curry', image: kormaImage, veg: true, available: true },
  { id: '7', name: 'Gulab Jamun', price: 120, category: 'Desserts', image: gulabImage, veg: true, available: true },
  { id: '8', name: 'Butter Chicken', price: 420, category: 'Chicken', image: butterChickenImage, veg: false, available: true },
];

const mockOrders = [
  { orderNumber: 'Order #F0027', table: 'Table 03', itemCount: 8, status: 'In Kitchen', time: '2 mins ago' },
  { orderNumber: 'Order #F0028', table: 'Table 07', itemCount: 3, status: 'Ready', time: 'Just Now' },
  { orderNumber: 'Order #F0019', table: 'Table 09', itemCount: 2, status: 'Wait List', time: '25 mins ago' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderLine() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const statusCounts = {
    all: 12,
    'dine-in': 5,
    waitlist: 2,
    takeaway: 3,
    served: 2,
  };

  const categories = ['All', 'Specials', 'Starters', 'Paneer', 'Chicken', 'Biryani', 'Curry', 'Dal', 'South Indian', 'Desserts'];

  const handleQuantityChange = (dishId: string, quantity: number) => {
    const dish = mockDishes.find(d => d.id === dishId);
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
        setCart([...cart, { id: dishId, name: dish.name, price: dish.price, quantity }]);
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

  const handlePlaceOrder = () => {
    toast({ 
      title: "Order Placed!", 
      description: `Order #F0030 sent to kitchen` 
    });
    setCart([]);
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

  return (
    <div className="flex gap-6 p-6 h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Order Line</h1>
          <StatusChips 
            activeStatus={activeStatus} 
            onStatusChange={setActiveStatus}
            counts={statusCounts}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Orders</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mockOrders.map((order, idx) => (
              <OrderCard key={idx} {...order} />
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
          {mockDishes.map((dish) => (
            <ItemCard
              key={dish.id}
              {...dish}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        <CartPanel
          items={cart}
          tableNumber="04"
          guests={2}
          onUpdateQuantity={handleCartUpdate}
          onRemoveItem={handleRemoveFromCart}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
}
