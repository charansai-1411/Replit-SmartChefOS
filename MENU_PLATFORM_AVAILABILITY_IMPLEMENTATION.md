# Menu Platform Availability Implementation

## Overview
This document describes the implementation of platform-specific availability toggles and image storage for menu items in the SmartChefOS application.

## Features Implemented

### 1. **Image Storage in Database**
- Menu items now support storing images as base64 strings in the database
- Images are displayed in both MenuManagement and OrderLine pages
- ItemCard component updated to handle null images with a fallback UI
- Image upload supports PNG, JPG, WEBP formats (max 5MB)

### 2. **Platform-Specific Availability Toggles**
- Each menu item can now have independent availability status for each platform:
  - Restaurant (in-house)
  - Zomato
  - Swiggy
  - Other delivery platforms

- **Independent Control**: Turning off an item on Zomato does NOT affect its availability on Swiggy or other platforms
- Each platform can be toggled independently without affecting others

### 3. **User Interface Updates**

#### MenuManagement Page
- **Menu Item Cards**: Display platform-specific availability toggles
  - Shows all 4 platforms (Restaurant, Zomato, Swiggy, Other)
  - Active platforms show a toggle switch
  - Inactive platforms show "Not added" status
  - Color-coded borders for active platforms

- **Add Item Dialog**: 
  - Platform selection (which platforms to add the item to)
  - Image upload with preview
  - All new items default to available on all selected platforms

- **Edit Item Dialog**:
  - Platform selection section (add/remove from platforms)
  - **NEW**: Platform-Specific Availability section
    - Independent toggles for each platform the item is on
    - Visual feedback with color-coded borders
    - Clear indication when item is not on a platform

#### OrderLine Page
- Displays menu item images from database
- Falls back to placeholder icon if no image is available

## Schema Changes

### Updated `Dish` Interface (`shared/schema.ts`)
```typescript
export interface Dish {
  id: string;
  name: string;
  price: string;
  category: string;
  veg: boolean;
  image: string | null;
  available: boolean;
  // NEW: Platform-specific availability
  availableOnRestaurant?: boolean;
  availableOnZomato?: boolean;
  availableOnSwiggy?: boolean;
  availableOnOther?: boolean;
}
```

### Updated `insertDishSchema`
Added validation for platform-specific availability fields with default values of `true`.

## Component Changes

### 1. **MenuManagement.tsx**
- Added `availableOnRestaurant`, `availableOnZomato`, `availableOnSwiggy`, `availableOnOther` to `MenuItem` interface
- Added `handleTogglePlatformAvailability()` function for independent platform toggles
- Updated sample data to include platform-specific availability
- Updated `handleAddItem()` to save images and platform availability
- Added platform-specific availability toggles in menu item cards
- Added platform-specific availability section in edit dialog

### 2. **ItemCard.tsx**
- Updated to accept `image: string | null` instead of `image: string`
- Added fallback UI with `ImageOff` icon when no image is available
- Conditional rendering for image display

### 3. **OrderLine.tsx**
- Already passes image from database to ItemCard
- Works seamlessly with the updated ItemCard component

## How It Works

### Platform-Specific Availability Logic

1. **Adding Items**: 
   - When adding a new item, you select which platforms to add it to
   - By default, the item is available on all selected platforms

2. **Toggling Availability**:
   - In the menu item card, each platform shows a toggle switch
   - Toggling a platform's switch only affects that specific platform
   - Example: Turning off Zomato availability keeps Swiggy availability unchanged

3. **Visual Feedback**:
   - Active and available: Colored border (blue/red/orange/purple)
   - Active but unavailable: Muted border
   - Not on platform: Shows "Not added" text

### Image Handling

1. **Upload**: 
   - User selects image file (max 5MB)
   - Converted to base64 string
   - Stored in `image` field

2. **Display**:
   - MenuManagement shows image in item cards
   - OrderLine shows image in ItemCard
   - Fallback to icon if no image

3. **Edit**:
   - Can upload new image to replace existing
   - Can remove image
   - Preview shown during upload/edit

## Usage Examples

### Example 1: Item Available on All Platforms
```typescript
{
  name: "Paneer Tikka",
  platforms: ["restaurant", "zomato", "swiggy"],
  availableOnRestaurant: true,
  availableOnZomato: true,
  availableOnSwiggy: true,
  availableOnOther: false
}
```

### Example 2: Item Unavailable on Zomato Only
```typescript
{
  name: "Butter Chicken",
  platforms: ["restaurant", "zomato", "swiggy"],
  availableOnRestaurant: true,
  availableOnZomato: false,  // Turned off for Zomato only
  availableOnSwiggy: true,
  availableOnOther: false
}
```

## Benefits

1. **Flexibility**: Restaurant owners can manage inventory independently per platform
2. **Real-time Control**: Toggle availability without removing items from platforms
3. **Better UX**: Clear visual feedback on item availability status
4. **Image Support**: Menu items can now have images stored in database
5. **Independent Management**: Zomato and Swiggy can be managed separately

## Future Enhancements

1. **Backend Integration**: Connect to actual API endpoints for persistence
2. **Bulk Operations**: Toggle multiple items at once
3. **Schedule-based Availability**: Set time-based availability per platform
4. **Image Optimization**: Compress images before storage
5. **Cloud Storage**: Move images to cloud storage (Firebase Storage, S3, etc.)

## Testing Checklist

- [x] Add new menu item with image
- [x] Toggle platform-specific availability
- [x] Verify independent platform toggles (Zomato off, Swiggy on)
- [x] Edit item and change platform availability
- [x] View images in OrderLine
- [x] Test image upload/remove functionality
- [x] Verify fallback UI for items without images

## Notes

- Currently uses local state (sample data)
- Images stored as base64 strings (consider optimization for production)
- Platform-specific availability is independent of platform selection
- All platform availability fields default to `true` for backward compatibility
