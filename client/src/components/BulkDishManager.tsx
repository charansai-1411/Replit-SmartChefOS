import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Square, 
  Power, 
  PowerOff, 
  Undo2, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import DishCard from './DishCard';

interface PlatformAvailability {
  restaurant: boolean;
  zomato: boolean;
  swiggy: boolean;
  other: boolean;
}

interface DishData {
  id: string;
  restaurantId: string;
  name: string;
  priceMinor: number;
  category: string;
  images?: string[];
  availability: PlatformAvailability;
  createdAt?: any;
  updatedAt?: any;
}

interface BulkOperation {
  type: 'platform_toggle';
  platform: keyof PlatformAvailability;
  enabled: boolean;
  dishIds: string[];
  timestamp: number;
}

interface BulkDishManagerProps {
  dishes: DishData[];
  onDishUpdate: (dishId: string, updates: Partial<DishData>) => void;
}

const PLATFORM_CONFIGS = {
  restaurant: { name: 'Restaurant', color: 'bg-blue-500', icon: '🏪' },
  zomato: { name: 'Zomato', color: 'bg-red-500', icon: '🍕' },
  swiggy: { name: 'Swiggy', color: 'bg-orange-500', icon: '🛵' },
  other: { name: 'Other', color: 'bg-gray-500', icon: '📱' }
} as const;

export function BulkDishManager({ dishes, onDishUpdate }: BulkDishManagerProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastOperation, setLastOperation] = useState<BulkOperation | null>(null);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedDishes(new Set());
    }
  }, [selectionMode]);

  // Handle individual dish selection
  const handleDishSelection = useCallback((dishId: string, selected: boolean) => {
    setSelectedDishes(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(dishId);
      } else {
        newSet.delete(dishId);
      }
      return newSet;
    });
  }, []);

  // Select all dishes
  const selectAll = useCallback(() => {
    setSelectedDishes(new Set(dishes.map(dish => dish.id)));
  }, [dishes]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedDishes(new Set());
  }, []);

  // Bulk platform toggle with batched writes
  const bulkTogglePlatform = async (platform: keyof PlatformAvailability, enabled: boolean) => {
    if (selectedDishes.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select dishes to update.",
        variant: "destructive"
      });
      return;
    }

    // Confirm action
    const confirmed = window.confirm(
      `${enabled ? 'Enable' : 'Disable'} ${PLATFORM_CONFIGS[platform].name} for ${selectedDishes.size} selected dishes?`
    );
    
    if (!confirmed) return;

    setIsProcessing(true);
    setOperationStatus('processing');
    setProgress(0);

    const selectedDishIds = Array.from(selectedDishes);
    const BATCH_SIZE = 500; // Firestore batch limit
    const batches = [];
    
    // Create batches
    for (let i = 0; i < selectedDishIds.length; i += BATCH_SIZE) {
      const batchDishIds = selectedDishIds.slice(i, i + BATCH_SIZE);
      batches.push(batchDishIds);
    }

    try {
      // Store operation for potential undo
      const operation: BulkOperation = {
        type: 'platform_toggle',
        platform,
        enabled,
        dishIds: selectedDishIds,
        timestamp: Date.now()
      };

      let completedDishes = 0;

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = writeBatch(db);
        const batchDishIds = batches[batchIndex];

        // Add updates to batch
        for (const dishId of batchDishIds) {
          const dish = dishes.find(d => d.id === dishId);
          if (dish) {
            const dishRef = doc(db, 'dishes', dishId);
            const newAvailability = {
              ...dish.availability,
              [platform]: enabled
            };

            batch.update(dishRef, {
              availability: newAvailability,
              updatedAt: new Date()
            });
          }
        }

        // Commit batch
        await batch.commit();

        // Update local state for this batch
        for (const dishId of batchDishIds) {
          const dish = dishes.find(d => d.id === dishId);
          if (dish) {
            const newAvailability = {
              ...dish.availability,
              [platform]: enabled
            };
            onDishUpdate(dishId, { availability: newAvailability });
          }
        }

        completedDishes += batchDishIds.length;
        setProgress((completedDishes / selectedDishIds.length) * 100);

        // Small delay between batches to avoid rate limits
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setLastOperation(operation);
      setOperationStatus('success');
      
      toast({
        title: "Bulk Update Complete",
        description: `${enabled ? 'Enabled' : 'Disabled'} ${PLATFORM_CONFIGS[platform].name} for ${selectedDishIds.length} dishes.`,
      });

      // Clear selection after successful operation
      setSelectedDishes(new Set());
      
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setOperationStatus('error');
      
      toast({
        title: "Bulk Update Failed",
        description: "Some updates may have failed. Please check and retry if needed.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      
      // Reset status after delay
      setTimeout(() => setOperationStatus('idle'), 3000);
    }
  };

  // Undo last operation
  const undoLastOperation = async () => {
    if (!lastOperation || isProcessing) return;

    const confirmed = window.confirm(
      `Undo the last operation? This will ${lastOperation.enabled ? 'disable' : 'enable'} ${PLATFORM_CONFIGS[lastOperation.platform].name} for ${lastOperation.dishIds.length} dishes.`
    );
    
    if (!confirmed) return;

    // Reverse the operation
    await bulkTogglePlatform(lastOperation.platform, !lastOperation.enabled);
    setLastOperation(null);
  };

  const selectedCount = selectedDishes.size;
  const canUndo = lastOperation && !isProcessing && (Date.now() - lastOperation.timestamp < 300000); // 5 minutes

  return (
    <div className="space-y-4">
      {/* Bulk Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Dish Management</span>
            <div className="flex items-center gap-2">
              {operationStatus === 'processing' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              {operationStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {operationStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
              <Button
                variant={selectionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectionMode}
                disabled={isProcessing}
              >
                {selectionMode ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
                {selectionMode ? 'Exit Selection' : 'Bulk Select'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {selectionMode && (
          <CardContent className="pt-0">
            {/* Selection controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} disabled={isProcessing}>
                  Select All ({dishes.length})
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection} disabled={isProcessing}>
                  Clear
                </Button>
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              </div>

              {canUndo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoLastOperation}
                  disabled={isProcessing}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Undo Last
                </Button>
              )}
            </div>

            {/* Platform bulk controls */}
            {selectedCount > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-600">
                  Bulk Platform Controls ({selectedCount} dishes)
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => (
                    <div key={platform} className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs justify-start gap-1 text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => bulkTogglePlatform(platform as keyof PlatformAvailability, true)}
                        disabled={isProcessing}
                      >
                        <span>{config.icon}</span>
                        <Power className="w-3 h-3" />
                        <span>Enable {config.name}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs justify-start gap-1 text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => bulkTogglePlatform(platform as keyof PlatformAvailability, false)}
                        disabled={isProcessing}
                      >
                        <span>{config.icon}</span>
                        <PowerOff className="w-3 h-3" />
                        <span>Disable {config.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Progress indicator */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing bulk update...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">Bulk operations cannot be easily reversed</div>
                    <div>Make sure you want to update all selected dishes before proceeding.</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Dish Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            isSelected={selectedDishes.has(dish.id)}
            onSelectionChange={handleDishSelection}
            selectionMode={selectionMode}
            onDishUpdate={onDishUpdate}
          />
        ))}
      </div>

      {dishes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No dishes found. Add some dishes to get started.</p>
        </Card>
      )}
    </div>
  );
}

export default BulkDishManager;
