import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Utensils, ShoppingBag, ListOrdered } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import type { Table } from "@shared/schema";

const SECTIONS = ["Garden", "Balcony", "Open", "Indoor", "VIP", "Outdoor"];

const STATUS_COLORS = {
  available: "bg-green-500",
  occupied: "bg-blue-500",
  reserved: "bg-yellow-500",
  cleaning: "bg-gray-500",
};

export default function Tables() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    section: "",
    capacity: 4,
    status: "available" as const,
  });

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ description: "Table created successfully" });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to create table";
      toast({ description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/tables/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setIsEditDialogOpen(false);
      setSelectedTable(null);
      resetForm();
      toast({ description: "Table updated successfully" });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to update table";
      toast({ description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setIsDeleteDialogOpen(false);
      setSelectedTable(null);
      toast({ description: "Table deleted successfully" });
    },
    onError: () => {
      toast({ description: "Failed to delete table", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      number: "",
      section: "",
      capacity: 4,
      status: "available",
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      number: table.number,
      section: table.section,
      capacity: table.capacity,
      status: table.status as "available",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (table: Table) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.number || !formData.section) {
      toast({ description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (isEditDialogOpen && selectedTable) {
      updateMutation.mutate({ id: selectedTable.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };


  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.section]) {
      acc[table.section] = [];
    }
    acc[table.section].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tables</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your restaurant tables and sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setLocation("/orders?type=dine-in")}
          >
            <Utensils className="w-4 h-4 mr-2" />
            Dine-in
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setLocation("/orders?type=takeaway")}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Takeaway
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setLocation("/orders?type=orders")}
          >
            <ListOrdered className="w-4 h-4 mr-2" />
            Orders
          </Button>
          <Button onClick={handleAdd} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <Card className="p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">Table Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-xs text-muted-foreground">Cleaning</span>
          </div>
        </div>
      </Card>

      {Object.keys(groupedTables).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No tables found</p>
          <Button onClick={handleAdd} variant="outline" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Table
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTables).map(([section, sectionTables]) => (
            <div key={section}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{section}</span>
                <Badge variant="secondary">{sectionTables.length}</Badge>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sectionTables.map((table) => (
                  <Card
                    key={table.id}
                    className="p-4 hover-elevate transition-all relative group cursor-pointer"
                    onClick={() => setLocation(`/orders?table=${table.id}&tableNumber=${table.number}&type=dine-in`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Table {table.number}</h3>
                        <p className="text-xs text-muted-foreground">{table.section}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${STATUS_COLORS[table.status as keyof typeof STATUS_COLORS] || "bg-gray-500"}`}
                        title={table.status}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} seats</span>
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(table);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 flex-1 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(table);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>Create a new table for your restaurant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="number">Table Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., 01, 02, A1"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="section">Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger className="rounded-xl" id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })
                }
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl" id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update table information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-number">Table Number *</Label>
              <Input
                id="edit-number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-section">Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger className="rounded-xl" id="edit-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })
                }
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl" id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Table {selectedTable?.number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTable && deleteMutation.mutate(selectedTable.id)}
              className="rounded-xl bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

