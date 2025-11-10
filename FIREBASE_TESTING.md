# Firebase Testing Guide

Comprehensive testing guide for Firebase Authentication, Realtime Database, Cloud Functions, and Security Rules.

## Table of Contents

1. [Testing with Firebase Emulators](#testing-with-firebase-emulators)
2. [Unit Testing Cloud Functions](#unit-testing-cloud-functions)
3. [Security Rules Testing](#security-rules-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)

## Testing with Firebase Emulators

### Setup

The Firebase Emulator Suite allows you to test locally without affecting production data.

### Start Emulators

```bash
npm run firebase:emulators
```

This starts:
- **Auth Emulator**: http://localhost:9099
- **Database Emulator**: http://localhost:9000
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### Configure Client

In `.env`:
```env
VITE_USE_FIREBASE_EMULATORS=true
```

The client automatically connects to emulators when this is enabled.

### Emulator UI Features

Access at http://localhost:4000:

1. **Authentication**: View/create test users
2. **Realtime Database**: Inspect data structure
3. **Functions**: View logs and execution history
4. **Storage**: Browse uploaded files

### Test Data

Create test users in Emulator UI:
- Email: `admin@test.com` / Password: `Test1234`
- Email: `staff@test.com` / Password: `Test1234`

## Unit Testing Cloud Functions

### Setup

Install testing dependencies:

```bash
cd functions
npm install --save-dev @types/jest jest ts-jest firebase-functions-test
```

### Create `functions/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

### Example Test: `functions/src/__tests__/createRestaurant.test.ts`

```typescript
import * as admin from 'firebase-admin';
import * as functionsTest from 'firebase-functions-test';

const test = functionsTest();

describe('createRestaurant', () => {
  let createRestaurant: any;
  
  beforeAll(() => {
    // Initialize admin SDK
    admin.initializeApp();
    createRestaurant = require('../index').createRestaurant;
  });

  afterAll(() => {
    test.cleanup();
  });

  it('should create restaurant for authenticated user', async () => {
    const data = {
      name: 'Test Restaurant',
      country: 'IN',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      ownerName: 'Test Owner',
    };

    const context = {
      auth: {
        uid: 'test-uid-123',
        token: {
          email: 'test@example.com',
        },
      },
    };

    const result = await createRestaurant(data, context);
    
    expect(result).toHaveProperty('restaurantId');
    expect(result.message).toBe('Restaurant created successfully');
  });

  it('should reject unauthenticated request', async () => {
    const data = { name: 'Test Restaurant' };
    const context = {}; // No auth

    await expect(createRestaurant(data, context)).rejects.toThrow('Login required');
  });

  it('should validate restaurant name', async () => {
    const data = { name: 'AB' }; // Too short
    const context = {
      auth: { uid: 'test-uid-123', token: {} },
    };

    await expect(createRestaurant(data, context)).rejects.toThrow('at least 3 characters');
  });
});
```

### Run Tests

```bash
cd functions
npm test
```

## Security Rules Testing

### Setup

Install testing SDK:

```bash
npm install --save-dev @firebase/rules-unit-testing
```

### Create `test/database.rules.test.ts`

```typescript
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';

let testEnv: any;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    database: {
      host: 'localhost',
      port: 9000,
      rules: require('fs').readFileSync('database.rules.json', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Database Security Rules', () => {
  describe('Users', () => {
    it('allows user to read their own data', async () => {
      const db = testEnv.authenticatedContext('user123').database();
      await assertSucceeds(db.ref('users/user123').get());
    });

    it('denies user from reading other user data', async () => {
      const db = testEnv.authenticatedContext('user123').database();
      await assertFails(db.ref('users/user456').get());
    });

    it('allows user to write their own data', async () => {
      const db = testEnv.authenticatedContext('user123').database();
      await assertSucceeds(
        db.ref('users/user123').set({
          name: 'Updated Name',
          email: 'test@example.com',
        })
      );
    });
  });

  describe('Restaurants', () => {
    it('allows restaurant member to read restaurant data', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest456',
        role: 'admin',
      }).database();
      
      await assertSucceeds(db.ref('restaurants/rest456').get());
    });

    it('denies non-member from reading restaurant data', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest789',
        role: 'admin',
      }).database();
      
      await assertFails(db.ref('restaurants/rest456').get());
    });

    it('allows admin to write restaurant data', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest456',
        role: 'admin',
      }).database();
      
      await assertSucceeds(
        db.ref('restaurants/rest456/name').set('Updated Name')
      );
    });

    it('denies non-admin from writing restaurant data', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest456',
        role: 'server',
      }).database();
      
      await assertFails(
        db.ref('restaurants/rest456/name').set('Updated Name')
      );
    });
  });

  describe('Restaurant Users', () => {
    it('allows admin to add users', async () => {
      const db = testEnv.authenticatedContext('admin123', {
        restaurantId: 'rest456',
        role: 'admin',
      }).database();
      
      await assertSucceeds(
        db.ref('restaurantUsers/rest456/user789').set({
          role: 'server',
          status: 'active',
          addedAt: Date.now(),
          addedBy: 'admin123',
        })
      );
    });

    it('denies non-admin from adding users', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest456',
        role: 'manager',
      }).database();
      
      await assertFails(
        db.ref('restaurantUsers/rest456/user789').set({
          role: 'server',
          status: 'active',
        })
      );
    });
  });

  describe('Invites', () => {
    it('denies reading invites', async () => {
      const db = testEnv.authenticatedContext('user123', {
        restaurantId: 'rest456',
        role: 'admin',
      }).database();
      
      await assertFails(db.ref('invites/rest456/token123').get());
    });

    it('allows admin to write invites via functions only', async () => {
      // Invites should only be written by Cloud Functions
      // Direct client writes should fail
      const db = testEnv.authenticatedContext('admin123', {
        restaurantId: 'rest456',
        role: 'admin',
      }).database();
      
      // This should fail because rules require server-side writes
      await assertFails(
        db.ref('invites/rest456/token123').set({
          emailOrPhone: 'test@example.com',
          role: 'server',
        })
      );
    });
  });
});
```

### Run Security Rules Tests

```bash
npm test
```

## Integration Testing

Test complete workflows across multiple components.

### Example: Complete Signup Flow

```typescript
describe('Signup and Restaurant Creation Flow', () => {
  it('should complete full signup workflow', async () => {
    // 1. Sign up user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'newuser@test.com',
      'Test1234'
    );
    const user = userCredential.user;

    // 2. Create restaurant
    const createRestaurant = httpsCallable(functions, 'createRestaurant');
    const result = await createRestaurant({
      name: 'Integration Test Restaurant',
      country: 'IN',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      ownerName: 'Test Owner',
    });

    expect(result.data).toHaveProperty('restaurantId');

    // 3. Verify user data
    const userRef = ref(database, `users/${user.uid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    expect(userData.restaurantId).toBe(result.data.restaurantId);
    expect(userData.role).toBe('admin');

    // 4. Verify custom claims
    await user.getIdToken(true); // Force refresh
    const idTokenResult = await user.getIdTokenResult();
    expect(idTokenResult.claims.restaurantId).toBe(result.data.restaurantId);
    expect(idTokenResult.claims.role).toBe('admin');
  });
});
```

### Example: Staff Invite Flow

```typescript
describe('Staff Invite Flow', () => {
  it('should invite and accept staff member', async () => {
    // 1. Admin invites staff
    const inviteStaff = httpsCallable(functions, 'inviteStaff');
    const inviteResult = await inviteStaff({
      emailOrPhone: 'staff@test.com',
      role: 'server',
    });

    const token = inviteResult.data.token;

    // 2. Staff signs up
    const staffCredential = await createUserWithEmailAndPassword(
      auth,
      'staff@test.com',
      'Test1234'
    );

    // 3. Staff accepts invite
    const acceptInvite = httpsCallable(functions, 'acceptInvite');
    const acceptResult = await acceptInvite({
      restaurantId: 'rest456',
      token,
    });

    expect(acceptResult.data.success).toBe(true);

    // 4. Verify staff is linked to restaurant
    const staffRef = ref(database, `users/${staffCredential.user.uid}`);
    const staffSnapshot = await get(staffRef);
    const staffData = staffSnapshot.val();

    expect(staffData.restaurantId).toBe('rest456');
    expect(staffData.role).toBe('server');
  });
});
```

## End-to-End Testing

Use Playwright or Cypress for full browser testing.

### Setup Playwright

```bash
npm install --save-dev @playwright/test
```

### Example E2E Test: `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should sign up and create restaurant', async ({ page }) => {
    // Navigate to signup
    await page.goto('http://localhost:5000/signup');

    // Fill signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234');
    await page.fill('input[name="confirmPassword"]', 'Test1234');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to restaurant wizard
    await expect(page).toHaveURL(/restaurant-wizard/);

    // Fill restaurant form
    await page.fill('input[name="name"]', 'Test Restaurant');
    await page.selectOption('select[name="country"]', 'IN');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/onboarding/);

    // Verify restaurant created
    await expect(page.locator('text=Test Restaurant')).toBeVisible();
  });

  test('should invite and accept staff', async ({ page, context }) => {
    // Admin session
    await page.goto('http://localhost:5000/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');

    // Navigate to staff management
    await page.goto('http://localhost:5000/staff');

    // Invite staff
    await page.click('button:has-text("Invite Staff")');
    await page.fill('input[name="emailOrPhone"]', 'staff@test.com');
    await page.selectOption('select[name="role"]', 'server');
    await page.click('button:has-text("Send Invite")');

    // Copy invite link
    await page.click('button:has-text("Copy Link")');
    const inviteLink = await page.evaluate(() => navigator.clipboard.readText());

    // Open new page for staff
    const staffPage = await context.newPage();
    await staffPage.goto(inviteLink);

    // Staff signs up
    await staffPage.fill('input[name="email"]', 'staff@test.com');
    await staffPage.fill('input[name="password"]', 'Test1234');
    await staffPage.click('button[type="submit"]');

    // Should auto-accept invite and redirect
    await expect(staffPage).toHaveURL(/\//);
    await expect(staffPage.locator('text=Server')).toBeVisible();
  });
});
```

### Run E2E Tests

```bash
npx playwright test
```

## Test Coverage

### Measure Coverage

```bash
cd functions
npm test -- --coverage
```

### Coverage Goals

- **Functions**: > 80% coverage
- **Security Rules**: 100% coverage (all paths tested)
- **Integration**: Key workflows covered
- **E2E**: Critical user journeys

## Continuous Integration

### GitHub Actions Example: `.github/workflows/test.yml`

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd functions && npm install
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Start Firebase Emulators
        run: firebase emulators:start --only auth,database,functions &
        
      - name: Wait for emulators
        run: sleep 10
      
      - name: Run unit tests
        run: cd functions && npm test
      
      - name: Run security rules tests
        run: npm test
      
      - name: Run E2E tests
        run: npx playwright test
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Emulators**: Never test against production
3. **Mock External Services**: Email/SMS providers
4. **Test Edge Cases**: Expired invites, invalid data, etc.
5. **Clean Up**: Clear emulator data between tests
6. **Parallel Execution**: Run tests concurrently when possible
7. **Continuous Testing**: Run tests on every commit

## Debugging Tests

### View Emulator Logs

```bash
firebase emulators:start --debug
```

### Inspect Database State

Use Emulator UI at http://localhost:4000 to inspect data during test execution.

### Function Logs

```typescript
console.log('Debug info:', data);
```

Logs appear in emulator console and UI.

## Common Test Scenarios

### Test Custom Claims

```typescript
it('should set custom claims correctly', async () => {
  const user = await admin.auth().getUser('test-uid');
  expect(user.customClaims?.restaurantId).toBe('rest456');
  expect(user.customClaims?.role).toBe('admin');
});
```

### Test Invite Expiry

```typescript
it('should reject expired invite', async () => {
  const expiredInvite = {
    emailOrPhone: 'test@example.com',
    role: 'server',
    expiresAt: Date.now() - 1000, // Expired
  };
  
  await admin.database().ref('invites/rest456/token123').set(expiredInvite);
  
  const acceptInvite = httpsCallable(functions, 'acceptInvite');
  await expect(
    acceptInvite({ restaurantId: 'rest456', token: 'token123' })
  ).rejects.toThrow('expired');
});
```

### Test Multi-Tenant Isolation

```typescript
it('should prevent cross-tenant data access', async () => {
  const db = testEnv.authenticatedContext('user123', {
    restaurantId: 'rest456',
    role: 'admin',
  }).database();
  
  // Should fail to read different restaurant
  await assertFails(db.ref('restaurants/rest789').get());
});
```

## Resources

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
