# Firebase Multi-Tenant Authentication System

Complete implementation of secure email/password authentication with optional phone OTP, restaurant account creation (multi-tenant), staff invites, role-based access control, and onboarding for SmartChefOS.

## 🎯 Features Implemented

### ✅ Authentication
- [x] Email/password signup and login
- [x] Password validation (min 8 chars, uppercase, lowercase, digit)
- [x] Password reset via email
- [x] Phone OTP support (infrastructure ready)
- [x] Custom claims for fast authorization
- [x] Token refresh mechanism

### ✅ Multi-Tenant Restaurant Management
- [x] Restaurant creation on first signup
- [x] Automatic admin role assignment
- [x] Restaurant profile management
- [x] Slug-based restaurant URLs
- [x] Complete tenant isolation

### ✅ Staff Management
- [x] Email/phone-based staff invites
- [x] Short-lived invite tokens (24h expiry)
- [x] Role assignment (admin, manager, cashier, server, kitchen)
- [x] Invite acceptance workflow
- [x] User deactivation
- [x] Invite revocation

### ✅ Role-Based Access Control
- [x] Custom claims: `{ restaurantId, role }`
- [x] Server-side role validation
- [x] Security rules enforcement
- [x] Admin-only operations
- [x] Manager permissions

### ✅ Onboarding
- [x] Post-signup restaurant wizard
- [x] Onboarding checklist
- [x] Progress tracking
- [x] Step-by-step guidance

### ✅ Security
- [x] Realtime Database security rules
- [x] Storage security rules
- [x] Server-side validation
- [x] Input sanitization
- [x] Multi-tenant isolation
- [x] Write-once slug protection

## 📁 Project Structure

```
SmartChefOS/
├── functions/                      # Cloud Functions
│   ├── src/
│   │   ├── index.ts               # All callable functions
│   │   └── validation.ts          # Validation utilities
│   ├── package.json
│   └── tsconfig.json
├── client/src/
│   ├── lib/
│   │   └── firebase.ts            # Firebase client config
│   ├── hooks/
│   │   └── useAuth.tsx            # Auth context & hooks
│   └── pages/
│       ├── Signup.tsx             # Signup page
│       ├── Login.tsx              # Login page
│       ├── RestaurantWizard.tsx   # Restaurant creation
│       ├── Onboarding.tsx         # Onboarding checklist
│       ├── StaffManagement.tsx    # Staff management
│       └── AcceptInvite.tsx       # Invite acceptance
├── firebase.json                  # Firebase config
├── database.rules.json            # Realtime DB rules
├── storage.rules                  # Storage rules
├── .firebaserc                    # Firebase project
├── FIREBASE_SETUP.md             # Setup guide
├── FIREBASE_DATA_MODEL.md        # Data model spec
└── FIREBASE_TESTING.md           # Testing guide
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Configure Firebase

Update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Update `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3. Deploy Security Rules

```bash
firebase deploy --only database,storage
```

### 4. Deploy Cloud Functions

```bash
npm run functions:build
npm run functions:deploy
```

### 5. Start Development

```bash
# Start Firebase emulators
npm run firebase:emulators

# In another terminal, start dev server
npm run dev
```

## 📚 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete setup guide
- **[FIREBASE_DATA_MODEL.md](./FIREBASE_DATA_MODEL.md)** - Database schema
- **[FIREBASE_TESTING.md](./FIREBASE_TESTING.md)** - Testing guide

## 🔐 Security Model

### Custom Claims

Every authenticated user has custom claims set server-side:

```typescript
{
  restaurantId: "rest123",  // null if no restaurant
  role: "admin"             // null if no restaurant
}
```

### Security Rules

Multi-tenant isolation enforced at database level:

```json
{
  "restaurants": {
    "$rid": {
      ".read": "auth != null && auth.token.restaurantId === $rid",
      ".write": "auth != null && auth.token.restaurantId === $rid && (auth.token.role === 'admin' || auth.token.role === 'manager')"
    }
  }
}
```

### Validation

All inputs validated server-side:
- Email: RFC format
- Phone: E.164 format (`+1234567890`)
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
- GSTIN: India tax ID format
- Slug: Lowercase alphanumeric with hyphens

## 🔄 Authentication Flows

### New User Signup

```
1. User → Signup Form (email, password, name)
2. Client → Firebase Auth (createUserWithEmailAndPassword)
3. Client → Cloud Function: createRestaurant
4. Function → Creates restaurant, user, links, sets claims
5. Client → Redirects to onboarding
```

### Staff Invite

