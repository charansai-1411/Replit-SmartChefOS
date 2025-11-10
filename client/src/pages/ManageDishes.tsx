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
import { Plus, Search, Trash2, Upload, X } from "lucide-react";
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
  const [editingDishId, setEditingDishId] = useState(null);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [newDishData, setNewDishData] = useState({
    name: '',
    price: '',
    category: '',
    veg: true,
    image: null as string | null,
    available: true,
  });

  const { toast } = useToast();

  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['/api/dishes'],
  });

  const { data: ingredients = [] } = useQuery({
    queryKey: ['/api/ingredients'],
  });

  const { data: dishIngredients = [] } = useQuery({
    queryKey: editingDishId ? [`/api/dishes/${editingDishId}/ingredients`] : [''],
    enabled: !!editingDishId,
  });

  const createDishMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/dishes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
      setIsAddDishOpen(false);
      setNewDishData({
        name: '',
        price: '',
        category: '',
        veg: true,
        image: null,
        available: true,
      });
      toast({
        description: "Dish added successfully"
      });
    },
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
        quantity: quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dishes/${editingDishId}/ingredients`] });
      setNewIngredientId('');
      setNewIngredientQuantity('');
      toast({
        description: "Ingredient added to dish"
      });
    },
  });

  const removeIngredientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/dish-ingredients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dishes/${editingDishId}/ingredients`] });
      toast({
        description: "Ingredient removed from dish"
      });
    },
  });

  const handleEdit = (id: string) => {
    setEditingDishId(id);
    setNewIngredientId('');
    setNewIngredientQuantity('');
  };

  const handleAddIngredient = () => {
    if (!editingDishId || !newIngredientId || !newIngredientQuantity) return;
    
    addIngredientMutation.mutate({
      dishId: editingDishId,
      ingredientId: newIngredientId,
      quantity: newIngredientQuantity,
    });
  };

  const handleCreateDish = () => {
    if (!newDishData.name || !newDishData.price || !newDishData.category) {
      toast({
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createDishMutation.mutate(newDishData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDishData({ ...newDishData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewDishData({ ...newDishData, image: null });
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
    const categoryMap = new Map();
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
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <Card className="w-64 p-4 h-fit">
        <h2 className="font-semibold mb-4">Category</h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-4 py-2 rounded-xl flex items-center justify-between hover-elevate active-elevate-2 ${
                selectedCategory === cat.name
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span>{cat.name}</span>
              <Badge variant="secondary">{cat.count}</Badge>
            </button>
          ))}
        </div>
        <button className="w-full mt-4 px-4 py-2 border border-dashed rounded-xl hover-elevate">
          Add New Category
        </button>
      </Card>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Dishes</h1>
          <Button onClick={() => setIsAddDishOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Dish
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
            data-testid="input-search-dishes"
          />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-semibold">{selectedCategory}</h2>
          <Badge variant="secondary">{filteredDishes.length}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <DishManagementCard
              key={dish.id}
              dish={dish}
              onToggleAvailability={handleToggleAvailability}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          <button
            onClick={() => setIsAddDishOpen(true)}
            className="border-2 border-dashed rounded-xl p-8 hover-elevate flex flex-col items-center justify-center gap-2 min-h-[200px]"
          >
            <Plus className="w-8 h-8 text-muted-foreground" />
            <span className="font-medium">Add New Dish</span>
            <span className="text-sm text-muted-foreground">to {selectedCategory}</span>
          </button>
        </div>
      </div>

      {/* Add Dish Dialog */}
      <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Create a new dish for your menu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={newDishData.name}
                onChange={(e) => setNewDishData({ ...newDishData, name: e.target.value })}
                placeholder="Dish name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Input
                type="number"
                step="0.01"
                value={newDishData.price}
                onChange={(e) => setNewDishData({ ...newDishData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input
                value={newDishData.category}
                onChange={(e) => setNewDishData({ ...newDishData, category: e.target.value })}
                placeholder="e.g., Curry, Biryani, Desserts"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dish Image</label>
              {newDishData.image ? (
                <div className="relative">
                  <img 
                    src={newDishData.image} 
                    alt="Dish preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="dish-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="dish-image" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="veg"
                checked={newDishData.veg}
                onChange={(e) => setNewDishData({ ...newDishData, veg: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="veg" className="text-sm">Vegetarian</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={newDishData.available}
                onChange={(e) => setNewDishData({ ...newDishData, available: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="available" className="text-sm">Available</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDishOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDish} disabled={createDishMutation.isPending}>
                {createDishMutation.isPending ? "Adding..." : "Add Dish"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Ingredients Dialog */}
      <Dialog open={!!editingDishId} onOpenChange={(open) => !open && setEditingDishId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ingredients - {dishes.find(d => d.id === editingDishId)?.name}</DialogTitle>
            <DialogDescription>
              Add or remove ingredients for this dish. When an order is placed, these ingredients will be deducted from inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Current Ingredients</h3>
              {dishIngredients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  No ingredients added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {dishIngredients.map((di) => (
                    <div key={di.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{di.ingredient.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {parseFloat(di.quantity).toFixed(2)} {di.ingredient.unit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIngredient(di.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Add New Ingredient</h3>
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
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setEditingDishId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}