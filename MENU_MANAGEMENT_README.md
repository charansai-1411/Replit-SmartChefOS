# 🍽️ SmartChefOS Menu Management System

A production-ready menu management system for restaurants with platform-specific availability controls, image uploads, and bulk operations.

## 🚀 **Features**

### ✅ **Core Functionality**
- **Platform-Specific Availability**: Individual controls for Restaurant, Zomato, Swiggy, and Other platforms
- **Image Upload**: Resumable uploads to Firebase Storage with progress tracking
- **Bulk Operations**: Select and update multiple dishes with batched Firestore writes
- **Data Integrity**: All monetary values stored in minor units (paise/cents)
- **Security**: Role-based access control with custom claims validation

### ✅ **Enhanced Data Model**
- **Dishes Collection**: `priceMinor` (integer), `availability` map, `images` array
- **Platform Independence**: No global toggles - each dish controls its own platform availability
- **Atomic Operations**: Server-side validation and customer lifetime value updates
- **Phone Normalization**: E.164 format with libphonenumber-js

## 📁 **Project Structure**

```
SmartChefOS/
├── client/src/components/
│   ├── DishCard.tsx              # Individual dish card with platform toggles
│   └── BulkDishManager.tsx       # Bulk selection and operations UI
├── functions/src/
│   ├── menu-functions.ts         # Cloud Functions for order processing
│   └── index.ts                  # Main functions export
├── scripts/
│   └── menu-migration.js         # Data migration script
├── firestore-menu-rules.rules    # Enhanced Firestore security rules
├── storage.rules                 # Firebase Storage security rules
└── MENU_MANAGEMENT_README.md     # This file
```

## 🔧 **Setup Instructions**

### **1. Prerequisites**
```bash
# Node.js 18+
node --version

# Firebase CLI
npm install -g firebase-tools
firebase login
```

### **2. Install Dependencies**
```bash
# Client dependencies
cd client
npm install firebase@^10.0.0

# Functions dependencies  
cd ../functions
npm install

# Scripts dependencies
cd ../scripts
npm install
```

### **3. Environment Configuration**

Create `.env` file in project root:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"

# Client Environment Variables
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"
```

### **4. Deploy Security Rules**

**Option A: Firebase CLI**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage
```

**Option B: Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Firestore Database** → **Rules**
3. Copy content from `firestore-menu-rules.rules`
4. Navigate to **Storage** → **Rules**
5. Copy content from `storage.rules`

### **5. Run Data Migration**

```bash
cd scripts

# Test migration (dry run)
npm run migrate:dry-run

# Run actual migration
npm run migrate

# Migrate specific collection only
npm run migrate -- --collection=dishes
```

### **6. Deploy Cloud Functions**

```bash
cd functions

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onOrderCreate
```

## 🎯 **Usage Guide**

### **DishCard Component**

```tsx
import { DishCard } from '@/components/DishCard';

function MenuPage() {
  const [dishes, setDishes] = useState<DishData[]>([]);

  const handleDishUpdate = (dishId: string, updates: Partial<DishData>) => {
    setDishes(prev => prev.map(dish => 
      dish.id === dishId ? { ...dish, ...updates } : dish
    ));
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {dishes.map(dish => (
        <DishCard
          key={dish.id}
          dish={dish}
          onDishUpdate={handleDishUpdate}
        />
      ))}
    </div>
  );
}
```

### **Bulk Operations**

```tsx
import { BulkDishManager } from '@/components/BulkDishManager';

function MenuManagement() {
  const [dishes, setDishes] = useState<DishData[]>([]);

  const handleDishUpdate = (dishId: string, updates: Partial<DishData>) => {
    setDishes(prev => prev.map(dish => 
      dish.id === dishId ? { ...dish, ...updates } : dish
    ));
  };

  return (
    <BulkDishManager 
      dishes={dishes}
      onDishUpdate={handleDishUpdate}
    />
  );
}
```

### **Cloud Functions Usage**

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Bulk update dish availability
const bulkUpdate = httpsCallable(functions, 'bulkUpdateDishAvailability');
const result = await bulkUpdate({
  dishIds: ['dish1', 'dish2', 'dish3'],
  platform: 'zomato',
  enabled: false,
  restaurantId: 'restaurant123'
});

