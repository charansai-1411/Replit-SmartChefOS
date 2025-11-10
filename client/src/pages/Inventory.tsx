import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Minus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ingredient } from "@shared/schema";

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    currentStock: "0",
    minLevel: "0",
  });
  const { toast } = useToast();

  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
  });

  const { data: lowStockIngredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients/low-stock'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/ingredients', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients/low-stock'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ description: "Ingredient added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PATCH', `/api/ingredients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients/low-stock'] });
      setIsDialogOpen(false);
      setEditingIngredient(null);
      resetForm();
      toast({ description: "Ingredient updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/ingredients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients/low-stock'] });
      toast({ description: "Ingredient deleted successfully" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "kg",
      currentStock: "0",
      minLevel: "0",
    });
    setEditingIngredient(null);
  };

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        unit: ingredient.unit,
        currentStock: ingredient.currentStock,
        minLevel: ingredient.minLevel,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      currentStock: parseFloat(formData.currentStock),
      minLevel: parseFloat(formData.minLevel),
    };

    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleQuickAdjust = (ingredient: Ingredient, adjustment: number) => {
    const newStock = parseFloat(ingredient.currentStock) + adjustment;
    if (newStock < 0) {
      toast({ description: "Stock cannot be negative", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      id: ingredient.id,
      data: { currentStock: newStock.toString() },
    });
  };

  const isLowStock = (ingredient: Ingredient) => {
    return parseFloat(ingredient.currentStock) <= parseFloat(ingredient.minLevel);
  };

  const getStockStatus = (ingredient: Ingredient) => {
    const current = parseFloat(ingredient.currentStock);
    const min = parseFloat(ingredient.minLevel);
    const ratio = current / (min * 3); // Full stock = 3x minimum
    
    if (ratio >= 1) return { color: 'bg-green-500', label: 'Full Stock', percentage: 100 };
    if (ratio >= 0.5) return { color: 'bg-orange-500', label: 'Moderate', percentage: ratio * 100 };
    return { color: 'bg-red-500', label: 'Low Stock', percentage: ratio * 100 };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Manage ingredients and track stock levels</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
          <Button onClick={() => handleOpenDialog()} className="rounded-xl h-11 text-base px-6 transition-all duration-200 hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Add Ingredient
          </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
                </DialogTitle>
                <DialogDescription>
                  {editingIngredient
                    ? "Update ingredient details"
                    : "Add a new ingredient to your inventory"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Chicken, Rice, Oil"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      placeholder="kg, g, l, ml, pieces"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Stock</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({ ...formData, currentStock: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minimum Level</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.minLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, minLevel: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert will trigger when stock reaches this level
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingIngredient ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {lowStockIngredients.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Low Stock Alert:</strong> {lowStockIngredients.length} ingredient(s) are
              below minimum level. Please restock soon.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Level</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Quick Adjust</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No ingredients found. Add your first ingredient to get started.
                  </TableCell>
                </TableRow>
              ) : (
                ingredients.map((ingredient) => {
                  const stockStatus = getStockStatus(ingredient);
                  return (
                    <TableRow key={ingredient.id} className="hover:bg-muted/50 transition-colors duration-200">
                      <TableCell className="font-medium text-base py-4">{ingredient.name}</TableCell>
                      <TableCell className="text-base py-4">
                        {parseFloat(ingredient.currentStock).toFixed(2)} {ingredient.unit}
                      </TableCell>
                      <TableCell className="text-base py-4">
                        {parseFloat(ingredient.minLevel).toFixed(2)} {ingredient.unit}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${stockStatus.color} transition-all duration-300`}
                                style={{ width: `${Math.min(stockStatus.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                          <Badge 
                            variant={isLowStock(ingredient) ? "destructive" : "secondary"} 
                            className="text-xs px-2 py-0.5"
                          >
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuickAdjust(ingredient, -1)}
                            disabled={updateMutation.isPending}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuickAdjust(ingredient, 1)}
                            disabled={updateMutation.isPending}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 transition-all duration-200 hover:scale-110"
                            onClick={() => handleOpenDialog(ingredient)}
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 transition-all duration-200 hover:scale-110"
                            onClick={() => handleDelete(ingredient.id, ingredient.name)}
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

