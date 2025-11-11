# Menu Management - Testing Guide

## 🧪 Test Scenarios

### 1. Category Chips Filtering

#### Test Case 1.1: Click "All" Chip
**Steps:**
1. Open Menu Management page
2. Click on any category chip (e.g., "Starters")
3. Verify items are filtered
4. Click "All" chip
**Expected:** All items should be visible again

#### Test Case 1.2: Category Chip Counter
**Steps:**
1. Note the counter on "Starters" chip
2. Switch to "Zomato" platform tab
3. Observe counter changes
**Expected:** Counter should reflect items available on selected platform

#### Test Case 1.3: Active Chip Styling
**Steps:**
1. Click "Main Course" chip
**Expected:** 
- Chip should have primary color background
- Badge should have white/transparent styling
- Other chips should be muted

---

### 2. Image Upload (Add Item)

#### Test Case 2.1: Upload Valid Image
**Steps:**
1. Click "Add Item" button
2. Click the upload dropzone
3. Select a PNG/JPG image < 5MB
**Expected:**
- Image preview appears
- X button visible in top-right
- Dropzone replaced with preview

#### Test Case 2.2: Upload Large Image
**Steps:**
1. Click "Add Item"
2. Try to upload image > 5MB
**Expected:**
- Toast error: "File Too Large"
- No preview shown
- Dropzone remains

#### Test Case 2.3: Remove Image
**Steps:**
1. Upload an image successfully
2. Click X button on preview
**Expected:**
- Preview disappears
- Dropzone returns
- Image data cleared

#### Test Case 2.4: Add Item with Image
**Steps:**
1. Fill item name: "Test Item"
2. Fill price: 100
3. Upload an image
4. Select category
5. Enable Restaurant platform
6. Click "Add Item"
**Expected:**
- Item added successfully
- Toast confirmation
- Dialog closes
- New item appears in grid with image

---

### 3. Image Upload (Edit Item)

#### Test Case 3.1: Edit Item Without Image
**Steps:**
1. Click "Edit" on item without image
2. Verify upload dropzone is shown
3. Upload an image
4. Click "Save Changes"
**Expected:**
- Image added to item
- Card now shows image at top

#### Test Case 3.2: Edit Item With Image
**Steps:**
1. Click "Edit" on item with image
2. Verify image preview is shown
3. Verify Upload and Trash buttons visible
**Expected:**
- Current image displayed
- Two action buttons in top-right

#### Test Case 3.3: Replace Image
**Steps:**
1. Edit item with image
2. Click Upload button (📤)
3. Select new image
**Expected:**
- Preview updates to new image
- Old image replaced

#### Test Case 3.4: Remove Image
**Steps:**
1. Edit item with image
2. Click Trash button (🗑️)
**Expected:**
- Image removed
- Dropzone appears
- Can upload new image if desired

---

### 4. Menu Card Display

#### Test Case 4.1: Card with Image
**Steps:**
1. View item with image
**Expected:**
- Image at top (3:2 ratio)
- Switch overlay on image (top-right)
- Item details below image
- No switch in header

#### Test Case 4.2: Card without Image
**Steps:**
1. View item without image
**Expected:**
- No image section
- Switch in header (right side)
- Standard card layout

#### Test Case 4.3: Image Aspect Ratio
**Steps:**
1. Upload various image sizes
2. View cards
**Expected:**
- All images maintain 3:2 ratio
- No distortion
- Object-cover applied

---

### 5. Platform Dependency Logic

#### Test Case 5.1: Disable Restaurant (Add Item)
**Steps:**
1. Click "Add Item"
2. Enable Restaurant
3. Enable Zomato and Swiggy
4. Disable Restaurant
**Expected:**
- Toast: "Restaurant disabled. All other platforms disabled."
- All platform switches OFF
- Cannot enable others

#### Test Case 5.2: Enable Platform Without Restaurant
**Steps:**
1. Click "Add Item"
2. Try to enable Zomato (Restaurant is OFF)
**Expected:**
- Toast error: "Restaurant Required"
- Zomato remains OFF
- Switch disabled visually

#### Test Case 5.3: Independent Platform Toggle
**Steps:**
1. Enable Restaurant
2. Enable Zomato
3. Enable Swiggy
4. Disable Zomato
**Expected:**
- Only Zomato disabled
- Restaurant and Swiggy remain ON
- No cascade effect

#### Test Case 5.4: Re-enable Restaurant
**Steps:**
1. Disable Restaurant (all platforms OFF)
2. Re-enable Restaurant
**Expected:**
- Only Restaurant enabled
- Other platforms remain OFF
- Must manually enable others

