import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Dish } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Tag,
  Percent,
  Package,
  Truck,
  Info,
  ChefHat,
  Leaf,
  Drumstick,
  Wine,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  Save,
  Search,
  Filter,
  MoreVertical,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

type MenuPlatform = "restaurant" | "zomato" | "swiggy" | "other";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  variants?: ItemVariant[];
  addons?: ItemAddon[];
  tags: string[];
  beverageTag?: string;
  meatType?: string;
  gst: number;
  nutritionalInfo?: NutritionalInfo;
  servingInfo?: string;
  preparationTime?: number;
  platforms: MenuPlatform[];
  // Platform-specific availability
  availableOnRestaurant?: boolean;
  availableOnZomato?: boolean;
  availableOnSwiggy?: boolean;
  availableOnOther?: boolean;
}

interface ItemVariant {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface ItemAddon {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  dietaryTags: string[];
}

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  subCategories: SubCategory[];
  timing?: CategoryTiming;
  daySchedule?: string[];
  platforms: MenuPlatform[];
}

interface SubCategory {
  id: string;
  name: string;
  isAvailable: boolean;
  timing?: CategoryTiming;
}

interface CategoryTiming {
  startTime: string;
  endTime: string;
}

export default function MenuManagement() {
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState<MenuPlatform>("restaurant");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Sample data
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Starters",
      description: "Appetizers and starters",
      isAvailable: true,
      subCategories: [
        { id: "1-1", name: "Veg Starters", isAvailable: true },
        { id: "1-2", name: "Non-Veg Starters", isAvailable: true },
      ],
      timing: { startTime: "11:00", endTime: "23:00" },
      daySchedule: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      platforms: ["restaurant", "zomato", "swiggy"],
    },
    {
      id: "2",
      name: "Main Course",
      description: "Main dishes",
      isAvailable: true,
      subCategories: [
        { id: "2-1", name: "Veg Main Course", isAvailable: true },
        { id: "2-2", name: "Non-Veg Main Course", isAvailable: true },
      ],
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    },
    {
      id: "3",
      name: "Breads",
      description: "Indian breads and rotis",
      isAvailable: true,
      subCategories: [
        { id: "3-1", name: "Tandoori Breads", isAvailable: true },
        { id: "3-2", name: "Stuffed Breads", isAvailable: true },
      ],
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    },
    {
      id: "4",
      name: "Rice & Biryani",
      description: "Rice dishes and biryanis",
      isAvailable: true,
      subCategories: [
        { id: "4-1", name: "Veg Rice", isAvailable: true },
        { id: "4-2", name: "Non-Veg Biryani", isAvailable: true },
      ],
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    },
    {
      id: "5",
      name: "Desserts",
      description: "Sweet dishes and desserts",
      isAvailable: true,
      subCategories: [
        { id: "5-1", name: "Indian Sweets", isAvailable: true },
        { id: "5-2", name: "Ice Creams", isAvailable: true },
      ],
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    },
    {
      id: "6",
      name: "Beverages",
      description: "Drinks and beverages",
      isAvailable: true,
      subCategories: [
        { id: "6-1", name: "Hot Beverages", isAvailable: true },
        { id: "6-2", name: "Cold Beverages", isAvailable: true },
        { id: "6-3", name: "Fresh Juices", isAvailable: true },
      ],
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Paneer Tikka",
      description: "Grilled cottage cheese marinated in spices",
      category: "Starters",
      subCategory: "Veg Starters",
      price: 250,
      isVeg: true,
      isAvailable: true,
      tags: ["Spicy", "Popular"],
      gst: 5,
      preparationTime: 15,
      platforms: ["restaurant", "zomato", "swiggy"],
      availableOnRestaurant: true,
      availableOnZomato: true,
      availableOnSwiggy: true,
      availableOnOther: false,
      variants: [
        { id: "v1", name: "Half", price: 250, isAvailable: true },
        { id: "v2", name: "Full", price: 450, isAvailable: true },
      ],
      addons: [
        { id: "a1", name: "Extra Cheese", price: 50, isVeg: true, dietaryTags: ["Dairy"] },
        { id: "a2", name: "Mint Chutney", price: 20, isVeg: true, dietaryTags: ["Vegan"] },
      ],
      nutritionalInfo: {
        calories: 320,
        protein: 18,
        carbs: 12,
        fat: 22,
      },
      servingInfo: "Serves 2-3 people",
    },
    {
      id: "2",
      name: "Chicken Tikka",
      description: "Tender chicken pieces marinated in yogurt and spices",
      category: "Starters",
      subCategory: "Non-Veg Starters",
      price: 320,
      isVeg: false,
      isAvailable: true,
      tags: ["Spicy", "Popular", "Grilled"],
      gst: 5,
      preparationTime: 20,
      platforms: ["restaurant", "zomato", "swiggy"],
      availableOnRestaurant: true,
      availableOnZomato: true,
      availableOnSwiggy: true,
      availableOnOther: false,
    },
    {
      id: "3",
      name: "Butter Chicken",
      description: "Creamy tomato-based curry with tender chicken",
      category: "Main Course",
      subCategory: "Non-Veg Main Course",
      price: 380,
      isVeg: false,
      isAvailable: true,
      tags: ["Popular", "Creamy"],
      gst: 5,
      preparationTime: 25,
      platforms: ["restaurant", "zomato"],
      availableOnRestaurant: true,
      availableOnZomato: true,
      availableOnSwiggy: false,
      availableOnOther: false,
      variants: [
        { id: "v3", name: "Half", price: 380, isAvailable: true },
        { id: "v4", name: "Full", price: 650, isAvailable: true },
      ],
    },
    {
      id: "4",
      name: "Dal Makhani",
      description: "Creamy black lentils slow-cooked overnight",
      category: "Main Course",
      subCategory: "Veg Main Course",
      price: 280,
      isVeg: true,
      isAvailable: true,
      tags: ["Popular", "Comfort Food"],
      gst: 5,
      preparationTime: 30,
      platforms: ["restaurant", "zomato", "swiggy", "other"],
      availableOnRestaurant: true,
      availableOnZomato: true,
      availableOnSwiggy: true,
      availableOnOther: true,
    },
  ]);

  const [charges, setCharges] = useState({
    packagingCharge: 20,
    deliveryCharge: 40,
    cgst: 2.5,
    sgst: 2.5,
  });

  // Dialog states
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showChargesDialog, setShowChargesDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: 0,
    isVeg: true,
    isAvailable: true,
    tags: [],
    gst: 5,
    platforms: [activePlatform],
    image: "",
    availableOnRestaurant: true,
    availableOnZomato: true,
    availableOnSwiggy: true,
    availableOnOther: true,
  });

  // Image preview states
  const [newItemImagePreview, setNewItemImagePreview] = useState<string>("");
  const [editItemImagePreview, setEditItemImagePreview] = useState<string>("");

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    subCategories: [""],
  });

  // Initialize image preview when editing item
  useEffect(() => {
    if (editingItem?.image) {
      setEditItemImagePreview(editingItem.image);
    } else {
      setEditItemImagePreview("");
    }
  }, [editingItem]);

  const handleAddItem = () => {
    // Validation
    if (!newItem.name || newItem.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Item name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!newItem.price || newItem.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name || "",
      description: newItem.description || "",
      category: newItem.category || "",
      subCategory: newItem.subCategory || "",
      price: newItem.price || 0,
      isVeg: newItem.isVeg || true,
      isAvailable: true,
      tags: newItem.tags || [],
      gst: newItem.gst || 5,
      platforms: newItem.platforms || ["restaurant"],
      image: newItem.image,
      availableOnRestaurant: newItem.availableOnRestaurant ?? true,
      availableOnZomato: newItem.availableOnZomato ?? true,
      availableOnSwiggy: newItem.availableOnSwiggy ?? true,
      availableOnOther: newItem.availableOnOther ?? true,
    };

    setMenuItems([...menuItems, item]);
    setShowAddItem(false);
    setNewItem({
      name: "",
      description: "",
      category: "",
      subCategory: "",
      price: 0,
      isVeg: true,
      isAvailable: true,
      tags: [],
      gst: 5,
      platforms: ["restaurant"],
      image: "",
      availableOnRestaurant: true,
      availableOnZomato: true,
      availableOnSwiggy: true,
      availableOnOther: true,
    });
    setNewItemImagePreview("");

    toast({
      title: "Item Added",
      description: `${item.name} has been added to the menu.`,
    });
  };

  const handleEditItem = () => {
    if (!editingItem) return;

    // Validation
    if (!editingItem.name || editingItem.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Item name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editingItem.price || editingItem.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Update the item in the list
    setMenuItems(menuItems.map(item =>
      item.id === editingItem.id ? editingItem : item
    ));

    setEditingItem(null);
    setEditItemImagePreview("");
    toast({
      title: "Item Updated",
      description: `${editingItem.name} has been updated successfully.`,
    });
  };

  // Image handling functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingItem) {
          setEditingItem({ ...editingItem, image: base64String });
          setEditItemImagePreview(base64String);
        } else {
          setNewItem({ ...newItem, image: base64String });
          setNewItemImagePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isEdit: boolean = false) => {
    if (isEdit && editingItem) {
      setEditingItem({ ...editingItem, image: "" });
      setEditItemImagePreview("");
    } else {
      setNewItem({ ...newItem, image: "" });
      setNewItemImagePreview("");
    }
  };

  const handleAddCategory = () => {
    // Validation
    if (!newCategory.name || newCategory.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      toast({
        title: "Category Exists",
        description: "A category with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    // Create subcategories
    const subCategories = newCategory.subCategories
      .filter(sub => sub.trim() !== "")
      .map((sub, index) => ({
        id: `${Date.now()}-${index}`,
        name: sub.trim(),
        isAvailable: true,
      }));

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      isAvailable: true,
      subCategories: subCategories,
      platforms: ["restaurant", "zomato", "swiggy", "other"],
    };

    setCategories([...categories, category]);
    setShowAddCategory(false);
    setNewCategory({
      name: "",
      description: "",
      subCategories: [""],
    });

    toast({
      title: "Category Added",
      description: `${category.name} has been added successfully.`,
    });
  };

  const addSubCategoryField = () => {
    setNewCategory({
      ...newCategory,
      subCategories: [...newCategory.subCategories, ""],
    });
  };

  const updateSubCategory = (index: number, value: string) => {
    const updated = [...newCategory.subCategories];
    updated[index] = value;
    setNewCategory({
      ...newCategory,
      subCategories: updated,
    });
  };

  const removeSubCategory = (index: number) => {
    if (newCategory.subCategories.length > 1) {
      setNewCategory({
        ...newCategory,
        subCategories: newCategory.subCategories.filter((_, i) => i !== index),
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Item Deleted",
      description: "Menu item has been removed.",
    });
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  // Platform-specific availability toggle
  const handleTogglePlatformAvailability = (id: string, platform: MenuPlatform) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === id) {
        const updates: Partial<MenuItem> = {};
        
        switch (platform) {
          case "restaurant":
            updates.availableOnRestaurant = !item.availableOnRestaurant;
            break;
          case "zomato":
            updates.availableOnZomato = !item.availableOnZomato;
            break;
          case "swiggy":
            updates.availableOnSwiggy = !item.availableOnSwiggy;
            break;
          case "other":
            updates.availableOnOther = !item.availableOnOther;
            break;
        }
        
        return { ...item, ...updates };
      }
      return item;
    }));
    
    toast({
      title: "Availability Updated",
      description: `Item availability toggled for ${platform}.`,
    });
  };

  const handleCopyToPlatform = (itemId: string, platform: MenuPlatform) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === itemId && !item.platforms.includes(platform)) {
        return { ...item, platforms: [...item.platforms, platform] };
      }
      return item;
    }));

    toast({
      title: "Item Copied",
      description: `Item has been added to ${platform} menu.`,
    });
  };

  // Helper functions for editing
  const addVariant = () => {
    if (!editingItem) return;
    const newVariant: ItemVariant = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      isAvailable: true,
    };
    setEditingItem({
      ...editingItem,
      variants: [...(editingItem.variants || []), newVariant],
    });
  };

  const updateVariant = (variantId: string, field: keyof ItemVariant, value: any) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      variants: editingItem.variants?.map(v =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    });
  };

  const removeVariant = (variantId: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      variants: editingItem.variants?.filter(v => v.id !== variantId),
    });
  };

  const addTag = (tag: string) => {
    if (!editingItem || !tag.trim()) return;
    if (editingItem.tags.includes(tag.trim())) return;
    setEditingItem({
      ...editingItem,
      tags: [...editingItem.tags, tag.trim()],
    });
  };

  const removeTag = (tag: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      tags: editingItem.tags.filter(t => t !== tag),
    });
  };

  // Platform toggle handler with dependency rules for Add Item
  const togglePlatformForNewItem = (platform: MenuPlatform) => {
    const currentPlatforms = newItem.platforms || [];
    
    if (platform === "restaurant") {
      // If toggling restaurant OFF, remove all platforms
      if (currentPlatforms.includes("restaurant")) {
        setNewItem({ ...newItem, platforms: [] });
        toast({
          title: "Platform Update",
          description: "Restaurant disabled. All other platforms have been disabled automatically.",
        });
      } else {
        // If toggling restaurant ON, just add it
        setNewItem({ ...newItem, platforms: ["restaurant"] });
      }
    } else {
      // For other platforms, check if restaurant is enabled
      if (!currentPlatforms.includes("restaurant")) {
        toast({
          title: "Restaurant Required",
          description: "Please enable Restaurant platform first before adding other platforms.",
          variant: "destructive",
        });
        return;
      }
      
      // Toggle the specific platform independently
      if (currentPlatforms.includes(platform)) {
        setNewItem({
          ...newItem,
          platforms: currentPlatforms.filter(p => p !== platform)
        });
      } else {
        setNewItem({
          ...newItem,
          platforms: [...currentPlatforms, platform]
        });
      }
    }
  };

  // Platform toggle handler with dependency rules for Edit Item
  const togglePlatformForEditItem = (platform: MenuPlatform) => {
    if (!editingItem) return;
    const currentPlatforms = editingItem.platforms || [];
    
    if (platform === "restaurant") {
      // If toggling restaurant OFF, remove all platforms
      if (currentPlatforms.includes("restaurant")) {
        setEditingItem({ ...editingItem, platforms: [] });
        toast({
          title: "Platform Update",
          description: "Restaurant disabled. All other platforms have been disabled automatically.",
        });
      } else {
        // If toggling restaurant ON, just add it
        setEditingItem({ ...editingItem, platforms: ["restaurant"] });
      }
    } else {
      // For other platforms, check if restaurant is enabled
      if (!currentPlatforms.includes("restaurant")) {
        toast({
          title: "Restaurant Required",
          description: "Please enable Restaurant platform first before adding other platforms.",
          variant: "destructive",
        });
        return;
      }
      
      // Toggle the specific platform independently
      // Zomato, Swiggy, and Other can be toggled without affecting each other
      if (currentPlatforms.includes(platform)) {
        setEditingItem({
          ...editingItem,
          platforms: currentPlatforms.filter(p => p !== platform)
        });
      } else {
        setEditingItem({
          ...editingItem,
          platforms: [...currentPlatforms, platform]
        });
      }
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesPlatform = item.platforms.includes(activePlatform);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesPlatform && matchesSearch && matchesCategory;
  });

  const platformIcons = {
    restaurant: <ChefHat className="w-4 h-4" />,
    zomato: <Package className="w-4 h-4" />,
    swiggy: <Truck className="w-4 h-4" />,
    other: <MoreVertical className="w-4 h-4" />,
  };

  const platformColors = {
    restaurant: {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      text: "text-white",
      border: "border-blue-500",
    },
    zomato: {
      bg: "bg-red-500",
      hover: "hover:bg-red-600",
      text: "text-white",
      border: "border-red-500",
    },
    swiggy: {
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
      text: "text-white",
      border: "border-orange-500",
    },
    other: {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-600",
      text: "text-white",
      border: "border-purple-500",
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your menu across different platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowChargesDialog(true)} className="rounded-xl">
            <Percent className="w-4 h-4 mr-2" />
            Manage Charges
          </Button>
          <Button variant="outline" onClick={() => setShowAddCategory(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => setShowAddItem(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Platform Tabs - Color Coded */}
      <div className="flex gap-3">
        {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map((platform) => {
          const itemCount = menuItems.filter(item => item.platforms.includes(platform)).length;
          
          return (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activePlatform === platform
                  ? `${platformColors[platform].bg} ${platformColors[platform].text} shadow-lg scale-105`
                  : `bg-muted text-muted-foreground ${platformColors[platform].hover} hover:scale-105`
              }`}
            >
              {platformIcons[platform]}
              <span className="capitalize">{platform}</span>
              <Badge 
                variant={activePlatform === platform ? "secondary" : "outline"}
                className={`ml-1 ${activePlatform === platform ? 'bg-white/20 text-white border-white/30' : ''}`}
              >
                {itemCount}
              </Badge>
            </button>
          );
        })}
      </div>

      <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as MenuPlatform)}>

        {/* Search and Filters */}
        <div className="space-y-3 mt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const itemCount = menuItems.filter(
                (item) => item.category === cat.name && item.platforms.includes(activePlatform)
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
                  }`}
                >
                  {cat.name}
                  <Badge
                    variant="secondary"
                    className={`ml-1 ${
                      selectedCategory === cat.name
                        ? "bg-white/20 text-white border-white/30"
                        : ""
                    }`}
                  >
                    {itemCount}
                  </Badge>
                </button>
              );
            })}
          </div>
          
          {/* Active Filter Indicator */}
          {(selectedCategory !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <Badge variant="secondary" className="gap-1">
                {selectedCategory !== "all" && (
                  <>
                    <Filter className="w-3 h-3" />
                    {selectedCategory}
                  </>
                )}
                {searchQuery && (
                  <>
                    <Search className="w-3 h-3" />
                    "{searchQuery}"
                  </>
                )}
              </Badge>
              <span className="text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
              </span>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-xs text-primary hover:underline ml-auto"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        <TabsContent value={activePlatform} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className={`${!item.isAvailable ? "opacity-60" : ""} animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Item Image */}
                {item.image && (
                  <div className="relative w-full aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(item.id)}
                        className="bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {item.isVeg ? (
                          <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-600" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                          </div>
                        )}
                        {item.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                    {!item.image && (
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(item.id)}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">₹{item.price}</span>
                    <Badge variant="secondary">GST {item.gst}%</Badge>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      {item.category} → {item.subCategory}
                    </div>
                    {item.preparationTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {item.preparationTime} mins
                      </div>
                    )}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="text-xs">
                      <p className="font-semibold mb-1">Variants:</p>
                      <div className="space-y-1">
                        {item.variants.map(variant => (
                          <div key={variant.id} className="flex justify-between">
                            <span>{variant.name}</span>
                            <span className="font-medium">₹{variant.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Platform availability toggles */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Platform Availability</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => {
                        const isOnPlatform = item.platforms.includes(platform);
                        let isAvailableOnPlatform = true;
                        
                        switch (platform) {
                          case "restaurant":
                            isAvailableOnPlatform = item.availableOnRestaurant ?? true;
                            break;
                          case "zomato":
                            isAvailableOnPlatform = item.availableOnZomato ?? true;
                            break;
                          case "swiggy":
                            isAvailableOnPlatform = item.availableOnSwiggy ?? true;
                            break;
                          case "other":
                            isAvailableOnPlatform = item.availableOnOther ?? true;
                            break;
                        }
                        
                        const platformStyle = isOnPlatform && isAvailableOnPlatform
                          ? platform === 'restaurant' ? 'border-blue-500 bg-blue-50'
                          : platform === 'zomato' ? 'border-red-500 bg-red-50'
                          : platform === 'swiggy' ? 'border-orange-500 bg-orange-50'
                          : 'border-purple-500 bg-purple-50'
                          : 'border-muted bg-muted/30';
                        
                        return (
                          <div
                            key={platform}
                            className={`flex items-center justify-between p-2 border rounded-lg text-xs transition-all ${platformStyle}`}
                          >
                            <div className="flex items-center gap-1.5">
                              {platformIcons[platform]}
                              <span className="font-medium capitalize">{platform}</span>
                            </div>
                            {isOnPlatform && (
                              <Switch
                                checked={isAvailableOnPlatform}
                                onCheckedChange={() => handleTogglePlatformAvailability(item.id, platform)}
                                className="scale-75"
                              />
                            )}
                            {!isOnPlatform && (
                              <span className="text-muted-foreground text-[10px]">Not added</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm mt-1">Add items to your {activePlatform} menu</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to your {activePlatform} menu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Paneer Tikka"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Price *</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="item-image">Item Image</Label>
              <div className="space-y-3">
                {newItemImagePreview || newItem.image ? (
                  <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted">
                    <img
                      src={newItemImagePreview || newItem.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(false)}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-all shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="item-image"
                    className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                    </div>
                    <Input
                      id="item-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Describe your dish..."
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-category">Category *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-subcategory">Sub Category</Label>
                <Select
                  value={newItem.subCategory}
                  onValueChange={(value) => setNewItem({ ...newItem, subCategory: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find(c => c.name === newItem.category)
                      ?.subCategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-gst">GST %</Label>
                <Input
                  id="item-gst"
                  type="number"
                  value={newItem.gst}
                  onChange={(e) => setNewItem({ ...newItem, gst: parseFloat(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Dietary Type</Label>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="veg"
                      checked={newItem.isVeg}
                      onChange={() => setNewItem({ ...newItem, isVeg: true })}
                    />
                    <Label htmlFor="veg" className="flex items-center gap-2 cursor-pointer">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Veg
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="non-veg"
                      checked={!newItem.isVeg}
                      onChange={() => setNewItem({ ...newItem, isVeg: false })}
                    />
                    <Label htmlFor="non-veg" className="flex items-center gap-2 cursor-pointer">
                      <Drumstick className="w-4 h-4 text-red-600" />
                      Non-Veg
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available on Platforms</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Note: Restaurant platform must be enabled before adding to other platforms
              </p>
              <div className="space-y-2">
                {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => {
                  const isEnabled = newItem.platforms?.includes(platform);
                  const isRestaurantDisabled = platform !== "restaurant" && !newItem.platforms?.includes("restaurant");
                  
                  return (
                    <div
                      key={platform}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                        isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                      } ${isRestaurantDisabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {platformIcons[platform]}
                        <div>
                          <p className="font-medium capitalize">{platform}</p>
                          {platform === "restaurant" && (
                            <p className="text-xs text-muted-foreground">Primary platform (required)</p>
                          )}
                          {isRestaurantDisabled && (
                            <p className="text-xs text-destructive">Enable Restaurant first</p>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => togglePlatformForNewItem(platform)}
                        disabled={isRestaurantDisabled}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddItem(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of your menu item
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-item-name">Item Name *</Label>
                    <Input
                      id="edit-item-name"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="e.g., Paneer Tikka"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-item-price">Base Price (₹) *</Label>
                    <Input
                      id="edit-item-price"
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Image Upload/Edit Section */}
                <div className="space-y-2">
                  <Label htmlFor="edit-item-image">Item Image</Label>
                  <div className="space-y-3">
                    {editItemImagePreview || editingItem.image ? (
                      <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/25 bg-muted">
                        <img
                          src={editItemImagePreview || editingItem.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <label
                            htmlFor="edit-item-image"
                            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeImage(true)}
                            className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-all shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="edit-item-image"
                        className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                        </div>
                      </label>
                    )}
                    <Input
                      id="edit-item-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-item-description">Description</Label>
                  <Textarea
                    id="edit-item-description"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Describe your dish..."
                    className="rounded-xl"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-item-category">Category *</Label>
                    <Select
                      value={editingItem.category}
                      onValueChange={(value) => setEditingItem({ ...editingItem, category: value, subCategory: "" })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-item-subcategory">Sub Category</Label>
                    <Select
                      value={editingItem.subCategory}
                      onValueChange={(value) => setEditingItem({ ...editingItem, subCategory: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .find(c => c.name === editingItem.category)
                          ?.subCategories.map(sub => (
                            <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-item-gst">GST %</Label>
                    <Input
                      id="edit-item-gst"
                      type="number"
                      value={editingItem.gst}
                      onChange={(e) => setEditingItem({ ...editingItem, gst: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prep-time">Preparation Time (minutes)</Label>
                    <Input
                      id="edit-prep-time"
                      type="number"
                      value={editingItem.preparationTime || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value) || undefined })}
                      placeholder="e.g., 15"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dietary Type</Label>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="edit-veg"
                          checked={editingItem.isVeg}
                          onChange={() => setEditingItem({ ...editingItem, isVeg: true })}
                        />
                        <Label htmlFor="edit-veg" className="flex items-center gap-2 cursor-pointer">
                          <Leaf className="w-4 h-4 text-green-600" />
                          Veg
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="edit-non-veg"
                          checked={!editingItem.isVeg}
                          onChange={() => setEditingItem({ ...editingItem, isVeg: false })}
                        />
                        <Label htmlFor="edit-non-veg" className="flex items-center gap-2 cursor-pointer">
                          <Drumstick className="w-4 h-4 text-red-600" />
                          Non-Veg
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</h3>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editingItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (e.g., Spicy, Popular)"
                      className="rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addTag(input.value);
                        input.value = '';
                      }}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or click + to add a tag</p>
                </div>
              </div>

              <Separator />

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Variants</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>

                {editingItem.variants && editingItem.variants.length > 0 ? (
                  <div className="space-y-2">
                    {editingItem.variants.map((variant) => (
                      <div key={variant.id} className="flex gap-2 items-center p-3 border rounded-xl">
                        <Input
                          placeholder="Variant name (e.g., Half, Full)"
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          className="flex-1 rounded-xl"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-32 rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No variants added. Click "Add Variant" to create size options.</p>
                )}
              </div>

              <Separator />

              {/* Platforms */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Available on Platforms</h3>
                <p className="text-xs text-muted-foreground">
                  Note: Restaurant platform must be enabled before adding to other platforms
                </p>
                <div className="space-y-2">
                  {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => {
                    const isEnabled = editingItem.platforms?.includes(platform);
                    const isRestaurantDisabled = platform !== "restaurant" && !editingItem.platforms?.includes("restaurant");
                    
                    return (
                      <div
                        key={platform}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                          isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                        } ${isRestaurantDisabled ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {platformIcons[platform]}
                          <div>
                            <p className="font-medium capitalize">{platform}</p>
                            {platform === "restaurant" && (
                              <p className="text-xs text-muted-foreground">Primary platform (required)</p>
                            )}
                            {isRestaurantDisabled && (
                              <p className="text-xs text-destructive">Enable Restaurant first</p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => togglePlatformForEditItem(platform)}
                          disabled={isRestaurantDisabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Platform-Specific Availability */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Platform-Specific Availability</h3>
                <p className="text-xs text-muted-foreground">
                  Control item availability independently for each platform
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => {
                    const isOnPlatform = editingItem.platforms?.includes(platform);
                    let isAvailableOnPlatform = true;
                    
                    switch (platform) {
                      case "restaurant":
                        isAvailableOnPlatform = editingItem.availableOnRestaurant ?? true;
                        break;
                      case "zomato":
                        isAvailableOnPlatform = editingItem.availableOnZomato ?? true;
                        break;
                      case "swiggy":
                        isAvailableOnPlatform = editingItem.availableOnSwiggy ?? true;
                        break;
                      case "other":
                        isAvailableOnPlatform = editingItem.availableOnOther ?? true;
                        break;
                    }
                    
                    return (
                      <div
                        key={platform}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                          isOnPlatform ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {platformIcons[platform]}
                          <div>
                            <p className="font-medium capitalize text-sm">{platform}</p>
                            {!isOnPlatform && (
                              <p className="text-xs text-muted-foreground">Not on platform</p>
                            )}
                          </div>
                        </div>
                        {isOnPlatform && (
                          <Switch
                            checked={isAvailableOnPlatform}
                            onCheckedChange={() => {
                              const updates: Partial<MenuItem> = {};
                              switch (platform) {
                                case "restaurant":
                                  updates.availableOnRestaurant = !isAvailableOnPlatform;
                                  break;
                                case "zomato":
                                  updates.availableOnZomato = !isAvailableOnPlatform;
                                  break;
                                case "swiggy":
                                  updates.availableOnSwiggy = !isAvailableOnPlatform;
                                  break;
                                case "other":
                                  updates.availableOnOther = !isAvailableOnPlatform;
                                  break;
                              }
                              setEditingItem({ ...editingItem, ...updates });
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingItem(null)} 
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditItem} 
                  className="rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing your menu items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Appetizers, Soups, Salads"
                className="rounded-xl"
              />
            </div>

            {/* Category Description */}
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description of this category"
                className="rounded-xl"
                rows={2}
              />
            </div>

            <Separator />

            {/* Sub Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sub Categories</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add sub-categories to organize items within this category
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubCategoryField}
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Sub Category
                </Button>
              </div>

              <div className="space-y-2">
                {newCategory.subCategories.map((subCat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={subCat}
                      onChange={(e) => updateSubCategory(index, e.target.value)}
                      placeholder={`Sub category ${index + 1} (e.g., Veg, Non-Veg)`}
                      className="flex-1 rounded-xl"
                    />
                    {newCategory.subCategories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubCategory(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Default Categories Info */}
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Default Categories Available
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Badge key={cat.id} variant="outline" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory({
                    name: "",
                    description: "",
                    subCategories: [""],
                  });
                }} 
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCategory} 
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Charges Dialog */}
      <Dialog open={showChargesDialog} onOpenChange={setShowChargesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Charges & Taxes</DialogTitle>
            <DialogDescription>
              Update packaging, delivery charges, and taxes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="packaging-charge">Packaging Charge (₹)</Label>
              <Input
                id="packaging-charge"
                type="number"
                value={charges.packagingCharge}
                onChange={(e) => setCharges({ ...charges, packagingCharge: parseFloat(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-charge">Delivery Charge (₹)</Label>
              <Input
                id="delivery-charge"
                type="number"
                value={charges.deliveryCharge}
                onChange={(e) => setCharges({ ...charges, deliveryCharge: parseFloat(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cgst">CGST (%)</Label>
                <Input
                  id="cgst"
                  type="number"
                  value={charges.cgst}
                  onChange={(e) => setCharges({ ...charges, cgst: parseFloat(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sgst">SGST (%)</Label>
                <Input
                  id="sgst"
                  type="number"
                  value={charges.sgst}
                  onChange={(e) => setCharges({ ...charges, sgst: parseFloat(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowChargesDialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={() => {
                setShowChargesDialog(false);
                toast({
                  title: "Charges Updated",
                  description: "Charges and taxes have been updated successfully.",
                });
              }} className="rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
