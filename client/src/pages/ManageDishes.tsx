import { useState } from "react";
import { DishManagementCard } from "@/components/DishManagementCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import paneerImage from '@assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png';
import biryaniImage from '@assets/generated_images/Chicken_Biryani_dish_b8f84884.png';
import dosaImage from '@assets/generated_images/Masala_Dosa_breakfast_ea9368d7.png';
import dalImage from '@assets/generated_images/Dal_Makhani_dish_a3d3465f.png';
import tikkaImage from '@assets/generated_images/Chicken_Tikka_appetizer_4e11fe1a.png';
import kormaImage from '@assets/generated_images/Vegetable_Korma_curry_15f74555.png';
import gulabImage from '@assets/generated_images/Gulab_Jamun_dessert_982a82a2.png';
import butterChickenImage from '@assets/generated_images/Butter_Chicken_dish_96465dab.png';

const mockDishes = [
  { id: '1', name: 'Paneer Butter Masala', price: 320, category: 'Paneer', image: paneerImage, veg: true, available: true },
  { id: '2', name: 'Chicken Biryani', price: 450, category: 'Biryani', image: biryaniImage, veg: false, available: true },
  { id: '3', name: 'Masala Dosa', price: 180, category: 'South Indian', image: dosaImage, veg: true, available: true },
  { id: '4', name: 'Dal Makhani', price: 280, category: 'Dal', image: dalImage, veg: true, available: false },
  { id: '5', name: 'Chicken Tikka', price: 380, category: 'Starters', image: tikkaImage, veg: false, available: true },
  { id: '6', name: 'Vegetable Korma', price: 300, category: 'Curry', image: kormaImage, veg: true, available: true },
  { id: '7', name: 'Gulab Jamun', price: 120, category: 'Desserts', image: gulabImage, veg: true, available: true },
  { id: '8', name: 'Butter Chicken', price: 420, category: 'Chicken', image: butterChickenImage, veg: false, available: true },
];

const categories = [
  { name: 'All Dishes', count: 24 },
  { name: 'Starters', count: 8 },
  { name: 'Paneer', count: 5 },
  { name: 'Chicken', count: 6 },
  { name: 'Biryani', count: 4 },
  { name: 'Curry', count: 7 },
  { name: 'Dal', count: 3 },
  { name: 'South Indian', count: 5 },
  { name: 'Desserts', count: 6 },
];

export default function ManageDishes() {
  const [selectedCategory, setSelectedCategory] = useState('All Dishes');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleToggleAvailability = (id: string, available: boolean) => {
    const dish = mockDishes.find(d => d.id === id);
    toast({ 
      description: `${dish?.name} is now ${available ? 'available' : 'unavailable'}` 
    });
  };

  const handleEdit = (id: string) => {
    toast({ description: `Edit dish ${id}` });
  };

  const handleDelete = (id: string) => {
    const dish = mockDishes.find(d => d.id === id);
    toast({ 
      description: `${dish?.name} deleted`,
      variant: "destructive"
    });
  };

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
            {selectedCategory} <Badge variant="secondary" className="ml-2">{mockDishes.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDishes.map((dish) => (
              <DishManagementCard
                key={dish.id}
                {...dish}
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
    </div>
  );
}
