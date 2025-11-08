# SmartChef OS - Design Guidelines

## Design Theme
**Earthy & Organic** aesthetic with warm, welcoming tones that evoke natural, artisanal restaurant culture. Based on reference images 4-6 provided.

## Color Palette
```
Brand Colors:
- Primary: #6FA59C (sage green)
- Accent: #E29578 (clay/terracotta)
- Ink: #23302B (dark text)

Surface Colors:
- Surface: #F6F4F2 (warm off-white background)
- Card: #FFFFFF (white cards)
- Success: #2E7D32
- Warning: #C77800
- Danger: #C0392B
```

## Typography
- **Primary Font**: Inter (UI elements, body text)
- **Numbers**: Tabular Numbers variant for statistics, prices, totals
- **Body**: `text-brand-ink` on `bg-surface`

## Spacing & Shape
- **Border Radius**: 
  - Large cards/panels: 24px (`rounded-2xl`)
  - Buttons/chips: 16px (`rounded-xl`)
  - Pills/badges: Full rounded (`rounded-full`)
- **Shadows**: Soft, subtle shadows (`shadow-sm`, `shadow-md`) - avoid harsh edges
- **Spacing**: Generous padding (p-4 to p-6 on cards), breathing room between sections

## Component Design Patterns

### Buttons
- **Primary**: `bg-brand-primary text-white rounded-xl px-5 py-3 shadow-sm hover:opacity-95`
- **Secondary**: `bg-card text-brand-ink border border-brand-primary/20 rounded-xl px-5 py-3`
- **Ghost**: `text-brand-ink/70 hover:bg-card rounded-xl px-4 py-2`
- **Minimum tap target**: 44px height for accessibility

### Cards
- **Base**: `bg-card rounded-2xl shadow-md p-4`
- **Item Cards**: Include image, title, price, quantity controls, availability indicator dot
- **Stat Cards**: Large number (tabular), label, trend indicator

### Chips & Pills
- **Style**: `rounded-full px-4 py-2 bg-brand-primary/10 text-brand-ink`
- **Active state**: `bg-brand-primary text-white`
- **With counts**: Display count badges on status chips

## Layout Structure

### Sidebar (Sticky, Left)
- Logo "SmartChef OS" at top
- Navigation links with icons + labels
- Active state: pill background with `bg-brand-primary text-white`
- Links: Dashboard, Order Line (default), Manage Tables (disabled), Manage Dishes, Customers, Settings, Help, Logout

### Topbar (Sticky, Top)
- Search input (prominent, rounded)
- User chip: avatar + role badge
- Quick action ghost buttons: Print, KOT

### Main Content Area
- Generous margins from edges
- Consistent section spacing
- Scrollable content area

## Page-Specific Layouts

### Order Line
- **Status chips row**: Horizontal scrollable chips (All, Dine-in, Waitlist, Takeaway, Served) with order counts
- **Active order carousel**: Small cards showing order number, table, status ("In Kitchen"/"Ready")
- **Category strip**: Horizontal pills for menu categories (All, Specials, Soups, Desserts, Chicken, etc.)
- **Menu grid**: Responsive grid of ItemCards with grid/list toggle, FilterDrawer icon
- **Right CartPanel (sticky)**: 
  - Table number + guest count header
  - Line items with qty editor & modifier notes
  - TotalsCard (subtotal, tax, service charge, discount input field)
  - PaymentButtons (Cash/Card/Scan) as primary actions
  - CTAs: "Send to Kitchen" (primary green), "Print Bill", "Place Order"

### Manage Dishes
- **Left sub-sidebar**: Category list with counts, "Add New Category" button
- **Top controls**: Search bar, "Add New Dish" primary button
- **Grid layout**: Dish cards with availability toggle, edit/delete actions
- **Dashed "Add New Dish" card** as last grid item

### Customers
- **Table layout**: Clean data table with columns: Name, Phone, Last Visit, LTV, Favorites, Action ("Create Order" button)
- **Top filters**: Search input, simple filter controls

### Dashboard
- **Greeting panel**: "Hello [Name], ready to thrive today?" with welcoming tone
- **StatCard trio**: Three cards showing Daily Sales, Orders, Avg Ticket Size (large tabular numbers)
- **InsightCard**: Text insight with icon (e.g., "Sales up 12% this week. Best-selling: Paneer Butter Masala")
- **Charts section**: Lightweight line chart (sales trend) + donut chart (category breakdown) using brand color palette

## Interaction & Animation
- **Hover states**: Subtle raise effect on cards (`hover:scale-105 transition-transform`)
- **Button press**: Slight opacity/scale reduction
- **Focus states**: Visible focus rings using `ring-brand-primary`
- **Transitions**: Calm, 200-300ms durations
- **Toast notifications**: Bottom-right corner, rounded, with icons ("Item added", "KOT sent", "Bill printed")

## Accessibility
- All CTAs have ARIA labels
- Big tap targets (≥44px)
- Visible focus states
- Sufficient color contrast (WCAG AA minimum)

## Keyboard Shortcuts
- **F1**: Focus search
- **F2**: Add first item (focus first add button)
- **F3**: Send KOT
- **Ctrl+P**: Print Bill
- Shortcuts modal accessible via help icon

## Images
- **Dish photos**: Placeholder images in ItemCards (food photography style, warm tones)
- **Avatar images**: User profile images in topbar
- **No large hero images** - this is a functional POS app, not a marketing site

## State Management
- Persistent cart using localStorage
- Real-time order status updates
- Optimistic UI updates with toast confirmations