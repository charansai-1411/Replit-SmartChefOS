# 🔧 Integration Guide - New Menu Management Components

## 🎯 **Quick Integration Steps**

### **1. Replace Existing Dish Cards**

In your `MenuManagement.tsx`, replace the existing dish display with the new `DishCard` component:

```tsx
// Add these imports at the top
import { DishCard } from '@/components/DishCard';
import { BulkDishManager } from '@/components/BulkDishManager';

// Replace your existing dish grid with:
function MenuManagement() {
  const [dishes, setDishes] = useState<DishData[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const handleDishUpdate = (dishId: string, updates: Partial<DishData>) => {
    setDishes(prev => prev.map(dish => 
      dish.id === dishId ? { ...dish, ...updates } : dish
    ));
  };

  return (
    <div className="space-y-6">
      {/* Bulk Mode Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button 
          variant={bulkMode ? "default" : "outline"}
          onClick={() => setBulkMode(!bulkMode)}
        >
          {bulkMode ? "Exit Bulk Mode" : "Bulk Operations"}
        </Button>
      </div>

      {/* Conditional Rendering */}
      {bulkMode ? (
        <BulkDishManager 
          dishes={dishes}
          onDishUpdate={handleDishUpdate}
          onExitBulkMode={() => setBulkMode(false)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {dishes.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              onDishUpdate={handleDishUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### **2. Update Data Fetching**

Update your data fetching to use the new Firestore structure:

```tsx
// Replace your existing API calls with Firestore queries
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

useEffect(() => {
  const restaurantId = 'your-restaurant-id'; // Get from auth context
  
  const dishesQuery = query(
    collection(db, 'dishes'),
    where('restaurantId', '==', restaurantId)
  );

  const unsubscribe = onSnapshot(dishesQuery, (snapshot) => {
    const dishesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DishData[];
    
    setDishes(dishesData);
  });

  return () => unsubscribe();
}, []);
```

### **3. Add Required Types**

Create or update your types file:

```tsx
// types/dish.ts
export interface DishData {
  id: string;
  restaurantId: string;
  name: string;
  priceMinor: number;        // Integer minor units (₹350.00 = 35000)
  category: string;
  images?: string[];         // Firebase Storage URLs
  availability: {
    restaurant: boolean;
    zomato: boolean;
    swiggy: boolean;
    other: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🎨 **CSS Updates Applied**

The following CSS optimizations have been applied to make items more compact:

```css
/* Platform icons reduced to 18×18px */
.platform-icon {
  width: 18px;
  height: 18px;
  padding: 2px;
}

/* Compact card design */
.dish-card {
  padding: 12px; /* Reduced from 16px */
}

.dish-card h3 {
  font-size: 14px; /* Reduced from 16px */
  margin-bottom: 4px; /* Reduced from 8px */
}

.dish-card .price {
  font-size: 16px; /* Reduced from 18px */
  margin-bottom: 12px; /* Reduced from 16px */
}

/* Grid layout for 4-5 items per row */
.dishes-grid {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 640px) {
  .dishes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .dishes-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .dishes-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .dishes-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

## 🔐 **Authentication Setup**

Ensure your authentication context provides restaurant access:

```tsx
// In your auth context or component
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

function useRestaurantAuth() {
  const [user] = useAuthState(auth);
  const [customClaims, setCustomClaims] = useState(null);

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(idTokenResult => {
        setCustomClaims(idTokenResult.claims);
      });
    }
  }, [user]);

  return {
    user,
    restaurantIds: customClaims?.restaurantIds || [],
    role: customClaims?.role || 'staff'
  };
}
```

## 🚀 **Testing Your Integration**

### **1. Test Individual Platform Toggles**
- Each dish should have 4 toggle switches (Restaurant, Zomato, Swiggy, Other)
- Toggling one platform should not affect others
- Changes should be saved to Firestore immediately

### **2. Test Bulk Operations**
- Click "Bulk Operations" to enter bulk mode
- Select multiple dishes using checkboxes
- Use platform toggle buttons to update all selected dishes
- Confirm the operation and verify changes

### **3. Test Image Upload**
- Click the image area on any dish card
- Select an image file (max 10MB)
- Watch the upload progress
- Verify the image appears and URL is saved to Firestore

### **4. Test Security Rules**
- Try accessing dishes from different restaurants (should be blocked)
- Test with different user roles (owner/manager/staff)
- Verify only authorized users can make changes

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Permission Denied" Errors**
   - Ensure user has proper custom claims (`restaurantIds` and `role`)
   - Check Firestore security rules are deployed

2. **Images Not Uploading**
   - Verify Storage security rules are deployed
   - Check file size (max 10MB)
   - Ensure proper authentication

3. **Bulk Operations Not Working**
   - Check batch size (max 500 operations)
   - Verify all selected dishes belong to the same restaurant
   - Check network connectivity for large batches

### **Debug Commands:**

```bash
# Check deployed rules
firebase firestore:rules:get

# View function logs (when deployed)
firebase functions:log

# Test security rules locally
firebase emulators:start --only firestore
```

## 📊 **Performance Monitoring**

Monitor these metrics in your Firebase Console:

1. **Firestore Usage**
   - Document reads/writes per day
   - Batch operation success rate

2. **Storage Usage**
   - Image upload success rate
   - Storage bandwidth usage

3. **Security Rule Denials**
   - Monitor for unauthorized access attempts
   - Check for misconfigured permissions

## 🎉 **You're All Set!**

Your enhanced menu management system now includes:
- ✅ Platform-specific availability controls
- ✅ Bulk operations with batched updates
- ✅ Image upload with progress tracking
- ✅ Production-ready security rules
- ✅ Responsive design (4-5 items per row)

The system is ready for production use! 🚀
