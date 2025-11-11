import { useState } from "react";
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
  });

  const handleAddItem = () => {
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
      platforms: newItem.platforms || [activePlatform],
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
      platforms: [activePlatform],
    });

    toast({
      title: "Item Added",
      description: `${item.name} has been added to the menu.`,
    });
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
        {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map((platform) => (
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
          </button>
        ))}
      </div>

      <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as MenuPlatform)}>

        {/* Search and Filters */}
        <div className="flex gap-4 mt-6">
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

        {/* Menu Items Grid */}
        <TabsContent value={activePlatform} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className={!item.isAvailable ? "opacity-60" : ""}>
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

                  {/* Platform badges */}
                  <div className="flex flex-wrap gap-1">
                    {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => (
                      <Button
                        key={platform}
                        variant={item.platforms.includes(platform) ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => !item.platforms.includes(platform) && handleCopyToPlatform(item.id, platform)}
                      >
                        {platformIcons[platform]}
                      </Button>
                    ))}
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

            <div className="space-y-2">
              <Label>Available on Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {(["restaurant", "zomato", "swiggy", "other"] as MenuPlatform[]).map(platform => (
                  <Button
                    key={platform}
                    type="button"
                    variant={newItem.platforms?.includes(platform) ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      const platforms = newItem.platforms || [];
                      if (platforms.includes(platform)) {
                        setNewItem({
                          ...newItem,
                          platforms: platforms.filter(p => p !== platform)
                        });
                      } else {
                        setNewItem({
                          ...newItem,
                          platforms: [...platforms, platform]
                        });
                      }
                    }}
                  >
                    {platformIcons[platform]}
                    <span className="ml-2 capitalize">{platform}</span>
                  </Button>
                ))}
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
