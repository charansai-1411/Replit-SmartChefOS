import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Variant {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface ItemCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  veg: boolean;
  available?: boolean;
  quantity?: number;
  variants?: Variant[];
  onQuantityChange?: (id: string, quantity: number, variantId?: string, variantName?: string, variantPrice?: number) => void;
}

export function ItemCard({ id, name, price, image, veg, available = true, quantity: externalQuantity, variants, onQuantityChange }: ItemCardProps) {
  const [internalQuantity, setInternalQuantity] = useState(0);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  
  // Use external quantity if provided, otherwise use internal state
  const quantity = externalQuantity !== undefined ? externalQuantity : internalQuantity;
  const hasVariants = variants && variants.length > 0;

  const handleQuantityChange = (newQuantity: number, variantId?: string, variantName?: string, variantPrice?: number) => {
    if (newQuantity >= 0) {
      setInternalQuantity(newQuantity);
      onQuantityChange?.(id, newQuantity, variantId, variantName, variantPrice);
    }
  };

  const handleAddClick = () => {
    if (hasVariants) {
      setShowVariantDialog(true);
    } else {
      handleQuantityChange(1);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    handleQuantityChange(1, variant.id, variant.name, variant.price);
    setShowVariantDialog(false);
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
              onClick={handleAddClick}
              data-testid={`button-add-${id}`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {hasVariants ? 'Select Variant' : 'Add to Cart'}
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

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Select {name} Variant</DialogTitle>
            <DialogDescription>
              Choose your preferred size or variant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {variants?.map((variant) => (
              <Button
                key={variant.id}
                variant="outline"
                className="w-full justify-between h-auto py-4 rounded-xl"
                onClick={() => handleVariantSelect(variant)}
                disabled={!variant.isAvailable}
              >
                <span className="font-semibold">{variant.name}</span>
                <span className="text-lg font-bold">₹{variant.price.toFixed(2)}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