```
1. Admin → Invite Form (email/phone, role)
2. Client → Cloud Function: inviteStaff
3. Function → Creates invite token, stores in DB
4. [External] → Send email/SMS with invite link
5. Staff → Clicks link, signs up/logs in
6. Client → Cloud Function: acceptInvite
7. Function → Validates, links user, sets claims
8. Client → Redirects to dashboard
```

## 🎨 UI Components

### Signup Page
- Email/password form
- Password strength validation
- Real-time error feedback
- Redirect to restaurant wizard

### Restaurant Wizard
- Restaurant name input
- Country selection (auto-fills currency/timezone)
- Minimal friction
- Skip to onboarding

### Onboarding Checklist
- Progress tracking
- Step-by-step tasks
- Quick links to settings
- Skip option

### Staff Management
- Active staff list
- Role management
- Pending invites
- Copy invite links
- Revoke invites
- Deactivate users

## 🧪 Testing

### Run Emulators

```bash
npm run firebase:emulators
```

Access Emulator UI: http://localhost:4000

### Test Accounts

Create in Emulator UI:
- `admin@test.com` / `Test1234` (Admin)
- `staff@test.com` / `Test1234` (Staff)

### Unit Tests

```bash
cd functions
npm test
```

### Security Rules Tests

```bash
npm test
```

## 📊 Cloud Functions

### Callable Functions

| Function | Auth | Role | Description |
|----------|------|------|-------------|
| `createRestaurant` | ✅ | Any | Create restaurant, set admin |
| `inviteStaff` | ✅ | Admin | Invite staff member |
| `acceptInvite` | ✅ | Any | Accept staff invite |
| `updateUserRole` | ✅ | Admin | Change user role |
| `updateRestaurantProfile` | ✅ | Admin/Manager | Update restaurant |
| `deactivateUser` | ✅ | Admin | Deactivate staff |
| `revokeInvite` | ✅ | Admin | Revoke pending invite |

### Function Logs

```bash
firebase functions:log
```

## 🗄️ Data Model

### Users
```typescript
/users/{uid}
  - name: string
  - email: string
  - phone: string|null
  - restaurantId: string|null
  - role: "admin"|"manager"|"cashier"|"server"|"kitchen"|null
  - status: "active"|"disabled"
  - createdAt: timestamp
```

### Restaurants
```typescript
/restaurants/{restaurantId}
  - name: string
  - country: string
  - currency: string
  - timezone: string
  - settings: { dineIn, takeaway, delivery }
  - createdBy: uid
  - createdAt: timestamp
```

### Restaurant Users (Multi-tenant link)
```typescript
/restaurantUsers/{restaurantId}/{uid}
  - role: string
  - status: "active"|"disabled"
  - addedAt: timestamp
  - addedBy: uid
```

### Invites
```typescript
/invites/{restaurantId}/{token}
  - emailOrPhone: string
  - role: string
  - invitedBy: uid
  - expiresAt: timestamp (24h)
  - consumedBy: uid|null
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | App ID | ✅ |
| `VITE_FIREBASE_DATABASE_URL` | Realtime DB URL | ✅ |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Service account JSON | ✅ |
| `VITE_USE_FIREBASE_EMULATORS` | Use emulators | ❌ |

## 🚨 Troubleshooting

### "Permission Denied" errors
- Check custom claims are set
- Force token refresh: `await user.getIdToken(true)`
- Verify security rules

### Functions not deploying
- Check TypeScript compilation: `npm run functions:build`
- Verify Node.js version (18+)
- Check logs: `firebase functions:log`

### Custom claims not updating
- Force refresh: `await user.getIdToken(true)`
- Wait ~1 hour for automatic propagation
- Check claims: `firebase auth:export users.json`

## 📈 Production Checklist

- [ ] Environment variables configured
- [ ] Service account key secured
- [ ] Database rules deployed
- [ ] Storage rules deployed
- [ ] Cloud Functions deployed
- [ ] Email/SMS provider integrated
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Security audit completed

## 🎯 Next Steps

1. **Email/SMS Integration**: Add SendGrid/Twilio for invite emails
2. **Phone OTP**: Implement phone authentication flow
3. **Audit Logs**: Track admin actions
4. **Rate Limiting**: Add to Cloud Functions
5. **Advanced Roles**: Implement granular permissions
6. **Multi-branch**: Support multiple restaurant locations
7. **Analytics**: Track user engagement

## 📝 License

MIT

## 🤝 Support

For issues or questions:
- Check documentation in `FIREBASE_*.md` files
- Review Firebase Console logs
- Test with emulators first
- Check security rules in Emulator UI

---

**Built with Firebase** 🔥
