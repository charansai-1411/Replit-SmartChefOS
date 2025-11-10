# Firebase Realtime Database Data Model

Complete data model specification for SmartChefOS multi-tenant restaurant management system.

## Overview

The data model is designed for:
- **Multi-tenancy**: Complete isolation between restaurants
- **Role-based access**: Admin, Manager, Cashier, Server, Kitchen
- **Security**: Server-side validation and custom claims
- **Scalability**: Efficient queries and minimal data duplication

## Database Structure

```
smartchef-db/
├── users/
│   └── {uid}/
├── restaurants/
│   └── {restaurantId}/
├── branches/
│   └── {restaurantId}/
│       └── {branchId}/
├── restaurantUsers/
│   └── {restaurantId}/
│       └── {uid}/
├── invites/
│   └── {restaurantId}/
│       └── {token}/
├── phonesToUid/
│   └── {e164Phone}/
└── slugs/
    └── {slug}/
```

## Detailed Schema

### 1. Users (`/users/{uid}`)

Stores user profile information. Each user can belong to one restaurant.

```typescript
interface User {
  name: string;                    // Full name
  email: string;                   // Email address
  phone: string | null;            // E.164 format: +1234567890
  restaurantId: string | null;     // Current restaurant (null if no restaurant)
  role: Role | null;               // Current role (null if no restaurant)
  status: 'active' | 'disabled';   // Account status
  createdAt: number;               // Unix timestamp (milliseconds)
}

type Role = 'admin' | 'manager' | 'cashier' | 'server' | 'kitchen';
```

**Example**:
```json
{
  "users": {
    "user123": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+911234567890",
      "restaurantId": "rest456",
      "role": "admin",
      "status": "active",
      "createdAt": 1699564800000
    }
  }
}
```

**Security Rules**:
- Read: User can read their own data
- Write: User can update their own data (except restaurantId, role - server-only)

### 2. Restaurants (`/restaurants/{restaurantId}`)

Main restaurant entity with business information.

```typescript
interface Restaurant {
  name: string;                    // Display name
  legalName?: string;              // Legal business name
  country: string;                 // ISO country code (IN, US, etc.)
  currency: string;                // ISO currency code (INR, USD, etc.)
  timezone: string;                // IANA timezone (Asia/Kolkata)
  gstin?: string;                  // Tax ID (India GST)
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  settings: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
  };
  logoUrl?: string;                // Cloud Storage URL
  createdBy: string;               // User ID of creator
  createdAt: number;               // Unix timestamp
  updatedAt?: number;
  updatedBy?: string;
}
```

**Example**:
```json
{
  "restaurants": {
    "rest456": {
      "name": "The Golden Spoon",
      "legalName": "Golden Spoon Pvt Ltd",
      "country": "IN",
      "currency": "INR",
      "timezone": "Asia/Kolkata",
      "gstin": "29ABCDE1234F1Z5",
      "contact": {
        "phone": "+911234567890",
        "email": "info@goldenspoon.com"
      },
      "address": {
        "street": "123 MG Road",
        "city": "Bangalore",
        "state": "Karnataka",
        "postalCode": "560001"
      },
      "settings": {
        "dineIn": true,
        "takeaway": true,
        "delivery": false
      },
      "logoUrl": "https://storage.googleapis.com/...",
      "createdBy": "user123",
      "createdAt": 1699564800000
    }
  }
}
```

**Security Rules**:
- Read: Users with matching restaurantId in custom claims
- Write: Admins and managers only

### 3. Branches (`/branches/{restaurantId}/{branchId}`)

Restaurant locations/outlets.

```typescript
interface Branch {
  name: string;                    // Branch name
  code: string;                    // Unique code (e.g., "BLR-01")
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  hours?: {
    [day: string]: {               // mon, tue, wed, thu, fri, sat, sun
      open: string;                // "09:00"
      close: string;               // "22:00"
    };
  };
  isActive: boolean;
  createdAt: number;
}
```

