import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  validateEmail,
  validatePhone,
  validateRole,
  validateCountry,
  validateCurrency,
  validateTimezone,
  sanitizeString,
  generateSlug,
} from './validation';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Create a new restaurant and set the caller as admin
 */
export const createRestaurant = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const uid = context.auth.uid;
  const {
    name,
    country = 'IN',
    currency = 'INR',
    timezone = 'Asia/Kolkata',
    ownerName,
  } = data;

  // Validation
  if (!name || name.length < 3) {
    throw new functions.https.HttpsError('invalid-argument', 'Restaurant name must be at least 3 characters');
  }

  if (!validateCountry(country)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid country code');
  }

  if (!validateCurrency(currency)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid currency code');
  }

  if (!validateTimezone(timezone)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid timezone');
  }

  // Check if user already has a restaurant
  const userSnapshot = await admin.database().ref(`/users/${uid}`).once('value');
  const existingUser = userSnapshot.val();
  
  if (existingUser && existingUser.restaurantId) {
    throw new functions.https.HttpsError('already-exists', 'User already belongs to a restaurant');
  }

  // Generate unique restaurant ID
  const rid = admin.database().ref().push().key as string;
  const now = Date.now();

  // Generate slug from name
  const slug = generateSlug(name);
  
  // Check if slug is available
  const slugSnapshot = await admin.database().ref(`/slugs/${slug}`).once('value');
  if (slugSnapshot.exists()) {
    // Add random suffix if slug exists
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newSlug = `${slug}-${randomSuffix}`;
    await admin.database().ref(`/slugs/${newSlug}`).set(rid);
  } else {
    await admin.database().ref(`/slugs/${slug}`).set(rid);
  }

  // Prepare multi-path update
  const updates: any = {};
  
  // Create restaurant
  updates[`/restaurants/${rid}`] = {
    name: sanitizeString(name),
    country,
    currency,
    timezone,
    createdBy: uid,
    createdAt: now,
    settings: {
      dineIn: true,
      takeaway: true,
      delivery: false,
    },
  };

  // Create/update user
  updates[`/users/${uid}`] = {
    name: sanitizeString(ownerName || context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Owner'),
    email: context.auth.token.email || null,
    phone: context.auth.token.phone_number || null,
    restaurantId: rid,
    role: 'admin',
    status: 'active',
    createdAt: existingUser?.createdAt || now,
  };

  // Link user to restaurant
  updates[`/restaurantUsers/${rid}/${uid}`] = {
    role: 'admin',
    status: 'active',
    addedAt: now,
    addedBy: uid,
  };

  // Execute atomic update
  await admin.database().ref().update(updates);

  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, {
    restaurantId: rid,
    role: 'admin',
  });

  return {
    restaurantId: rid,
    message: 'Restaurant created successfully',
  };
});

/**
 * Invite staff member to restaurant
 */
export const inviteStaff = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Authorization check
  const callerClaims = context.auth.token;
  if (!callerClaims.restaurantId || callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can invite staff');
  }

  const rid = callerClaims.restaurantId;
  const { emailOrPhone, role } = data;

  // Validation
  if (!emailOrPhone) {
    throw new functions.https.HttpsError('invalid-argument', 'Email or phone required');
  }

  if (!validateRole(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
  }

  if (role === 'admin') {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot invite another admin. Transfer ownership instead.');
  }

  // Validate email or phone format
  const isEmail = emailOrPhone.includes('@');
  if (isEmail && !validateEmail(emailOrPhone)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
  } else if (!isEmail && !validatePhone(emailOrPhone)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid phone format (use E.164: +1234567890)');
  }

  // Generate invite token
  const token = admin.database().ref().push().key as string;
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

  const inviteObj = {
    emailOrPhone,
    role,
    invitedBy: context.auth.uid,
    expiresAt,
    consumedBy: null,
    createdAt: Date.now(),
  };

  await admin.database().ref(`/invites/${rid}/${token}`).set(inviteObj);

  // TODO: Send email or SMS with invite link
  // Integration with SendGrid/Twilio would go here
  // const inviteLink = `https://yourdomain.com/accept-invite?rid=${rid}&token=${token}`;

  return {
    token,
    expiresAt,
    message: 'Invite created successfully',
  };
});

/**
 * Accept staff invite
 */
