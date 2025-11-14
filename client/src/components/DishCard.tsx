import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Power, 
  PowerOff, 
  Image as ImageIcon, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

interface DishCardProps {
  dish: DishData;
  isSelected?: boolean;
  onSelectionChange?: (dishId: string, selected: boolean) => void;
  selectionMode?: boolean;
  onDishUpdate?: (dishId: string, updates: Partial<DishData>) => void;
}

const PLATFORM_CONFIGS = {
  restaurant: { 
    name: 'Restaurant', 
    color: 'bg-blue-500', 
    icon: '🏪',
    description: 'Direct restaurant orders'
  },
  zomato: { 
    name: 'Zomato', 
    color: 'bg-red-500', 
    icon: '🍕',
    description: 'Zomato delivery platform'
  },
  swiggy: { 
    name: 'Swiggy', 
    color: 'bg-orange-500', 
    icon: '🛵',
    description: 'Swiggy delivery platform'
  },
  other: { 
    name: 'Other', 
    color: 'bg-gray-500', 
    icon: '📱',
    description: 'Other delivery platforms'
  }
} as const;

export function DishCard({ 
  dish, 
  isSelected = false, 
  onSelectionChange, 
  selectionMode = false,
  onDishUpdate 
}: DishCardProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [updatingPlatform, setUpdatingPlatform] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Format price from minor units to display
  const formatPrice = (priceMinor: number) => {
    return `₹${(priceMinor / 100).toFixed(2)}`;
  };

  // Toggle platform availability
  const handlePlatformToggle = async (platform: keyof PlatformAvailability) => {
    if (updatingPlatform) return;
    
    setUpdatingPlatform(platform);
    
    try {
      const newAvailability = {
        ...dish.availability,
        [platform]: !dish.availability[platform]
      };

      // Update Firestore using v9 modular SDK
      const dishRef = doc(db, 'dishes', dish.id);
      await updateDoc(dishRef, {
        availability: newAvailability,
        updatedAt: new Date()
      });

      // Update local state
      onDishUpdate?.(dish.id, { availability: newAvailability });

      toast({
        title: "Platform Updated",
        description: `${PLATFORM_CONFIGS[platform].name} ${newAvailability[platform] ? 'enabled' : 'disabled'} for ${dish.name}`,
      });
    } catch (error) {
      console.error('Error updating platform availability:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update platform availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingPlatform(null);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create storage reference with timestamp for uniqueness
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `restaurants/${dish.restaurantId}/dishes/${dish.id}/${fileName}`);

      // Start resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast({
            title: "Upload Failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive"
          });
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update Firestore with new image URL
            const dishRef = doc(db, 'dishes', dish.id);
            await updateDoc(dishRef, {
              images: arrayUnion(downloadURL),
              updatedAt: new Date()
            });

            // Update local state
            const newImages = [...(dish.images || []), downloadURL];
            onDishUpdate?.(dish.id, { images: newImages });

            toast({
              title: "Image Uploaded",
              description: "Image successfully added to dish.",
            });
          } catch (error) {
            console.error('Error saving image URL:', error);
            toast({
              title: "Save Failed",
              description: "Image uploaded but failed to save URL. Please try again.",
              variant: "destructive"
            });
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Upload initialization error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to start upload. Please try again.",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input value to allow re-uploading same file
    event.target.value = '';
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-blue-500 bg-blue-50",
      selectionMode && "cursor-pointer"
    )}>
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(dish.id, !!checked)}
            className="bg-white shadow-sm"
          />
        </div>
      )}

      {/* Dish image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {dish.images && dish.images.length > 0 ? (
          <img 
            src={dish.images[0]} 
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        
        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="mb-2">Uploading...</div>
              <Progress value={uploadProgress} className="w-32" />
              <div className="text-sm mt-1">{Math.round(uploadProgress)}%</div>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Dish info */}
        <div className="mb-3">
          <h3 className="font-medium text-sm mb-1 line-clamp-2">{dish.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatPrice(dish.priceMinor)}</span>
            <Badge variant="secondary" className="text-xs">
              {dish.category}
            </Badge>
          </div>
        </div>

        {/* Platform toggles */}
        <div className="space-y-2 mb-3">
          <div className="text-xs font-medium text-gray-600 mb-1">Platform Availability</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
              const isAvailable = dish.availability[platform as keyof PlatformAvailability];
              const isUpdating = updatingPlatform === platform;
              
              return (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs justify-start gap-1 transition-all",
                    isAvailable && "bg-green-50 border-green-200 text-green-700",
                    !isAvailable && "bg-red-50 border-red-200 text-red-700"
                  )}
                  onClick={() => handlePlatformToggle(platform as keyof PlatformAvailability)}
                  disabled={isUpdating || selectionMode}
                  title={config.description}
                >
                  <span className="text-xs">{config.icon}</span>
                  {isAvailable ? (
                    <Power className="w-3 h-3" />
                  ) : (
                    <PowerOff className="w-3 h-3" />
                  )}
                  <span className="truncate">{config.name}</span>
                  {isUpdating && (
                    <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Image upload button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || selectionMode}
        >
          <Upload className="w-3 h-3 mr-1" />
          {uploading ? 'Uploading...' : 'Add Image'}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Image count indicator */}
        {dish.images && dish.images.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 text-center">
            {dish.images.length} image{dish.images.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DishCard;
