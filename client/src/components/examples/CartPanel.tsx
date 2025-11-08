import { CartPanel } from '../CartPanel';
import { useState } from 'react';

export default function CartPanelExample() {
  const [items, setItems] = useState([
    { id: '1', name: 'Paneer Butter Masala', price: 320, quantity: 2 },
    { id: '2', name: 'Shrimp Rice Bowl', price: 380, quantity: 1, notes: 'Extra spicy' },
    { id: '3', name: 'Apple Stuffed Pancake', price: 250, quantity: 1 },
  ]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setItems(items.filter(item => item.id !== id));
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 bg-background flex justify-center">
      <CartPanel
        items={items}
        tableNumber="04"
        guests={2}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={() => console.log('Place order clicked', items)}
      />
    </div>
  );
}