---

### 6. Platform Tabs & Filtering

#### Test Case 6.1: Platform Tab Counter
**Steps:**
1. Note counter on "Restaurant" tab
2. Add new item with Restaurant enabled
3. Check counter
**Expected:** Counter increments by 1

#### Test Case 6.2: Platform-Specific Items
**Steps:**
1. Create item enabled only for Restaurant
2. Switch to "Zomato" tab
**Expected:** Item not visible on Zomato tab

#### Test Case 6.3: Multi-Platform Item
**Steps:**
1. Create item enabled for Restaurant and Zomato
2. Switch between tabs
**Expected:** Item visible on both tabs

---

### 7. Combined Filtering

#### Test Case 7.1: Category + Platform
**Steps:**
1. Switch to "Zomato" tab
2. Click "Starters" category chip
**Expected:** Only starters available on Zomato shown

#### Test Case 7.2: Search + Category
**Steps:**
1. Click "Main Course" chip
2. Type "chicken" in search
**Expected:** Only main course items with "chicken" shown

#### Test Case 7.3: Clear All Filters
**Steps:**
1. Apply category filter
2. Type in search
3. Click "Clear filters" link
**Expected:**
- Search cleared
- Category reset to "All"
- All items for current platform shown

---

### 8. Form Validation

#### Test Case 8.1: Empty Name
**Steps:**
1. Click "Add Item"
2. Leave name empty
3. Fill price
4. Click "Add Item"
**Expected:**
- Toast error: "Item name is required"
- Dialog remains open

#### Test Case 8.2: Zero/Negative Price
**Steps:**
1. Fill name
2. Set price to 0 or negative
3. Click "Add Item"
**Expected:**
- Toast error: "Price must be greater than 0"
- Dialog remains open

#### Test Case 8.3: Valid Form
**Steps:**
1. Fill all required fields correctly
2. Click "Add Item"
**Expected:**
- Item added
- Toast success
- Dialog closes
- Form resets

---

### 9. Responsive Design

#### Test Case 9.1: Desktop View (1024px+)
**Expected:**
- 3 columns for cards
- All category chips in one row
- Platform tabs side-by-side

#### Test Case 9.2: Tablet View (768px)
**Expected:**
- 2 columns for cards
- Category chips wrap
- Platform tabs visible

#### Test Case 9.3: Mobile View (< 768px)
**Expected:**
- 1 column for cards
- Category chips stack
- Dialogs full-width
- Scrollable content

---

### 10. Animation & Transitions

#### Test Case 10.1: Card Entry Animation
**Steps:**
1. Switch platform tab
2. Observe cards appearing
**Expected:**
- Fade-in effect
- Slide from bottom
- Staggered timing (50ms each)

#### Test Case 10.2: Chip Hover
**Steps:**
1. Hover over category chip
**Expected:**
- Scale to 1.05
- Smooth transition
- Background color change

#### Test Case 10.3: Dialog Open/Close
**Steps:**
1. Open any dialog
2. Close dialog
**Expected:**
- Smooth fade in/out
- No jarring transitions

---

### 11. Edge Cases

#### Test Case 11.1: No Items in Category
**Steps:**
1. Create new category with no items
2. Click that category chip
**Expected:**
- Empty state shown
- "No items found" message
- Counter shows 0

#### Test Case 11.2: All Items Unavailable
**Steps:**
1. Toggle all items to unavailable
2. View cards
**Expected:**
- Cards shown with 60% opacity
- Switch in OFF state
- Still editable

#### Test Case 11.3: Very Long Item Name
**Steps:**
1. Create item with 100+ character name
**Expected:**
- Text wraps properly
- Card layout not broken
- Readable on all devices

#### Test Case 11.4: Special Characters in Search
**Steps:**
1. Search for: "Paneer & Tikka (Special)"
**Expected:**
- Search works correctly
- Special characters handled
- Results accurate

---

### 12. Data Persistence

#### Test Case 12.1: Edit and Save
**Steps:**
1. Edit item
2. Change image and name
3. Save
4. Refresh page (if applicable)
**Expected:**
- Changes persist
- Image retained
- All fields updated

#### Test Case 12.2: Cancel Edit
**Steps:**
1. Edit item
2. Upload new image
3. Click "Cancel"
4. Edit same item again
**Expected:**
- Original image shown
- No changes applied
- Preview state cleared

---

### 13. Performance Tests

#### Test Case 13.1: Large Image Upload
**Steps:**
1. Upload 4.9MB image
2. Observe loading time
**Expected:**
- Preview appears within 1-2 seconds
- No UI freeze
- Smooth experience

