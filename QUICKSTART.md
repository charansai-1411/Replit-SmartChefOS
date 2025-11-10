# 🚀 Quick Start Guide - Firebase Authentication

Get SmartChefOS Firebase authentication up and running in 10 minutes.

## Prerequisites

- Node.js 18+
- Firebase account
- 10 minutes

## Step 1: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it (e.g., "smartchef-dev")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Enable Services (3 min)

### Enable Authentication
1. **Authentication** → **Get started**
2. **Sign-in method** → Enable **Email/Password**

### Create Realtime Database
1. **Realtime Database** → **Create Database**
2. Choose location (e.g., us-central1)
3. Start in **locked mode**

### Enable Storage
1. **Storage** → **Get started**
2. Start in **production mode**

### Register Web App
1. **Project Settings** (⚙️) → **Your apps**
2. Click **Web** icon (</>)
3. Register app (nickname: "SmartChef Web")
4. **Copy the config object** (you'll need this)

### Download Service Account
1. **Project Settings** → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Save as `serviceAccountKey.json` in project root

## Step 3: Install Dependencies (1 min)

```bash
npm install
cd functions && npm install && cd ..
```

## Step 4: Configure Project (2 min)

### Update `.firebaserc`

```json
{
  "projects": {
    "default": "your-project-id-here"
  }
}
```

### Create `.env` file

Copy `.env.example` to `.env` and fill in from Firebase Console:

```env
# From Firebase Console > Project Settings > Web App Config
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Service account path
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# For local development
VITE_USE_FIREBASE_EMULATORS=false
```

## Step 5: Deploy to Firebase (2 min)

### Login to Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Deploy Security Rules

```bash
firebase deploy --only database,storage
```

### Build and Deploy Functions

```bash
npm run functions:build
firebase deploy --only functions
```

## Step 6: Test Locally (Optional)

### Start Emulators

```bash
npm run firebase:emulators
```

Update `.env`:
```env
VITE_USE_FIREBASE_EMULATORS=true
```

### Start Dev Server

```bash
npm run dev
```

Visit http://localhost:5000

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Realtime Database created
- [ ] Storage enabled
- [ ] Web app registered
- [ ] Service account downloaded
- [ ] `.firebaserc` updated
- [ ] `.env` configured
- [ ] Dependencies installed
- [ ] Security rules deployed
- [ ] Cloud Functions deployed

## 🎯 Test the System

### 1. Sign Up

1. Go to http://localhost:5000/signup (or your deployed URL)
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234
3. Click **Sign Up**

### 2. Create Restaurant

1. You'll be redirected to restaurant wizard
2. Enter:
   - Restaurant Name: Test Restaurant
   - Country: India (or your country)
3. Click **Create Restaurant**

### 3. Verify in Firebase Console

1. **Authentication** → Should see test@example.com
2. **Realtime Database** → Should see:
   - `/users/{uid}`
   - `/restaurants/{rid}`
   - `/restaurantUsers/{rid}/{uid}`

### 4. Test Staff Invite

1. Go to **Staff Management**
2. Click **Invite Staff**
3. Enter email and role
4. Check **Realtime Database** → `/invites/{rid}/{token}`

## 🔧 Common Issues

### "Permission Denied" in Database

**Solution**: Make sure security rules are deployed
```bash
firebase deploy --only database
```

### Functions Not Working

**Solution**: Check deployment
```bash
firebase deploy --only functions
firebase functions:log
```

### Custom Claims Not Set

**Solution**: Force token refresh
```typescript
await user.getIdToken(true);
```

## 📚 Next Steps

1. **Read Full Documentation**
   - [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed setup
   - [FIREBASE_DATA_MODEL.md](./FIREBASE_DATA_MODEL.md) - Database schema
   - [FIREBASE_TESTING.md](./FIREBASE_TESTING.md) - Testing guide

2. **Customize**
   - Add your logo
   - Configure email templates
   - Set up SendGrid/Twilio for invites

3. **Deploy to Production**
   - Update environment variables
   - Configure custom domain
   - Enable monitoring

## 🆘 Need Help?

1. Check Firebase Console logs
2. Review security rules in Emulator UI
3. Test with emulators first
4. Read detailed docs in `FIREBASE_*.md` files

## 🎉 You're Done!

Your Firebase multi-tenant authentication system is ready!

**What you have:**
- ✅ Secure email/password authentication
- ✅ Multi-tenant restaurant management
- ✅ Staff invite system
- ✅ Role-based access control
- ✅ Onboarding flow
- ✅ Complete security rules

**Time to build your restaurant management features!** 🍽️
