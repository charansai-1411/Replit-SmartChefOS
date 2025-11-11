# Menu Management - Feature Highlights

## 🎯 Key Features Overview

### 1. Category Chips (Quick Filter)
```
┌─────────────────────────────────────────────────────────┐
│  [All (12)] [Starters (4)] [Main Course (3)] [Breads (2)] │
│  [Rice & Biryani (1)] [Desserts (1)] [Beverages (1)]      │
└─────────────────────────────────────────────────────────┘
```
- **Location**: Below search bar
- **Behavior**: Single click to filter
- **Visual**: Active chip highlighted, shows item count
- **Animation**: Scale on hover, smooth transitions

---

### 2. Image Upload System

#### Add Item Dialog
```
┌─────────────────────────────────┐
│  Item Name: [Paneer Tikka    ]  │
│  Price: [₹250               ]   │
│                                  │
│  ┌──────────────────────────┐   │
│  │      📤 Upload Icon      │   │
│  │  Click to upload or drag │   │
│  │  PNG, JPG, WEBP (5MB)    │   │
│  └──────────────────────────┘   │
│                                  │
│  Description: [...]              │
└─────────────────────────────────┘
```

#### With Image Preview
```
┌─────────────────────────────────┐
│  ┌──────────────────────────┐   │
│  │   [Image Preview]    [X] │   │
│  │                          │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

#### Edit Item Dialog (With Image)
```
┌─────────────────────────────────┐
│  ┌──────────────────────────┐   │
│  │   [Image Preview]        │   │
│  │              [📤] [🗑️]   │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```
- **📤 Upload**: Replace image
- **🗑️ Trash**: Remove image

---

### 3. Menu Cards with Images

#### Card with Image
```
┌───────────────────────────┐
│ ┌─────────────────────┐   │
│ │   [Food Image]  [⚡] │   │ ← Switch overlay
│ └─────────────────────┘   │
│                           │
│ 🟢 Paneer Tikka          │
│ Grilled cottage cheese... │
│                           │
│ ₹250        GST 5%       │
│ [Spicy] [Popular]        │
│                           │
│ 🍽️ Starters → Veg       │
│ ⏱️ 15 mins               │
│                           │
│ [Edit] [Delete]          │
│ 🍽️ ✓  📦 ✓  🚚 ✓  ⋮    │ ← Platform badges
└───────────────────────────┘
```

#### Card without Image
```
┌───────────────────────────┐
│ 🟢 Dal Makhani      [⚡]  │ ← Switch in header
│ Creamy black lentils...   │
│                           │
│ ₹280        GST 5%       │
│ [Popular] [Comfort Food]  │
│                           │
│ [Edit] [Delete]          │
│ 🍽️ ✓  📦 ✓  🚚 ✓  ⋮ ✓  │
└───────────────────────────┘
```

---

### 4. Platform Dependency Logic

#### Rule Flow
```
┌─────────────────────────────────────────┐
│  Restaurant Platform (Master Switch)     │
└─────────────────────────────────────────┘
              │
              ├─ OFF → All platforms disabled
              │
              └─ ON → Can enable others
                      │
                      ├─ Zomato (Independent)
                      ├─ Swiggy (Independent)
                      └─ Other (Independent)
