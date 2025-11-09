import { useState, useMemo } from "react";
import { DishManagementCard } from "@/components/DishManagementCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Dish, Ingredient } from "@shared/schema";

interface DishIngredient {
  id: string;
  dishId: string;
  ingredientId: string;
  quantity: string;
  ingredient: Ingredient;
}

export default function ManageDishes() {
  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const { toast } = useToast();

  const { data: dishes = [], isLoading } = useQuery<Dish[]>({
    queryKey: ['/api/dishes'],
  });

  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });

  const { data: dishIngredients = [] } = useQuery<DishIngredient[]>({
    queryKey: editingDishId ? [`/api/dishes/${editingDishId}/ingredients`] : [''],
    enabled: !!editingDishId,
  });

  const updateDishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dish> }) => {
      return await apiRequest('PATCH', `/api/dishes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/dishes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
    },
  });

  const handleToggleAvailability = (id: string, available: boolean) => {
    const dish = dishes.find(d => d.id === id);
    updateDishMutation.mutate({ id, data: { available } });
    toast({ 
      description: `${dish?.name} is now ${available ? 'available' : 'unavailable'}` 
    });
  };

  const addIngredientMutation = useMutation({
    mutationFn: async ({ dishId, ingredientId, quantity }: { dishId: string; ingredientId: string; quantity: string }) => {
      return await apiRequest('POST', `/api/dishes/${dishId}/ingredients`, {
        ingredientId,
        quantity: parseFloat(quantity),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dishes/${editingDishId}/ingredients`] });
      setNewIngredientId('');
      setNewIngredientQuantity('');
      toast({ description: "Ingredient added to dish" });
    },
  });

  const removeIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/dish-ingredients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dishes/${editingDishId}/ingredients`] });
      toast({ description: "Ingredient removed from dish" });
    },
  });

  const handleEdit = (id: string) => {
    setEditingDishId(id);
    setNewIngredientId('');
    setNewIngredientQuantity('');
  };

  const handleAddIngredient = () => {
    if (!editingDishId || !newIngredientId || !newIngredientQuantity) {
      toast({ description: "Please select an ingredient and enter quantity", variant: "destructive" });
      return;
    }
    addIngredientMutation.mutate({
      dishId: editingDishId,
      ingredientId: newIngredientId,
      quantity: newIngredientQuantity,
    });
  };

  const handleRemoveIngredient = (id: string) => {
    if (confirm("Remove this ingredient from the dish?")) {
      removeIngredientMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    const dish = dishes.find(d => d.id === id);
    if (confirm(`Delete ${dish?.name}?`)) {
      deleteDishMutation.mutate(id);
      toast({ 
        description: `${dish?.name} deleted`,
        variant: "destructive"
      });
    }
  };

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    categoryMap.set('All Dishes', dishes.length);
    
    dishes.forEach(dish => {
      categoryMap.set(dish.category, (categoryMap.get(dish.category) || 0) + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, [dishes]);

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesCategory = selectedCategory === 'All Dishes' || dish.category === selectedCategory;
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex gap-6 p-6 h-full overflow-hidden">
      <div className="w-64 space-y-2">
        <h2 className="font-semibold mb-4">Dishes Category</h2>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`w-full text-left px-4 py-2 rounded-xl flex items-center justify-between hover-elevate active-elevate-2 ${
              selectedCategory === cat.name ? 'bg-primary text-primary-foreground' : ''
            }`}
            data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span>{cat.name}</span>
            <Badge variant={selectedCategory === cat.name ? "secondary" : "outline"} className="rounded-md">
              {cat.count}
            </Badge>
          </button>
        ))}
        <Button className="w-full rounded-xl mt-4" variant="outline" data-testid="button-add-category">
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Dishes</h1>
          <Button className="rounded-xl" data-testid="button-add-dish">
            <Plus className="w-4 h-4 mr-2" />
            Add New Dish
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
            data-testid="input-search-dishes"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            {selectedCategory} <Badge variant="secondary" className="ml-2">{filteredDishes.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <DishManagementCard
                key={dish.id}
                {...dish}
                image={dish.image || ''}
                price={parseFloat(dish.price)}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 hover-elevate active-elevate-2 cursor-pointer" data-testid="card-add-new-dish">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium">Add New Dish</p>
              <p className="text-sm text-muted-foreground">to {selectedCategory}</p>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!editingDishId} onOpenChange={(open) => !open && setEditingDishId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Ingredients - {dishes.find(d => d.id === editingDishId)?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove ingredients for this dish. When an order is placed, these ingredients will be deducted from inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Current Ingredients</h3>
              {dishIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ingredients added yet</p>
              ) : (
                <div className="space-y-2">
                  {dishIngredients.map((di) => (
                    <Card key={di.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{di.ingredient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {parseFloat(di.quantity).toFixed(2)} {di.ingredient.unit}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIngredient(di.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-semibold">Add New Ingredient</h3>
              <div className="flex gap-2">
                <Select value={newIngredientId} onValueChange={setNewIngredientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients
                      .filter(ing => !dishIngredients.find(di => di.ingredientId === ing.id))
                      .map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Quantity"
                  value={newIngredientQuantity}
                  onChange={(e) => setNewIngredientQuantity(e.target.value)}
                  className="w-32"
                />
                <Button
                  onClick={handleAddIngredient}
                  disabled={!newIngredientId || !newIngredientQuantity || addIngredientMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDishId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