**Example**:
```json
{
  "branches": {
    "rest456": {
      "branch001": {
        "name": "MG Road Branch",
        "code": "BLR-01",
        "address": {
          "street": "123 MG Road",
          "city": "Bangalore",
          "state": "Karnataka",
          "postalCode": "560001"
        },
        "hours": {
          "mon": { "open": "09:00", "close": "22:00" },
          "tue": { "open": "09:00", "close": "22:00" },
          "wed": { "open": "09:00", "close": "22:00" },
          "thu": { "open": "09:00", "close": "22:00" },
          "fri": { "open": "09:00", "close": "23:00" },
          "sat": { "open": "09:00", "close": "23:00" },
          "sun": { "open": "10:00", "close": "22:00" }
        },
        "isActive": true,
        "createdAt": 1699564800000
      }
    }
  }
}
```

**Security Rules**:
- Read: Users with matching restaurantId
- Write: Admins and managers only

### 4. Restaurant Users (`/restaurantUsers/{restaurantId}/{uid}`)

Links users to restaurants with roles. This is the source of truth for restaurant membership.

```typescript
interface RestaurantUser {
  role: Role;                      // User's role in this restaurant
  status: 'active' | 'disabled';   // Membership status
  addedAt: number;                 // When user joined
  addedBy: string;                 // User ID who added them
  updatedAt?: number;
  updatedBy?: string;
}
```

**Example**:
```json
{
  "restaurantUsers": {
    "rest456": {
      "user123": {
        "role": "admin",
        "status": "active",
        "addedAt": 1699564800000,
        "addedBy": "user123"
      },
      "user789": {
        "role": "server",
        "status": "active",
        "addedAt": 1699651200000,
        "addedBy": "user123"
      }
    }
  }
}
```

**Security Rules**:
- Read: Users with matching restaurantId
- Write: Admins only

### 5. Invites (`/invites/{restaurantId}/{token}`)

Staff invitation tokens. Short-lived and single-use.

```typescript
interface Invite {
  emailOrPhone: string;            // Invitee contact
  role: Role;                      // Role to assign
  invitedBy: string;               // User ID of inviter
  expiresAt: number;               // Expiry timestamp (24h default)
  consumedBy: string | null;       // User ID who accepted (null if pending)
  consumedAt?: number;             // When invite was accepted
  createdAt: number;
}
```

**Example**:
```json
{
  "invites": {
    "rest456": {
      "token-abc123": {
        "emailOrPhone": "staff@example.com",
        "role": "server",
        "invitedBy": "user123",
        "expiresAt": 1699651200000,
        "consumedBy": null,
        "createdAt": 1699564800000
      }
    }
  }
}
```

**Security Rules**:
- Read: No one (server-only)
- Write: Admins only (via Cloud Functions)

### 6. Phone to UID Mapping (`/phonesToUid/{e164Phone}`)

Maps phone numbers to user IDs for quick lookups.

```typescript
type PhoneToUid = string;  // User ID
```

**Example**:
```json
{
  "phonesToUid": {
    "+911234567890": "user123"
  }
}
```

**Security Rules**:
- Read: No one (server-only)
- Write: Server-only (when user links phone)

### 7. Slugs (`/slugs/{slug}`)

Maps restaurant slugs to IDs for vanity URLs.

```typescript
type Slug = string;  // Restaurant ID
```

**Example**:
```json
{
  "slugs": {
    "golden-spoon": "rest456",
    "golden-spoon-a1b2": "rest789"
  }
}
```

**Security Rules**:
- Read: No one (server-only)
- Write: Write-once (prevent overwrites)

## Custom Claims

Custom claims are set server-side and used in security rules for fast authorization.

```typescript
interface CustomClaims {
  restaurantId: string | null;
  role: Role | null;
}
```