```

#### Platform Toggle UI
```
┌─────────────────────────────────────────┐
│ 🍽️ Restaurant                      [ON] │
│    Primary platform (required)          │
├─────────────────────────────────────────┤
│ 📦 Zomato                          [ON] │
├─────────────────────────────────────────┤
│ 🚚 Swiggy                         [OFF] │
├─────────────────────────────────────────┤
│ ⋮ Other                           [OFF] │
└─────────────────────────────────────────┘
```

#### Disabled State (Restaurant OFF)
```
┌─────────────────────────────────────────┐
│ 🍽️ Restaurant                     [OFF] │
│    Primary platform (required)          │
├─────────────────────────────────────────┤
│ 📦 Zomato                         [OFF] │
│    Enable Restaurant first        ⚠️    │
├─────────────────────────────────────────┤
│ 🚚 Swiggy                         [OFF] │
│    Enable Restaurant first        ⚠️    │
└─────────────────────────────────────────┘
```

---

### 5. Platform Tabs with Counters
```
┌──────────────────────────────────────────────────────┐
│ [🍽️ Restaurant (12)] [📦 Zomato (8)]                │
│ [🚚 Swiggy (6)] [⋮ Other (4)]                       │
└──────────────────────────────────────────────────────┘
```
- **Active Tab**: Full color, shadow, scaled
- **Inactive Tab**: Muted, hover effect
- **Counter**: Shows items available on that platform

---

## 🎨 Design Tokens

### Colors
- **Primary**: Blue (Restaurant)
- **Red**: Zomato
- **Orange**: Swiggy
- **Purple**: Other platforms
- **Green**: Veg indicator
- **Red**: Non-veg indicator

### Spacing
- **Card Gap**: 1rem (16px)
- **Chip Gap**: 0.5rem (8px)
- **Padding**: Consistent `p-3` to `p-6`

### Borders
- **Radius**: `rounded-xl` (0.75rem)
- **Chips**: `rounded-full`
- **Cards**: `rounded-xl` with shadow

### Animations
- **Fade In**: 200ms ease
- **Scale**: 1.05 on active/hover
- **Stagger**: 50ms delay per card

---

## 🔄 User Flows

### Adding Item with Image
1. Click "Add Item"
2. Enter name & price
3. Click upload dropzone
4. Select image (validates size)
5. Preview appears with X button
6. Fill other fields
7. Enable platforms (Restaurant first)
8. Click "Add Item"

### Editing Item Image
1. Click "Edit" on card
2. See current image (if exists)
3. Options:
   - Click Upload icon → Replace
   - Click Trash icon → Remove
   - No image → Click dropzone to add
4. Save changes

### Filtering by Category
1. Click category chip
2. View updates instantly
3. Counter shows filtered count
4. Click "All" to reset

### Managing Platforms
1. Open Add/Edit dialog
2. Toggle Restaurant first
3. Then toggle other platforms
4. Toast guides if rules violated
5. Save item

---

## 📱 Responsive Behavior

### Desktop (lg: 1024px+)
- 3 columns for menu cards
- Full category chips row
- All platform tabs visible

### Tablet (md: 768px+)
- 2 columns for menu cards
- Category chips wrap
- Platform tabs visible

### Mobile (< 768px)
- 1 column for menu cards
- Category chips stack
- Platform tabs scroll
- Dialogs full-width with scroll

---

## ✨ Animations & Transitions

### Card Entry
```css
animate-in fade-in slide-in-from-bottom-4 duration-300
animationDelay: ${index * 50}ms
```

### Chip Interaction
```css
transition-all
hover:scale-105
active:scale-105 shadow-md
```

### Image Upload
```css
hover:border-primary/50
hover:bg-muted/50
transition-all
```

### Platform Toggle
```css
border-primary bg-primary/5 (active)
opacity-50 (disabled)
transition-all
```

---

## 🛡️ Validation & Error Handling

### Image Upload
- ✅ Max 5MB file size
- ✅ Image formats: PNG, JPG, WEBP
- ✅ Base64 conversion
- ❌ Toast error if too large

### Platform Rules
- ✅ Restaurant required first
- ✅ Independent toggle after
- ❌ Toast error if rule violated

### Form Validation
- ✅ Name required
- ✅ Price > 0
- ✅ Category selection
- ❌ Toast errors for invalid data

---

## 🎯 Performance Considerations

### Image Handling
- Base64 storage (demo/prototype)
- 5MB limit prevents memory issues
- Preview state separate from item state
- Clean up on dialog close

### Filtering
- Client-side filtering (fast)
- Reactive updates
- No API calls needed

### Animations
- CSS-based (GPU accelerated)
- Staggered delays prevent jank
- Smooth 60fps transitions

---

## 🔮 Future Enhancements (Optional)

### Image Features
- [ ] Cloud storage (S3, Cloudinary)
- [ ] Image cropping/editing
- [ ] Multiple images per item
- [ ] Drag-and-drop reordering

### Platform Features
- [ ] Platform-specific pricing
- [ ] Platform-specific descriptions
- [ ] Bulk platform operations
- [ ] Platform sync status

### Category Features
- [ ] Drag-and-drop reordering
- [ ] Category icons
- [ ] Category colors
- [ ] Nested categories

### UI Enhancements
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Bulk edit mode
- [ ] Export/Import menu

---

## 📚 Component Structure

```
MenuManagement
├── State Management
│   ├── menuItems (array)
│   ├── categories (array)
│   ├── newItem (object)
│   ├── editingItem (object)
│   ├── newItemImagePreview (string)
│   └── editItemImagePreview (string)
│
├── Functions
│   ├── handleAddItem()
│   ├── handleEditItem()
│   ├── handleImageUpload()
│   ├── removeImage()
│   ├── togglePlatformForNewItem()
│   └── togglePlatformForEditItem()
│
├── UI Components
│   ├── Header (Title + Action Buttons)
│   ├── Platform Tabs
│   ├── Search Bar
│   ├── Category Chips (NEW)
│   ├── Menu Cards Grid
│   │   ├── Image (NEW)
│   │   ├── Header
│   │   ├── Content
│   │   └── Platform Badges
│   ├── Add Item Dialog
│   │   └── Image Upload (NEW)
│   ├── Edit Item Dialog
│   │   └── Image Edit/Remove (NEW)
│   ├── Add Category Dialog
│   └── Manage Charges Dialog
│
└── Utilities
    ├── filteredItems (computed)
    ├── platformIcons (object)
    └── platformColors (object)
```