#### Test Case 13.2: Many Items
**Steps:**
1. Add 50+ items
2. Switch platforms
3. Filter by category
**Expected:**
- No lag in filtering
- Smooth animations
- Responsive UI

#### Test Case 13.3: Rapid Platform Switching
**Steps:**
1. Quickly switch between platform tabs
**Expected:**
- Counters update correctly
- Items filter properly
- No visual glitches

---

## 🎯 Acceptance Criteria Checklist

### Functional Requirements
- [x] Category chips filter items instantly
- [x] "All" chip resets category filter
- [x] Category chips show item counts
- [x] Image upload in Add Item dialog
- [x] Image preview with remove option
- [x] Image upload/replace in Edit Item dialog
- [x] Image remove option in Edit Item dialog
- [x] Images display on menu cards (3:2 ratio)
- [x] Restaurant platform dependency enforced
- [x] Independent platform toggling (after Restaurant)
- [x] Platform-specific item visibility
- [x] All existing features preserved

### UI/UX Requirements
- [x] SmartChef OS design theme maintained
- [x] ShadCN/UI components used throughout
- [x] Rounded corners (rounded-xl)
- [x] Smooth animations and transitions
- [x] Mobile responsive design
- [x] Consistent spacing and padding
- [x] Clear visual feedback (toasts)
- [x] Intuitive user flows

### Technical Requirements
- [x] TypeScript type-safe
- [x] No implicit any errors
- [x] Base64 image storage
- [x] 5MB file size limit
- [x] Image format validation
- [x] Reactive state management
- [x] Clean code structure
- [x] No external libraries added

---

## 🐛 Known Limitations

1. **Image Storage**: Base64 in state (not suitable for production at scale)
2. **File Size**: 5MB limit may be restrictive for high-res photos
3. **Image Editing**: No crop/resize functionality
4. **Offline Support**: No service worker/caching
5. **Accessibility**: Could be enhanced with ARIA labels

---

## 🚀 Testing Commands

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

---

## 📊 Test Coverage Summary

| Feature | Test Cases | Status |
|---------|-----------|--------|
| Category Chips | 3 | ✅ Ready |
| Image Upload (Add) | 4 | ✅ Ready |
| Image Upload (Edit) | 4 | ✅ Ready |
| Menu Card Display | 3 | ✅ Ready |
| Platform Logic | 4 | ✅ Ready |
| Platform Tabs | 3 | ✅ Ready |
| Combined Filtering | 3 | ✅ Ready |
| Form Validation | 3 | ✅ Ready |
| Responsive Design | 3 | ✅ Ready |
| Animations | 3 | ✅ Ready |
| Edge Cases | 4 | ✅ Ready |
| Data Persistence | 2 | ✅ Ready |
| Performance | 3 | ✅ Ready |

**Total Test Cases**: 42  
**Status**: All features implemented and ready for testing

---

## 📝 Testing Notes

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (test FileReader API)
- Mobile browsers: ✅ Test touch interactions

### Device Testing
- Desktop (1920x1080): Primary target
- Laptop (1366x768): Common resolution
- Tablet (768x1024): iPad size
- Mobile (375x667): iPhone size

### Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus indicators

---

## 🎓 User Acceptance Testing (UAT)

### Scenario 1: Restaurant Manager Adding New Dish
**Goal**: Add a new dish with image to all platforms

**Steps**:
1. Click "Add Item"
2. Enter dish name and price
3. Upload appetizing food photo
4. Write description
5. Select category
6. Enable Restaurant, Zomato, Swiggy
7. Add tags
8. Save

**Success Criteria**: Dish appears on all selected platforms with image

---

### Scenario 2: Quick Category Browsing
**Goal**: Browse different categories quickly

**Steps**:
1. Click "Starters" chip
2. Review items
3. Click "Main Course" chip
4. Review items
5. Click "All" to see everything

**Success Criteria**: Instant filtering, smooth transitions

---

### Scenario 3: Updating Dish Image
**Goal**: Replace old dish photo with new one

**Steps**:
1. Find dish with old photo
2. Click "Edit"
3. Click Upload button on image
4. Select new photo
5. Save changes

**Success Criteria**: New image appears on card immediately

---

## ✅ Final Checklist Before Deployment

- [ ] All test cases passed
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Responsive on all devices
- [ ] Images load properly
- [ ] Platform logic works correctly
- [ ] Category filtering instant
- [ ] Animations smooth
- [ ] Toast notifications clear
- [ ] Form validation working
- [ ] Data persists correctly
- [ ] Performance acceptable
- [ ] Code reviewed
- [ ] Documentation complete