// Validate dish data
const validateDish = httpsCallable(functions, 'validateDishData');
const validation = await validateDish({
  dishData: {
    name: 'Butter Chicken',
    priceMinor: 35000, // ₹350.00
    category: 'Main Course',
    availability: {
      restaurant: true,
      zomato: true,
      swiggy: false,
      other: true
    }
  }
});
```

## 🔒 **Security Model**

### **Authentication & Authorization**
- **Custom Claims**: `restaurantIds` array and `role` (owner/manager/staff)
- **Role Hierarchy**: Owner > Manager > Staff
- **Restaurant Isolation**: Users can only access their assigned restaurants

### **Firestore Rules**
```javascript
// Example rule for dishes collection
match /dishes/{dishId} {
  allow read: if isMemberOfRestaurant(resource.data.restaurantId);
  allow update: if isMemberOfRestaurant(resource.data.restaurantId)
                && validateDishData(request.resource.data);
}
```

### **Storage Rules**
```javascript
// Dish images path: /restaurants/{restaurantId}/dishes/{dishId}/{imageFile}
match /restaurants/{restaurantId}/dishes/{dishId}/{imageFile} {
  allow write: if request.auth != null 
               && isRestaurantMember(restaurantId)
               && validateImageUpload();
}
```

## 📊 **Data Model**

### **Enhanced Dishes Collection**
```typescript
interface DishData {
  id: string;
  restaurantId: string;
  name: string;
  priceMinor: number;        // Integer minor units (₹350.00 = 35000)
  category: string;
  images?: string[];         // Firebase Storage download URLs
  availability: {            // Platform-specific availability
    restaurant: boolean;
    zomato: boolean;
    swiggy: boolean;
    other: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Migration Changes**
- ✅ `price` → `priceMinor` (converted to integer minor units)
- ✅ `available` → `availability` map with platform controls
- ✅ `image` → `images` array for multiple images
- ✅ Added `createdAt` and `updatedAt` timestamps
- ✅ Phone numbers normalized to E.164 format
- ✅ Customer `lifetimeValue` → `lifetimeValueMinor`

## 🧪 **Testing**

### **Run Migration Tests**
```bash
cd scripts
node test-data-transformation.js
```

### **Security Rules Testing**
```bash
# Install Firebase emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Run security rules tests
npm run test:rules
```

### **Component Testing**
```bash
cd client
npm run test
```

## 🚀 **Deployment**

### **Production Deployment**
```bash
# 1. Deploy security rules
firebase deploy --only firestore:rules,storage

# 2. Run migration
cd scripts && npm run migrate

# 3. Deploy Cloud Functions
cd ../functions && firebase deploy --only functions

# 4. Build and deploy client
cd ../client && npm run build
firebase deploy --only hosting
```

### **Staging Environment**
```bash
# Use different Firebase project
firebase use staging

# Deploy with staging configuration
firebase deploy
```

## 🔍 **Monitoring & Logging**

### **Cloud Functions Logs**
```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only onOrderCreate

# Follow logs in real-time
firebase functions:log --follow
```

### **Error Monitoring**
- **429 Errors**: Monitor rate limiting in Cloud Functions logs
- **Batch Failures**: Check Firestore batch operation errors
- **Image Upload Failures**: Monitor Storage upload errors

### **Performance Metrics**
- **Function Execution Time**: Monitor Cloud Functions performance
- **Firestore Read/Write Costs**: Track document operations
- **Storage Bandwidth**: Monitor image upload/download usage

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Migration Script Fails**
```bash
# Check service account key
ls -la service-account-key.json

# Verify environment variables
echo $FIREBASE_PROJECT_ID

# Run with debug logging
DEBUG=* npm run migrate:dry-run
```

**2. Security Rules Errors**
```bash
# Test rules locally
firebase emulators:start --only firestore

# Check rule validation
firebase firestore:rules:get
```

**3. Image Upload Failures**
```bash
# Check Storage rules
firebase deploy --only storage

# Verify CORS configuration
gsutil cors get gs://your-bucket-name
```

**4. Bulk Operations Timeout**
```bash
# Reduce batch size in BulkDishManager
const BATCH_SIZE = 100; // Instead of 500

# Add delays between batches
await new Promise(resolve => setTimeout(resolve, 200));
```

### **Performance Optimization**

**1. Firestore Optimization**
- Use composite indexes for complex queries
- Implement pagination for large datasets
- Cache frequently accessed data

**2. Storage Optimization**
- Compress images before upload
- Use WebP format for better compression
- Implement image CDN for faster delivery

**3. Function Optimization**
- Use connection pooling for external APIs
- Implement retry logic with exponential backoff
- Monitor cold start times

## 📋 **Maintenance**

### **Regular Tasks**
- **Weekly**: Review Cloud Functions logs for errors
- **Monthly**: Analyze Firestore usage and optimize queries
- **Quarterly**: Update dependencies and security rules

### **Backup Strategy**
```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/$(date +%Y-%m-%d)

# Backup Storage files
gsutil -m cp -r gs://your-storage-bucket gs://your-backup-bucket/storage-backup
```

### **Rollback Procedures**
```bash
# Revert security rules
firebase deploy --only firestore:rules --force

# Rollback Cloud Functions
firebase functions:delete functionName
firebase deploy --only functions

# Restore from backup
gcloud firestore import gs://your-backup-bucket/2024-01-15
```

## 🤝 **Support**

### **Documentation**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

### **Community**
- [Firebase Slack](https://firebase.community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)

---

## 📝 **Changelog**

### **v2.0.0** - Enhanced Menu Management
- ✅ Platform-specific availability controls
- ✅ Bulk operations with batched updates
- ✅ Image upload with progress tracking
- ✅ Enhanced security rules
- ✅ Data migration script
- ✅ Cloud Functions for order processing

### **v1.0.0** - Initial Release
- Basic dish management
- Simple availability toggle
- Single image support

---

**🎉 Your production-ready menu management system is now complete!**

For questions or support, please refer to the documentation links above or create an issue in the project repository.
