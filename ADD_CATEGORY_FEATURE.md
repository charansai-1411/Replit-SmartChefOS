# Add Category Feature - Documentation

## Overview
The Add Category feature allows restaurant managers to create custom categories in addition to the default categories provided by SmartChef OS.

## ✅ Features Implemented

### 1. Default Categories
The system comes with 6 pre-configured categories:

1. **Starters**
   - Description: Appetizers and starters
   - Sub Categories: Veg Starters, Non-Veg Starters

2. **Main Course**
   - Description: Main dishes
   - Sub Categories: Veg Main Course, Non-Veg Main Course

3. **Breads**
   - Description: Indian breads and rotis
   - Sub Categories: Tandoori Breads, Stuffed Breads

4. **Rice & Biryani**
   - Description: Rice dishes and biryanis
   - Sub Categories: Veg Rice, Non-Veg Biryani

5. **Desserts**
   - Description: Sweet dishes and desserts
   - Sub Categories: Indian Sweets, Ice Creams

6. **Beverages**
   - Description: Drinks and beverages
   - Sub Categories: Hot Beverages, Cold Beverages, Fresh Juices

### 2. Add Custom Category Dialog

#### Access
Click the **"Add Category"** button in the top-right corner of the Menu Management page.

#### Form Fields

**Category Name** (Required)
- Text input for the category name
- Examples: "Appetizers", "Soups", "Salads", "Chinese", "Continental"
- Validation: Cannot be empty
- Validation: Cannot duplicate existing category names

**Description** (Optional)
- Textarea for category description
- Brief explanation of what items belong in this category
- Example: "Light and healthy salad options"

**Sub Categories** (Dynamic)
- Add multiple sub-categories to organize items
- Each sub-category has its own input field
- Click "Add Sub Category" to add more fields
- Click trash icon to remove a sub-category
- Minimum: 1 sub-category field (cannot remove the last one)
- Examples: "Veg", "Non-Veg", "Gluten-Free", "Dairy-Free"

### 3. Dialog Layout

```
┌─────────────────────────────────────────────────┐
│ Add New Category                                │
│ Create a new category for organizing menu items │
├─────────────────────────────────────────────────┤
│                                                  │
│ Category Name *                                  │
│ [e.g., Appetizers, Soups, Salads]               │
│                                                  │
│ Description                                      │
│ [Brief description of this category]            │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ Sub Categories              [+ Add Sub Category]│
│ Add sub-categories to organize items            │
│                                                  │
│ [Sub category 1 (e.g., Veg, Non-Veg)]     [🗑]  │
│ [Sub category 2 (e.g., Veg, Non-Veg)]     [🗑]  │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ ℹ️ Default Categories Available                 │
│ [Starters] [Main Course] [Breads]               │
│ [Rice & Biryani] [Desserts] [Beverages]         │
│                                                  │
│                              [Cancel] [Add Category]│
└─────────────────────────────────────────────────┘
```

### 4. Validation Rules

#### Category Name
- ✅ Required field
- ✅ Cannot be empty or whitespace only
- ✅ Must be unique (case-insensitive check)
- ❌ Error: "Category name is required."
- ❌ Error: "A category with this name already exists."

#### Sub Categories
- ✅ Empty sub-categories are filtered out when saving
- ✅ At least one sub-category field must exist in the form
- ✅ Can have multiple sub-categories
- ✅ Sub-categories are trimmed of whitespace

### 5. User Workflow

#### Adding a New Category

**Step 1: Open Dialog**
- Click "Add Category" button
- Dialog opens with empty form

**Step 2: Enter Category Details**
- Type category name (e.g., "Soups")
- Optionally add description (e.g., "Hot and cold soup varieties")

**Step 3: Add Sub Categories**
- First sub-category field is already present
- Fill in first sub-category (e.g., "Veg Soups")
- Click "+ Add Sub Category" to add more
- Fill in additional sub-categories (e.g., "Non-Veg Soups", "Cream Soups")
- Remove unwanted sub-categories by clicking trash icon

**Step 4: Review Existing Categories**
- Check the "Default Categories Available" section
- Ensure your new category name doesn't duplicate existing ones

**Step 5: Save**
- Click "Add Category" button
- Validation runs automatically
- If valid: Category is added, dialog closes, success toast appears
- If invalid: Error toast appears with specific message

**Step 6: Verify**
- New category appears in category dropdown
- Can now create menu items in this category
- Category filter shows the new category

### 6. Success & Error Messages

#### Success
```
✅ Category Added
Soups has been added successfully.
```

#### Validation Errors
```
❌ Validation Error
Category name is required.

❌ Category Exists
A category with this name already exists.
```

### 7. Technical Implementation

#### State Management
```typescript
const [newCategory, setNewCategory] = useState({
  name: "",
  description: "",
  subCategories: [""],
});
```

#### Handler Functions