**Setting Claims** (Cloud Function):
```typescript
await admin.auth().setCustomUserClaims(uid, {
  restaurantId: 'rest456',
  role: 'admin'
});
```

**Using in Rules**:
```json
{
  ".read": "auth != null && auth.token.restaurantId === $rid"
}
```

**Client Refresh**:
```typescript
// After claims change, force token refresh
await user.getIdToken(true);
```

## Data Flow Examples

### Creating a Restaurant

1. User signs up (Firebase Auth)
2. Client calls `createRestaurant` Cloud Function
3. Function creates:
   - `/restaurants/{rid}` - Restaurant record
   - `/users/{uid}` - User record with restaurantId
   - `/restaurantUsers/{rid}/{uid}` - Membership link
   - `/slugs/{slug}` - Slug mapping
4. Function sets custom claims: `{ restaurantId, role: 'admin' }`
5. Client refreshes token and redirects to onboarding

### Inviting Staff

1. Admin calls `inviteStaff` Cloud Function
2. Function creates `/invites/{rid}/{token}` with 24h expiry
3. Email/SMS sent with invite link
4. Staff clicks link, signs up/logs in
5. Staff calls `acceptInvite` Cloud Function
6. Function:
   - Validates invite (not expired, not consumed)
   - Creates `/restaurantUsers/{rid}/{uid}`
   - Updates `/users/{uid}` with restaurantId and role
   - Marks invite as consumed
   - Sets custom claims
7. Staff redirected to dashboard

### Changing User Role

1. Admin calls `updateUserRole` Cloud Function
2. Function validates:
   - Caller is admin
   - Target user belongs to same restaurant
   - Cannot change own role
3. Function updates:
   - `/restaurantUsers/{rid}/{uid}/role`
   - `/users/{uid}/role`
4. Function updates custom claims
5. Target user must refresh token to see changes

## Query Patterns

### Get All Staff for Restaurant

```typescript
const staffRef = ref(database, `restaurantUsers/${restaurantId}`);
const snapshot = await get(staffRef);
const staff = snapshot.val();
```

### Get User's Restaurant

```typescript
const userRef = ref(database, `users/${uid}`);
const snapshot = await get(userRef);
const restaurantId = snapshot.val()?.restaurantId;
```

### Get Pending Invites

```typescript
const invitesRef = ref(database, `invites/${restaurantId}`);
const snapshot = await get(invitesRef);
const invites = Object.entries(snapshot.val() || {})
  .filter(([_, invite]) => !invite.consumedBy && invite.expiresAt > Date.now());
```

## Indexes

Firebase Realtime Database doesn't require explicit indexes for simple queries. For complex queries, consider:

1. **Denormalization**: Store computed values
2. **Cloud Functions**: Pre-process data on write
3. **Client-side filtering**: For small datasets

## Backup Strategy

1. **Automated Backups**: Enable in Firebase Console
2. **Export Script**: Use Firebase Admin SDK
3. **Version Control**: Track schema changes in git

## Migration Considerations

When updating schema:

1. **Backwards Compatible**: Add new fields, don't remove
2. **Migration Functions**: Write Cloud Functions to transform data
3. **Gradual Rollout**: Update clients incrementally
4. **Validation**: Add schema validation in Cloud Functions

## Performance Tips

1. **Shallow Queries**: Use `.shallow=true` for large lists
2. **Pagination**: Limit queries with `.limitToFirst()`
3. **Denormalize**: Duplicate data for faster reads
4. **Cache**: Use client-side caching for static data
5. **Indexes**: Minimize deep nesting

## Security Checklist

- [ ] All sensitive paths protected (invites, phonesToUid, slugs)
- [ ] Custom claims used for authorization
- [ ] Server-side validation in Cloud Functions
- [ ] No client writes to role/restaurantId
- [ ] Write-once protection on slugs
- [ ] Multi-tenant isolation enforced
- [ ] Rate limiting on sensitive operations
- [ ] Audit logging for admin actions

## References

- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
