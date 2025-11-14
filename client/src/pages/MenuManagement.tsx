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
import { ImageUpload } from "@/components/ImageUpload";
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
  Timer,
  Power,
  PowerOff,
  Utensils,
  Bike,
} from "lucide-react";

type MenuPlatform = "restaurant" | "zomato" | "swiggy" | "other";

interface PlatformAvailability {
  isAvailable: boolean;
  offlineUntil?: Date;
  offlineReason?: string;
}

interface OfflineDuration {
  label: string;
  value: number; // hours
  type: 'hours' | 'business_day' | 'custom';
}

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
  images?: string[]; // Array of image URLs
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
  platformAvailability: Record<MenuPlatform, PlatformAvailability>;
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
  
  // Fetch dishes from API
  const { data: dishes = [], isLoading: dishesLoading } = useQuery<Dish[]>({
    queryKey: ['/api/dishes'],
  });

  // Mutation to create dishes
  const createDishMutation = useMutation({
    mutationFn: async (dishData: any) => {
      return await apiRequest('POST', '/api/dishes', dishData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
    },
  });

  // Mutation to update dishes
  const updateDishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PATCH', `/api/dishes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
    },
  });

  // Mutation to delete dishes
  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/dishes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dishes'] });
    },
  });
  
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
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [offlineDialogData, setOfflineDialogData] = useState<{
    itemId: string;
    itemName: string;
    platform: MenuPlatform;
    currentStatus: boolean;
  } | null>(null);

  // Platform-specific availability state
  const [platformAvailabilityState, setPlatformAvailabilityState] = useState<Record<string, Record<MenuPlatform, PlatformAvailability>>>({});
  
  // Offline duration options and state
  const offlineDurationOptions: OfflineDuration[] = [
    { label: "2 Hours", value: 2, type: "hours" },
    { label: "8 Hours", value: 8, type: "hours" },
    { label: "Next Business Day", value: 16, type: "business_day" },
    { label: "Custom", value: 0, type: "custom" },
  ];

  const [customOfflineHours, setCustomOfflineHours] = useState(1);
  const [selectedOfflineDuration, setSelectedOfflineDuration] = useState<OfflineDuration>(offlineDurationOptions[0]);

  // Form states
  const [newItem, setNewItem] = useState<MenuItem>({
    id: "",
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: 0,
    isVeg: true,
    isAvailable: true,
    images: [],
    tags: [],
    gst: 5,
    platforms: [activePlatform],
    platformAvailability: {
      restaurant: { isAvailable: true },
      zomato: { isAvailable: true },
      swiggy: { isAvailable: true },
      other: { isAvailable: true },
    },
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    subCategories: [""],
  });

  // Seed initial dishes if database is empty
  useEffect(() => {
    if (!dishesLoading && dishes.length === 0) {
      // Add some sample dishes to get started
      const sampleDishes = [
        { name: "Paneer Tikka", price: "250", category: "Starters", veg: true, image: null, available: true },
        { name: "Chicken Tikka", price: "320", category: "Starters", veg: false, image: null, available: true },
        { name: "Butter Chicken", price: "380", category: "Main Course", veg: false, image: null, available: true },
        { name: "Dal Makhani", price: "280", category: "Main Course", veg: true, image: null, available: true },
      ];
      
      sampleDishes.forEach((dishData) => {
        createDishMutation.mutate(dishData);
      });
      
      toast({
        title: "Menu Initialized",
        description: "Sample dishes have been added to your menu.",
      });
    }
  }, [dishesLoading, dishes.length]);

  const handleAddItem = async () => {
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

    // Convert to Dish format for API
    const dishData = {
      name: newItem.name,
      price: newItem.price.toString(),
      category: newItem.category || "Uncategorized",
      veg: newItem.isVeg ?? true,
      image: newItem.images && newItem.images.length > 0 ? newItem.images[0] : null, // Use first image as primary
      images: newItem.images || [], // Include all images
      available: true,
    };

    try {
      await createDishMutation.mutateAsync(dishData);
      
      setShowAddItem(false);
      setNewItem({
        id: "",
        name: "",
        description: "",
        category: "",
        subCategory: "",
        price: 0,
        isVeg: true,
        isAvailable: true,
        images: [],
        tags: [],
        gst: 5,
        platforms: ["restaurant"],
        platformAvailability: {
          restaurant: { isAvailable: true },
          zomato: { isAvailable: true },
          swiggy: { isAvailable: true },
          other: { isAvailable: true },
        },
      });

      toast({
        title: "Item Added",
        description: `${dishData.name} has been added to the menu.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to menu.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
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

    // Find the dish in the database by ID (editingItem.id is now the dish ID from API)
    // Convert variants to database format
    const variants = editingItem.variants?.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price.toString(),
      available: v.isAvailable,
    }));

    const dishData = {
      name: editingItem.name,
      price: editingItem.price.toString(),
      category: editingItem.category,
      veg: editingItem.isVeg,
      image: editingItem.images && editingItem.images.length > 0 ? editingItem.images[0] : null, // Use first image as primary
      images: editingItem.images || [], // Include all images
      available: editingItem.isAvailable,
      variants: variants,
    };

    try {
      await updateDishMutation.mutateAsync({ id: editingItem.id, data: dishData });
      
      setEditingItem(null);
      toast({
        title: "Item Updated",
        description: `${editingItem.name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item in database.",
        variant: "destructive",
      });
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

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDishMutation.mutateAsync(id);
      toast({
        title: "Item Deleted",
        description: "Menu item has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item from database.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (id: string) => {
    // Find the dish in the API data
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;

    try {
      await updateDishMutation.mutateAsync({ 
        id: id, 
        data: { available: !dish.available }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    }
  };

  const handlePlatformToggle = (itemId: string, itemName: string, platform: MenuPlatform, currentStatus: boolean) => {
    if (currentStatus) {
      // If currently available, show offline dialog
      setOfflineDialogData({
        itemId,
        itemName,
        platform,
        currentStatus,
      });
      setShowOfflineDialog(true);
    } else {
      // If currently offline, turn it back online immediately
      handleSetPlatformAvailability(itemId, platform, true);
    }
  };

  const handleSetPlatformAvailability = async (itemId: string, platform: MenuPlatform, isAvailable: boolean, offlineUntil?: Date) => {
    // Update platform-specific availability state
    setPlatformAvailabilityState(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [platform]: {
          isAvailable,
          offlineUntil,
          offlineReason: isAvailable ? undefined : 'Manual offline',
        },
      },
    }));

    // Show toast notification
    const statusText = isAvailable ? 'online' : 'offline';
    const platformText = platform.charAt(0).toUpperCase() + platform.slice(1);
    const timeText = offlineUntil ? ` until ${offlineUntil.toLocaleString()}` : '';
    
    toast({
      title: `${platformText} Status Updated`,
      description: `Item is now ${statusText} on ${platformText}${timeText}.`,
    });

    setShowOfflineDialog(false);
    setOfflineDialogData(null);
  };

  const handleConfirmOffline = () => {
    if (!offlineDialogData) return;

    let offlineUntil: Date | undefined;
    
    if (selectedOfflineDuration.type === 'custom') {
      offlineUntil = new Date(Date.now() + customOfflineHours * 60 * 60 * 1000);
    } else if (selectedOfflineDuration.type === 'business_day') {
      // Set to next business day at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      // Skip weekend if it's Saturday or Sunday
      if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // Sunday -> Monday
      if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2); // Saturday -> Monday
      offlineUntil = tomorrow;
    } else {
      offlineUntil = new Date(Date.now() + selectedOfflineDuration.value * 60 * 60 * 1000);
    }

    handleSetPlatformAvailability(
      offlineDialogData.itemId,
      offlineDialogData.platform,
      false,
      offlineUntil
    );
  };

  const handleCopyToPlatform = (itemId: string, platform: MenuPlatform) => {
    // Platform management is not currently supported in the database schema
    // All items appear on all platforms by default
    toast({
      title: "Platform Feature",
      description: "All items are available on all platforms.",
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

  // Get platform availability for an item
  const getPlatformAvailability = (itemId: string, platform: MenuPlatform): PlatformAvailability => {
    const itemState = platformAvailabilityState[itemId];
    if (itemState && itemState[platform]) {
      return itemState[platform];
    }
    // Default to available if no specific state is set
    return { isAvailable: true };
  };

  // Convert API dishes to MenuItem format for display
  const dishesToMenuItems = (dishes: Dish[]): MenuItem[] => {
    return dishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      description: "",
      category: dish.category,
      subCategory: "",
      price: parseFloat(dish.price),
      isVeg: dish.veg,
      isAvailable: dish.available,
      tags: [],
      gst: 5,
      platforms: ["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[],
      platformAvailability: {
        restaurant: getPlatformAvailability(dish.id, 'restaurant'),
        zomato: getPlatformAvailability(dish.id, 'zomato'),
        swiggy: getPlatformAvailability(dish.id, 'swiggy'),
        other: getPlatformAvailability(dish.id, 'other'),
      },
      variants: dish.variants?.map(v => ({
        id: v.id,
        name: v.name,
        price: parseFloat(v.price),
        isAvailable: v.available,
      })),
    }));
  };

  // Use dishes from API as the source of truth
  const allMenuItems = dishesToMenuItems(dishes);

  const filteredItems = allMenuItems.filter(item => {
    const matchesPlatform = item.platforms.includes(activePlatform);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesPlatform && matchesSearch && matchesCategory;
  });

  const platformIcons = {
    restaurant: <ChefHat className="w-4 h-4" />,
    zomato: <Utensils className="w-4 h-4" />,
    swiggy: <Bike className="w-4 h-4" />,
    other: <Truck className="w-4 h-4" />,
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
          const itemCount = allMenuItems.filter(item => item.platforms.includes(platform)).length;
          
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
                className={`${!item.isAvailable ? "opacity-60" : ""} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggleAvailability(item.id)}
                    />
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
                    <p className="text-xs font-medium text-muted-foreground">Platform Availability:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => {
                        const isOnPlatform = item.platforms.includes(platform);
                        const platformStatus = item.platformAvailability[platform];
                        const isAvailable = platformStatus?.isAvailable ?? true;
                        const offlineUntil = platformStatus?.offlineUntil;
                        const isExpired = offlineUntil && offlineUntil < new Date();
                        
                        if (!isOnPlatform) return null;
                        
                        // Auto-enable if expired
                        if (isExpired && !isAvailable) {
                          handleSetPlatformAvailability(item.id, platform, true);
                        }
                        
                        const currentStatus = isExpired ? true : isAvailable;
                        
                        return (
                          <div
                            key={platform}
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                              currentStatus
                                ? `${platformColors[platform].border} bg-${platform === 'restaurant' ? 'blue' : platform === 'zomato' ? 'red' : platform === 'swiggy' ? 'orange' : 'purple'}-50`
                                : 'border-muted bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {platformIcons[platform]}
                              <div>
                                <p className="text-xs font-medium capitalize">{platform}</p>
                                {!currentStatus && offlineUntil && !isExpired && (
                                  <p className="text-xs text-muted-foreground">
                                    Until {offlineUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                                {isExpired && (
                                  <p className="text-xs text-green-600">Auto-enabled</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handlePlatformToggle(item.id, item.name, platform, currentStatus)}
                              className={`p-1 rounded transition-colors ${
                                currentStatus
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-red-600 hover:bg-red-100'
                              }`}
                              title={`${currentStatus ? 'Turn off' : 'Turn on'} for ${platform}`}
                            >
                              {currentStatus ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </button>
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

            <Separator />

            {/* Image Upload Section */}
            <ImageUpload
              images={newItem.images || []}
              onImagesChange={(images) => setNewItem({ ...newItem, images })}
              restaurantId="restaurant123" // Replace with actual restaurant ID from auth
              dishId={newItem.id || 'temp'}
              maxImages={5}
            />

            <Separator />

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

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Images</h3>
                <ImageUpload
                  images={editingItem.images || []}
                  onImagesChange={(images) => setEditingItem({ ...editingItem, images })}
                  restaurantId="restaurant123" // Replace with actual restaurant ID from auth
                  dishId={editingItem.id}
                  maxImages={5}
                />
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

      {/* Offline Duration Dialog */}
      <Dialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Set Offline Duration
            </DialogTitle>
            <DialogDescription>
              {offlineDialogData && (
                <>
                  How long should <strong>{offlineDialogData.itemName}</strong> be offline on{" "}
                  <strong className="capitalize">{offlineDialogData.platform}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Duration Options */}
            <div className="space-y-3">
              <Label>Select Duration</Label>
              <div className="space-y-2">
                {offlineDurationOptions.map((option) => (
                  <div
                    key={option.label}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedOfflineDuration.label === option.label
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedOfflineDuration(option)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedOfflineDuration.label === option.label}
                        onChange={() => setSelectedOfflineDuration(option)}
                        className="text-primary"
                      />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        {option.type === 'hours' && (
                          <p className="text-xs text-muted-foreground">
                            Until {new Date(Date.now() + option.value * 60 * 60 * 1000).toLocaleString()}
                          </p>
                        )}
                        {option.type === 'business_day' && (
                          <p className="text-xs text-muted-foreground">
                            Until next business day at 9:00 AM
                          </p>
                        )}
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Duration Input */}
            {selectedOfflineDuration.type === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-hours">Custom Duration (Hours)</Label>
                <Input
                  id="custom-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={customOfflineHours}
                  onChange={(e) => setCustomOfflineHours(parseInt(e.target.value) || 1)}
                  placeholder="Enter hours"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Will be back online at:{" "}
                  {new Date(Date.now() + customOfflineHours * 60 * 60 * 1000).toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOfflineDialog(false);
                  setOfflineDialogData(null);
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmOffline}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Set Offline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
