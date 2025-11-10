# Login Redirect Fix

## Problem
After logging in or registering, users were not being redirected to the main application (dashboard).

## Root Cause
The authentication state in `AuthContext` was not being updated after successful login/registration because:
1. The profile query was cached and not refetched after login
2. The navigation happened before the auth state could update

## Solution Applied

### 1. Login Page Updates (`client/src/pages/Login.tsx`)

**Added Query Invalidation:**
```typescript
onSuccess: () => {
  // Invalidate and refetch profile to update auth state
  queryClient.invalidateQueries({ queryKey: ["profile"] });
  toast({
    title: "Login successful",
    description: "Welcome back!",
  });
  // Small delay to allow query to refetch
  setTimeout(() => {
    setLocation("/dashboard");
  }, 100);
}
```

**Added Redirect Check for Already Logged-in Users:**
```typescript
// Check if already logged in
const { data: profile } = useQuery({
  queryKey: ["profile"],
  queryFn: async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Not authenticated");
    return response.json();
  },
  retry: false,
});

// Redirect if already authenticated
useEffect(() => {
  if (profile) {
    setLocation("/dashboard");
  }
}, [profile, setLocation]);
```

### 2. AuthContext Updates (`client/src/contexts/AuthContext.tsx`)

**Added Refetch Configuration:**
```typescript
const { data: profile, isLoading } = useQuery<OwnerProfile>({
  queryKey: ["profile"],
  queryFn: async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },
  retry: false,
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnMount: true,      // ← Added
  refetchOnWindowFocus: false, // ← Added
});
```

## How It Works Now

### Login Flow:
1. User submits login form
2. API call to `/api/auth/login` succeeds
3. Server creates session with `ownerId`
4. Client receives success response
5. **Query invalidation triggers profile refetch**
6. Small 100ms delay allows refetch to complete
7. Navigation to `/dashboard`
8. `ProtectedRoute` checks auth state
9. Auth state is now updated with profile data
10. User sees dashboard

### Registration Flow:
Same as login flow, but calls `/api/auth/register`

### Already Logged-in Check:
1. User navigates to `/login`
2. Login component queries profile
3. If profile exists, immediately redirect to `/dashboard`
4. Prevents logged-in users from seeing login page

## Testing

1. **Test Login:**
   ```
   1. Go to http://localhost:5000/login
   2. Enter credentials
   3. Click "Login"
   4. Should redirect to dashboard
   ```

2. **Test Registration:**
   ```
   1. Go to http://localhost:5000/login
   2. Click "Register" tab
   3. Fill in all fields
   4. Click "Create Account"
   5. Should redirect to dashboard
   ```

3. **Test Already Logged-in:**
   ```
   1. Login successfully
   2. Try to navigate to /login
   3. Should immediately redirect to /dashboard
   ```

4. **Test Logout:**
   ```
   1. Click avatar in top-right
   2. Click "Logout"
   3. Should redirect to /login
   4. Try to access /dashboard
   5. Should redirect back to /login
   ```

## Key Changes Summary

- ✅ Added `queryClient.invalidateQueries()` after login/register
- ✅ Added 100ms delay before navigation to allow refetch
- ✅ Added `refetchOnMount: true` to AuthContext query
- ✅ Added redirect check in Login component for already authenticated users
- ✅ Imported `useQueryClient`, `useQuery`, and `useEffect` where needed

## Session Configuration

Sessions are configured in `server/index.ts`:
- Secret key from env or default
- 7-day expiration
- HTTP-only cookies
- Secure in production

Make sure `.env` has:
```
SESSION_SECRET=your-secret-key-here
```

## Result

Users can now successfully:
- ✅ Register and be automatically logged in
- ✅ Login and access the dashboard
- ✅ Stay logged in across page refreshes
- ✅ Be redirected away from login if already authenticated
- ✅ Logout and be redirected to login
