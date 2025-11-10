import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Dish } from "@shared/schema";

interface DishManagementCardProps {
  dish: Dish;
  onToggleAvailability?: (id: string, available: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DishManagementCard({ 
  dish,
  onToggleAvailability,
  onEdit,
  onDelete 
}: DishManagementCardProps) {
  const [isAvailable, setIsAvailable] = useState(dish.available);
  
  const { id, name, price, category, image, veg } = dish;

  const handleToggle = (checked: boolean) => {
    setIsAvailable(checked);
    onToggleAvailability?.(id, checked);
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-manage-dish-${id}`}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img 
          src={image || '/placeholder-dish.png'} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="rounded-md">
            {veg ? '🌿 Veg' : '🍖 Non-Veg'}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Badge variant="outline" className="mb-1 rounded-md text-xs">
              {category}
            </Badge>
            <h3 className="font-semibold text-sm" data-testid={`text-manage-dish-name-${id}`}>{name}</h3>
            <p className="text-lg font-bold tabular-nums mt-1" data-testid={`text-manage-price-${id}`}>₹{parseFloat(price).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isAvailable} 
              onCheckedChange={handleToggle}
              data-testid={`switch-availability-${id}`}
            />
            <span className="text-xs text-muted-foreground">
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={() => onEdit?.(id)}
              data-testid={`button-edit-${id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete?.(id)}
              data-testid={`button-delete-${id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