export const acceptInvite = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { restaurantId, token } = data;

  if (!restaurantId || !token) {
    throw new functions.https.HttpsError('invalid-argument', 'Restaurant ID and token required');
  }

  // Fetch invite
  const inviteSnapshot = await admin.database().ref(`/invites/${restaurantId}/${token}`).once('value');
  const invite = inviteSnapshot.val();

  if (!invite) {
    throw new functions.https.HttpsError('not-found', 'Invite not found');
  }

  if (invite.expiresAt < Date.now()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Invite has expired');
  }

  if (invite.consumedBy) {
    throw new functions.https.HttpsError('already-exists', 'Invite already used');
  }

  // Check if user already belongs to a restaurant
  const uid = context.auth.uid;
  const userSnapshot = await admin.database().ref(`/users/${uid}`).once('value');
  const existingUser = userSnapshot.val();

  if (existingUser && existingUser.restaurantId && existingUser.restaurantId !== restaurantId) {
    throw new functions.https.HttpsError('failed-precondition', 'User already belongs to another restaurant');
  }

  const now = Date.now();
  const updates: any = {};

  // Link user to restaurant
  updates[`/restaurantUsers/${restaurantId}/${uid}`] = {
    role: invite.role,
    status: 'active',
    addedAt: now,
    addedBy: invite.invitedBy,
  };

  // Update user record
  updates[`/users/${uid}/restaurantId`] = restaurantId;
  updates[`/users/${uid}/role`] = invite.role;
  updates[`/users/${uid}/status`] = 'active';
  
  if (!existingUser) {
    updates[`/users/${uid}/name`] = context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Staff';
    updates[`/users/${uid}/email`] = context.auth.token.email || null;
    updates[`/users/${uid}/phone`] = context.auth.token.phone_number || null;
    updates[`/users/${uid}/createdAt`] = now;
  }

  // Mark invite as consumed
  updates[`/invites/${restaurantId}/${token}/consumedBy`] = uid;
  updates[`/invites/${restaurantId}/${token}/consumedAt`] = now;

  // Execute atomic update
  await admin.database().ref().update(updates);

  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, {
    restaurantId,
    role: invite.role,
  });

  return {
    success: true,
    restaurantId,
    role: invite.role,
    message: 'Successfully joined restaurant',
  };
});

/**
 * Update user role (admin only)
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Authorization check
  const callerClaims = context.auth.token;
  if (!callerClaims.restaurantId || callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can update roles');
  }

  const { targetUserId, newRole } = data;
  const rid = callerClaims.restaurantId;

  if (!targetUserId || !newRole) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID and new role required');
  }

  if (!validateRole(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
  }

  // Cannot change own role
  if (targetUserId === context.auth.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot change your own role');
  }

  // Check if target user belongs to same restaurant
  const targetUserSnapshot = await admin.database().ref(`/restaurantUsers/${rid}/${targetUserId}`).once('value');
  if (!targetUserSnapshot.exists()) {
    throw new functions.https.HttpsError('not-found', 'User not found in this restaurant');
  }

  const now = Date.now();
  const updates: any = {};

  updates[`/restaurantUsers/${rid}/${targetUserId}/role`] = newRole;
  updates[`/restaurantUsers/${rid}/${targetUserId}/updatedAt`] = now;
  updates[`/restaurantUsers/${rid}/${targetUserId}/updatedBy`] = context.auth.uid;
  updates[`/users/${targetUserId}/role`] = newRole;

  await admin.database().ref().update(updates);

  // Update custom claims
  await admin.auth().setCustomUserClaims(targetUserId, {
    restaurantId: rid,
    role: newRole,
  });

  return {
    success: true,
    message: 'Role updated successfully',
  };
});

/**
 * Update restaurant profile (admin/manager only)
 */
export const updateRestaurantProfile = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Authorization check
  const callerClaims = context.auth.token;
  if (!callerClaims.restaurantId) {
    throw new functions.https.HttpsError('permission-denied', 'No restaurant associated');
  }

  if (callerClaims.role !== 'admin' && callerClaims.role !== 'manager') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and managers can update profile');
  }

  const rid = callerClaims.restaurantId;
  const updates: any = {};
  const now = Date.now();

  // Allowed fields to update
  const allowedFields = [
    'name', 'legalName', 'gstin', 'contact', 'address', 'settings', 'logoUrl'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'name' && typeof data[field] === 'string') {
        updates[`/restaurants/${rid}/${field}`] = sanitizeString(data[field]);
      } else {
        updates[`/restaurants/${rid}/${field}`] = data[field];
      }
    }
  }

  updates[`/restaurants/${rid}/updatedAt`] = now;
  updates[`/restaurants/${rid}/updatedBy`] = context.auth.uid;

  await admin.database().ref().update(updates);

  return {
    success: true,
    message: 'Restaurant profile updated successfully',
  };
});

/**
 * Deactivate user (admin only)
 */
export const deactivateUser = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Authorization check
  const callerClaims = context.auth.token;
  if (!callerClaims.restaurantId || callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can deactivate users');
  }

  const { targetUserId } = data;
  const rid = callerClaims.restaurantId;

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID required');
  }

  if (targetUserId === context.auth.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot deactivate yourself');
  }

  const now = Date.now();
  const updates: any = {};

  updates[`/restaurantUsers/${rid}/${targetUserId}/status`] = 'disabled';
  updates[`/restaurantUsers/${rid}/${targetUserId}/deactivatedAt`] = now;
  updates[`/restaurantUsers/${rid}/${targetUserId}/deactivatedBy`] = context.auth.uid;
  updates[`/users/${targetUserId}/status`] = 'disabled';

  await admin.database().ref().update(updates);

  // Remove custom claims
  await admin.auth().setCustomUserClaims(targetUserId, {
    restaurantId: null,
    role: null,
  });

  return {
    success: true,
    message: 'User deactivated successfully',
  };
});

/**
 * Revoke invite (admin only)
 */
export const revokeInvite = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Authorization check
  const callerClaims = context.auth.token;
  if (!callerClaims.restaurantId || callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can revoke invites');
  }

  const { token } = data;
  const rid = callerClaims.restaurantId;

  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Token required');
  }

  await admin.database().ref(`/invites/${rid}/${token}`).remove();

  return {
    success: true,
    message: 'Invite revoked successfully',
  };
});
