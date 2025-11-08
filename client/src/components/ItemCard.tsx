import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface ItemCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  veg: boolean;
  available?: boolean;
  onQuantityChange?: (id: string, quantity: number) => void;
}

export function ItemCard({ id, name, price, image, veg, available = true, onQuantityChange }: ItemCardProps) {
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
      onQuantityChange?.(id, newQuantity);
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid={`card-dish-${id}`}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="rounded-md">
            {veg ? '🌿 Veg' : '🍖 Non-Veg'}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1" data-testid={`text-dish-name-${id}`}>{name}</h3>
        <p className="text-lg font-bold tabular-nums" data-testid={`text-price-${id}`}>₹{price.toFixed(2)}</p>
        
        <div className="mt-3">
          {quantity === 0 ? (
            <Button 
              className="w-full rounded-xl" 
              size="default"
              disabled={!available}
              onClick={() => handleQuantityChange(1)}
              data-testid={`button-add-${id}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="outline"
                className="rounded-xl"
                onClick={() => handleQuantityChange(quantity - 1)}
                data-testid={`button-decrease-${id}`}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="flex-1 text-center font-semibold tabular-nums" data-testid={`text-quantity-${id}`}>
                {quantity}
              </span>
              <Button 
                size="icon"
                className="rounded-xl"
                onClick={() => handleQuantityChange(quantity + 1)}
                data-testid={`button-increase-${id}`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
