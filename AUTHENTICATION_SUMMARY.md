# Authentication System - Complete Implementation

## Overview
All API routes have been updated with authentication middleware to ensure only logged-in restaurant owners can access the POS system.

## Protected Routes

### Authentication Routes (Public)
- `POST /api/auth/register` - Register new restaurant owner
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout and destroy session
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PATCH /api/auth/profile` - Update profile (requires auth)

### Dishes API (Protected)
- `GET /api/dishes` - Get all dishes
- `GET /api/dishes/:id` - Get single dish
- `POST /api/dishes` - Create new dish
- `PATCH /api/dishes/:id` - Update dish
- `DELETE /api/dishes/:id` - Delete dish

### Orders API (Protected)
- `GET /api/orders` - Get all orders
- `GET /api/orders/active` - Get active orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/kitchen-status` - Update kitchen status
- `GET /api/kot` - Get KOT orders
- `GET /api/orders/:id/items` - Get order items

### Customers API (Protected)
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PATCH /api/customers/:id` - Update customer

### Tables API (Protected)
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get single table
- `POST /api/tables` - Create new table
- `PATCH /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Ingredients API (Protected)
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/low-stock` - Get low stock ingredients
- `GET /api/ingredients/:id` - Get single ingredient
- `POST /api/ingredients` - Create new ingredient
- `PATCH /api/ingredients/:id` - Update ingredient
- `DELETE /api/ingredients/:id` - Delete ingredient

### Dish Ingredients API (Protected)
- `GET /api/dishes/:id/ingredients` - Get dish ingredients
- `POST /api/dishes/:id/ingredients` - Add ingredient to dish
- `DELETE /api/dish-ingredients/:id` - Remove dish ingredient

### Analytics API (Protected)
- `GET /api/analytics` - Get analytics data

## Authentication Middleware

```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.ownerId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
```

## Security Features

1. **Session-Based Authentication**
   - Secure HTTP-only cookies
   - 7-day session expiration
   - Server-side session storage

2. **Password Security**
   - SHA-256 password hashing
   - Passwords never stored in plain text
   - Passwords never returned in API responses

3. **Route Protection**
   - All business logic routes require authentication
   - Automatic 401 response for unauthenticated requests
   - Session validation on every protected request

4. **Frontend Protection**
   - Protected routes with `ProtectedRoute` component
   - Automatic redirect to login page
   - Auth context for global auth state

## User Flow

1. **Unauthenticated User**
   - Visits any route → Redirected to `/login`
   - Can register or login

2. **Registration**
   - Fill restaurant details (name, owner, phone, address, cuisine)
   - Account created → Auto-login → Session created → Redirect to dashboard

3. **Login**
   - Enter email and password
   - Credentials validated → Session created → Redirect to dashboard

4. **Authenticated User**
   - Access all protected routes
   - Profile visible in top-right corner
   - Can view/edit profile
   - Can logout

5. **Logout**
   - Click logout → Session destroyed → Redirect to login

## Database Schema

### Restaurant Owner
```typescript
{
  id: string;
  email: string;
  password: string; // SHA-256 hashed
  restaurantName: string;
  ownerName: string;
  phone: string;
  address: string;
  cuisine: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing the System

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Register a new account**
   - Navigate to http://localhost:5000/login
   - Click "Register" tab
   - Fill in all restaurant details
   - Submit form

3. **Test protected routes**
   - Try accessing dashboard → Should work
   - Logout
   - Try accessing dashboard → Should redirect to login

4. **Test profile management**
   - Login
   - Click avatar in top-right
   - Click "Profile"
   - Update restaurant information
   - Changes saved to database

## Environment Variables

Make sure to set in `.env`:
```
SESSION_SECRET=your-secret-key-here
```

For production, use a strong random secret key.

## Next Steps

The authentication system is fully functional. All routes are now protected and require a valid session. Restaurant owners must register/login to access the POS system.