**Add Category**
```typescript
const handleAddCategory = () => {
  // Validate name
  // Check for duplicates
  // Create subcategories
  // Add to categories array
  // Reset form
  // Show success toast
};
```

**Add Sub Category Field**
```typescript
const addSubCategoryField = () => {
  setNewCategory({
    ...newCategory,
    subCategories: [...newCategory.subCategories, ""],
  });
};
```

**Update Sub Category**
```typescript
const updateSubCategory = (index: number, value: string) => {
  const updated = [...newCategory.subCategories];
  updated[index] = value;
  setNewCategory({ ...newCategory, subCategories: updated });
};
```

**Remove Sub Category**
```typescript
const removeSubCategory = (index: number) => {
  if (newCategory.subCategories.length > 1) {
    setNewCategory({
      ...newCategory,
      subCategories: newCategory.subCategories.filter((_, i) => i !== index),
    });
  }
};
```

### 8. Category Object Structure

```typescript
interface Category {
  id: string;                    // Unique ID (timestamp)
  name: string;                  // Category name
  description: string;           // Category description
  isAvailable: boolean;          // Always true for new categories
  subCategories: SubCategory[];  // Array of sub-categories
  platforms: MenuPlatform[];     // All platforms by default
  timing?: CategoryTiming;       // Optional timing
  daySchedule?: string[];        // Optional day schedule
}

interface SubCategory {
  id: string;                    // Unique ID
  name: string;                  // Sub-category name
  isAvailable: boolean;          // Always true for new sub-categories
  timing?: CategoryTiming;       // Optional timing
}
```

### 9. Integration with Menu Items

**When Adding Items:**
- New custom categories appear in the category dropdown
- Selecting a custom category shows its sub-categories
- Items can be assigned to custom categories just like default ones

**When Filtering:**
- Custom categories appear in the filter dropdown
- Filtering by custom category works the same as default categories
- Search works across items in custom categories

### 10. Platform Availability

**Default Behavior:**
- All new categories are available on all platforms by default
  - Restaurant
  - Zomato
  - Swiggy
  - Other

**Future Enhancement:**
- Could add platform selection in Add Category dialog
- Could allow per-category platform control

### 11. Example Use Cases

#### Example 1: Adding "Soups" Category
```
Category Name: Soups
Description: Hot and cold soup varieties
Sub Categories:
  - Veg Soups
  - Non-Veg Soups
  - Cream Soups
```

#### Example 2: Adding "Chinese" Category
```
Category Name: Chinese
Description: Chinese cuisine items
Sub Categories:
  - Veg Chinese
  - Non-Veg Chinese
  - Noodles
  - Fried Rice
```

#### Example 3: Adding "Healthy Options" Category
```
Category Name: Healthy Options
Description: Low-calorie and nutritious dishes
Sub Categories:
  - Salads
  - Grilled Items
  - Gluten-Free
  - Vegan
```

### 12. UI/UX Features

**Visual Design:**
- ✅ Rounded-xl borders throughout
- ✅ Consistent spacing and padding
- ✅ Same color scheme as rest of application
- ✅ Clear section separators
- ✅ Helpful placeholder text
- ✅ Icon indicators (Info icon, Plus icon, Trash icon)

**User Feedback:**
- ✅ Toast notifications for success/error
- ✅ Real-time validation
- ✅ Clear error messages
- ✅ Visual display of existing categories
- ✅ Disabled state for remove button when only one sub-category

**Accessibility:**
- ✅ Proper labels for all inputs
- ✅ Descriptive placeholders
- ✅ Helper text for complex fields
- ✅ Keyboard navigation support
- ✅ Clear button labels

### 13. Data Persistence

**Current Implementation:**
- Categories stored in React state
- Persists during current session
- Lost on page reload

**Future Enhancement:**
- Save to database (Firebase/backend)
- Persist across sessions
- Sync across devices
- Allow editing/deleting categories

### 14. Limitations & Future Enhancements

**Current Limitations:**
- Cannot edit existing categories
- Cannot delete categories
- Cannot reorder categories
- No category icons/images
- No category-level pricing rules

**Potential Enhancements:**
1. Edit category functionality
2. Delete category (with item reassignment)
3. Drag-and-drop category reordering
4. Category icons/images
5. Category-level discounts
6. Category availability scheduling
7. Category-specific tax rates
8. Import/export categories
9. Category templates
10. Category analytics

## Summary

✅ 6 default categories provided out of the box
✅ Add custom categories with name and description
✅ Dynamic sub-category management
✅ Validation prevents duplicates and empty names
✅ Visual display of all existing categories
✅ Seamless integration with menu items
✅ Consistent UI/UX with SmartChef OS theme
✅ Real-time updates without page reload
✅ Toast notifications for user feedback

The Add Category feature provides flexibility for restaurant managers to organize their menu exactly how they want, while maintaining a solid foundation of default categories for quick setup.
