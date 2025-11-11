# Quick Start Guide - Platform-Specific Availability

## What's New?

### 🎯 Independent Platform Availability Control
You can now turn off menu items on specific platforms (like Zomato) without affecting other platforms (like Swiggy).

## How to Use

### 1. **Adding a Menu Item with Image**

1. Click **"Add Item"** button in Menu Management
2. Fill in item details (name, price, category, etc.)
3. **Upload Image**:
   - Click the upload area
   - Select image (PNG, JPG, WEBP - max 5MB)
   - Preview appears immediately
4. Select platforms to add the item to
5. Click **"Add Item"**

### 2. **Toggling Platform-Specific Availability**

#### From Menu Item Card:
1. Find your menu item in the list
2. Scroll to **"Platform Availability"** section
3. You'll see 4 platforms with toggles:
   - 🔵 **Restaurant** (in-house)
   - 🔴 **Zomato**
   - 🟠 **Swiggy**
   - 🟣 **Other**
4. Toggle any platform ON/OFF independently
5. Changes are instant!

#### From Edit Dialog:
1. Click **"Edit"** on any menu item
2. Scroll to **"Platform-Specific Availability"** section
3. Toggle availability for each platform
4. Click **"Save Changes"**

### 3. **Example Scenarios**

#### Scenario 1: Out of Stock on Zomato Only
```
Problem: Paneer Tikka is out of stock, but only for Zomato orders
Solution: 
1. Find "Paneer Tikka" in menu
2. Toggle OFF the Zomato switch
3. Swiggy and Restaurant remain ON
```

#### Scenario 2: Special Item for Restaurant Only
```
Problem: "Chef's Special" should only be available in-house
Solution:
1. Edit "Chef's Special"
2. Keep Restaurant toggle ON
3. Turn OFF Zomato, Swiggy, and Other
```

#### Scenario 3: Temporarily Disable on All Delivery Platforms
```
Problem: Item available in restaurant but not for delivery
Solution:
1. Edit the item
2. Keep Restaurant toggle ON
3. Turn OFF Zomato, Swiggy, and Other
```

## Visual Guide

### Menu Item Card Layout
```
┌─────────────────────────────────────┐
│  [Image]                            │
│  Paneer Tikka                   [✓] │ ← Overall availability
│  Grilled cottage cheese...          │
│  ₹250                    GST 5%     │
│                                      │
│  Platform Availability               │
│  ┌──────────────┬──────────────┐   │
│  │ 🔵 Restaurant │     [ON]     │   │ ← Independent toggle
│  │ 🔴 Zomato     │     [OFF]    │   │ ← Can be OFF while others ON
│  │ 🟠 Swiggy     │     [ON]     │   │
│  │ 🟣 Other      │  Not added   │   │
│  └──────────────┴──────────────┘   │
│                                      │
│  [Edit]  [Delete]                   │
└─────────────────────────────────────┘
```

### Color Coding
- **Blue Border** = Active on Restaurant
- **Red Border** = Active on Zomato
- **Orange Border** = Active on Swiggy
- **Purple Border** = Active on Other
- **Gray Border** = Not available or not on platform

## Key Features

### ✅ What You Can Do:
- Upload and store images for menu items
- View images in Order Line
- Toggle availability per platform independently
- Turn off Zomato without affecting Swiggy
- Turn off Swiggy without affecting Zomato
- Manage restaurant availability separately

### ❌ What's Different from Before:
- **Before**: Turning off an item affected all platforms
- **After**: Each platform has its own availability toggle

## Tips & Best Practices

1. **Image Size**: Keep images under 5MB for best performance
2. **Image Quality**: Use clear, well-lit photos of dishes
3. **Regular Updates**: Update availability in real-time as stock changes
4. **Platform Strategy**: Use different availability for different platforms based on:
   - Delivery capacity
   - Stock levels
   - Platform-specific promotions
   - Preparation time constraints

## Troubleshooting

### Q: Image not showing?
**A**: Check that:
- Image is under 5MB
- Format is PNG, JPG, or WEBP
- Image uploaded successfully (preview shown)

### Q: Toggle not working?
**A**: Ensure:
- Item is added to that platform first
- You're not trying to toggle a platform the item isn't on

### Q: Changes not saving?
**A**: Currently using local state (sample data). Backend integration coming soon.

## What's Next?

The current implementation uses local state for demonstration. To persist data:
1. Backend API integration needed
2. Database storage for images and availability flags
3. Real-time sync across platforms

## Need Help?

Check the detailed implementation document: `MENU_PLATFORM_AVAILABILITY_IMPLEMENTATION.md`
