# Firebase Multi-Tenant Authentication Setup Guide

Complete guide for setting up Firebase Authentication, Realtime Database, Cloud Functions, and Storage for SmartChefOS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Install Dependencies](#install-dependencies)
5. [Deploy Security Rules](#deploy-security-rules)
6. [Deploy Cloud Functions](#deploy-cloud-functions)
7. [Testing with Emulators](#testing-with-emulators)
8. [Authentication Flow](#authentication-flow)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js >= 18
- npm or yarn
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (create at https://console.firebase.google.com)

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "smartchef-prod")
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Phone** for OTP authentication

### 3. Create Realtime Database

1. Go to **Realtime Database** > **Create Database**
2. Choose location (e.g., us-central1)
3. Start in **locked mode** (we'll deploy rules later)

### 4. Enable Cloud Storage

1. Go to **Storage** > **Get Started**
2. Start in **production mode**
3. Choose same location as database

### 5. Register Web App

1. Go to **Project Settings** > **Your apps**
2. Click **Web** icon (</>)
3. Register app with nickname (e.g., "SmartChef Web")
4. Copy the Firebase config object

### 6. Download Service Account Key

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save as `serviceAccountKey.json` in project root
4. **IMPORTANT**: Add to `.gitignore` (already done)

## Environment Configuration

### 1. Update `.firebaserc`

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Replace `your-project-id` with your actual Firebase project ID.

### 2. Create `.env` file

Copy `.env.example` to `.env` and fill in values from Firebase Console:

```env
# Firebase Client Config (from Web App config)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Firebase Admin (server-side)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Optional: Use Firebase Emulators in development
VITE_USE_FIREBASE_EMULATORS=false
```

## Install Dependencies

### Root Project

```bash
npm install
```

This installs:
- `firebase` - Client SDK
- `firebase-admin` - Admin SDK
- `firebase-functions` - Cloud Functions SDK

### Cloud Functions

```bash
cd functions
npm install
cd ..
```

## Deploy Security Rules

### 1. Review Rules

Check `database.rules.json` and `storage.rules` to ensure they match your requirements.

### 2. Deploy Database Rules

```bash
firebase deploy --only database
```

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 4. Verify Rules

In Firebase Console:
- **Realtime Database** > **Rules** - should show deployed rules
- **Storage** > **Rules** - should show deployed rules

## Deploy Cloud Functions

### 1. Build Functions

```bash
npm run functions:build
```

### 2. Deploy to Firebase

```bash
firebase deploy --only functions
```

Or use the npm script:

```bash
npm run functions:deploy
```

### 3. Verify Deployment

In Firebase Console > **Functions**, you should see:
- `createRestaurant`
- `inviteStaff`
- `acceptInvite`
- `updateUserRole`
- `updateRestaurantProfile`
- `deactivateUser`
- `revokeInvite`

## Testing with Emulators

### 1. Start Emulators

```bash
npm run firebase:emulators
```

This starts:
- **Auth Emulator**: http://localhost:9099
- **Database Emulator**: http://localhost:9000
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### 2. Configure Client for Emulators

In `.env`:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

### 3. Test Authentication Flow

1. Open http://localhost:5000 (your app)
2. Sign up with test email
3. Create restaurant
4. Invite staff
5. Check Emulator UI at http://localhost:4000 to inspect data

## Authentication Flow

### New User Signup

1. **User signs up** with email/password
   - Frontend: `signUp(email, password, name)`
   - Firebase Auth creates user account

2. **Create restaurant** (first-time setup)
   - Frontend: `createRestaurant({ name, country, currency, timezone })`
   - Cloud Function creates:
     - Restaurant record in `/restaurants/{rid}`
     - User record in `/users/{uid}`
     - Restaurant-user link in `/restaurantUsers/{rid}/{uid}`
     - Custom claims: `{ restaurantId, role: 'admin' }`

3. **Onboarding wizard**
   - User completes restaurant profile
   - Adds address, hours, logo, etc.

### Staff Invite Flow

1. **Admin invites staff**
   - Frontend: `inviteStaff(emailOrPhone, role)`
   - Cloud Function creates invite token in `/invites/{rid}/{token}`
   - Email/SMS sent with invite link (integrate SendGrid/Twilio)

2. **Staff receives invite**
   - Clicks link: `/accept-invite?rid={rid}&token={token}`
   - If not logged in, redirected to signup/login

3. **Staff accepts invite**
   - Frontend: `acceptInvite(restaurantId, token)`
   - Cloud Function:
     - Validates invite (not expired, not consumed)
     - Links user to restaurant
     - Sets custom claims: `{ restaurantId, role }`

### Custom Claims

Custom claims are set server-side and used in security rules:

```typescript
// Set claims (Cloud Function)
await admin.auth().setCustomUserClaims(uid, {
  restaurantId: 'rest123',
  role: 'admin'
});

// Use in security rules
".read": "auth != null && auth.token.restaurantId === $rid"
```

**Important**: After setting claims, client must refresh token:

```typescript
await user.getIdToken(true); // Force refresh
```

## Data Model

### Users

```
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

```
/restaurants/{restaurantId}
  - name: string
  - legalName: string|null
  - country: "IN"|"US"|...
  - currency: "INR"|"USD"|...
  - timezone: "Asia/Kolkata"|...
  - gstin: string|null
  - contact: { phone, email }
  - address: { street, city, state, postalCode }
  - settings: { dineIn, takeaway, delivery }
  - logoUrl: string|null
  - createdBy: uid
  - createdAt: timestamp
```

### Restaurant Users (Multi-tenant link)

```
/restaurantUsers/{restaurantId}/{uid}
  - role: "admin"|"manager"|"cashier"|"server"|"kitchen"
  - status: "active"|"disabled"
  - addedAt: timestamp
  - addedBy: uid
```

### Invites

```
/invites/{restaurantId}/{token}
  - emailOrPhone: string
  - role: string
  - invitedBy: uid
  - expiresAt: timestamp
  - consumedBy: uid|null
  - createdAt: timestamp
```

## Troubleshooting

### "Permission Denied" Errors

**Cause**: Custom claims not set or not refreshed

**Solution**:
1. Check claims: `firebase auth:export users.json` and inspect
2. Force token refresh: `await user.getIdToken(true)`
3. Verify security rules match data structure

### Functions Not Deploying

**Cause**: TypeScript compilation errors or missing dependencies

**Solution**:
```bash
cd functions
npm install
npm run build
```

Check for errors in `functions/lib/`

### Custom Claims Not Updating

**Cause**: Token cached on client

**Solution**:
```typescript
// Force refresh
const user = auth.currentUser;
if (user) {
  await user.getIdToken(true);
  await refreshUserData();
}
```

### Emulator Connection Issues

**Cause**: Emulator not started or wrong ports

**Solution**:
1. Check emulators running: `firebase emulators:start`
2. Verify ports in `firebase.json`
3. Check `.env`: `VITE_USE_FIREBASE_EMULATORS=true`

### Invite Link Not Working

**Cause**: Token expired or already consumed

**Solution**:
1. Check invite expiry: default 24 hours
2. Revoke and resend invite
3. Verify token in database: `/invites/{rid}/{token}`

## Security Best Practices

1. **Never trust client data** - All role/restaurant assignments via Cloud Functions
2. **Use custom claims** - Fast authorization in security rules
3. **Server timestamps** - Never let clients set `createdAt`/`updatedAt`
4. **Rate limiting** - Implement in Cloud Functions or use Firebase App Check
5. **Validate inputs** - Use validation functions in Cloud Functions
6. **HTTPS only** - All callable functions are HTTPS by default
7. **Audit logs** - Track sensitive operations (implement in functions)

## Production Checklist

- [ ] Environment variables configured
- [ ] Service account key secured (not in git)
- [ ] Database rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Cloud Functions deployed
- [ ] Email/SMS provider configured (SendGrid/Twilio)
- [ ] Custom domain configured (optional)
- [ ] Rate limiting enabled
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Security audit completed

## Support

- **Firebase Documentation**: https://firebase.google.com/docs
- **Stack Overflow**: firebase tag
- **Firebase Support**: https://firebase.google.com/support

## Next Steps

1. Install dependencies: `npm install`
2. Configure environment: Update `.env` and `.firebaserc`
3. Deploy rules: `firebase deploy --only database,storage`
4. Deploy functions: `npm run functions:deploy`
5. Test locally: `npm run firebase:emulators`
6. Start development: `npm run dev`
