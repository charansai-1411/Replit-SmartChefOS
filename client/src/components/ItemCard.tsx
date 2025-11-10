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
        <div className="absolute top-3 left-3">
          <div className={`w-4 h-4 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="rounded-md text-sm px-3 py-1">
            {veg ? '🌿 Veg' : '🍖 Non-Veg'}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2" data-testid={`text-dish-name-${id}`}>{name}</h3>
        <p className="text-2xl font-bold tabular-nums mb-4" data-testid={`text-price-${id}`}>₹{price.toFixed(2)}</p>
        
        <div className="mt-4">
          {quantity === 0 ? (
            <Button 
              className="w-full rounded-xl h-12 text-base" 
              size="lg"
              disabled={!available}
              onClick={() => handleQuantityChange(1)}
              data-testid={`button-add-${id}`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="outline"
                className="rounded-xl h-12 w-12"
                onClick={() => handleQuantityChange(quantity - 1)}
                data-testid={`button-decrease-${id}`}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="flex-1 text-center font-bold text-xl tabular-nums" data-testid={`text-quantity-${id}`}>
                {quantity}
              </span>
              <Button 
                size="icon"
                className="rounded-xl h-12 w-12"
                onClick={() => handleQuantityChange(quantity + 1)}
                data-testid={`button-increase-${id}`}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
