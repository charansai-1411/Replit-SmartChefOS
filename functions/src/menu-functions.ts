import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Order creation handler - validates totals and updates customer lifetime value
export const onOrderCreate = functions.firestore.document('orders/{orderId}').onCreate(async (snap: any, context: any) => {
  const orderId = context.params.orderId;
  const orderData = snap.data();
  
  if (!orderData) {
    functions.logger.error(`Order ${orderId} has no data`);
    return;
  }

  functions.logger.info(`Processing new order: ${orderId}`);

  try {
    // Validate order totals
    const expectedGrandTotal = (orderData.itemsTotalMinor || 0) + 
                              (orderData.taxTotalMinor || 0) - 
                              (orderData.discountTotalMinor || 0);

    if (Math.abs(orderData.grandTotalMinor - expectedGrandTotal) > 1) { // Allow 1 paise tolerance for rounding
      functions.logger.error(`Order ${orderId} total validation failed. Expected: ${expectedGrandTotal}, Got: ${orderData.grandTotalMinor}`);
      
      // Update order with validation error
      await snap.ref.update({
        validationError: 'Total calculation mismatch',
        status: 'validation_failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }

    // Update customer lifetime value if customer exists
    if (orderData.customerId && orderData.status !== 'cancelled') {
      const customerRef = db.collection('customers').doc(orderData.customerId);
      
      await db.runTransaction(async (transaction: any) => {
        const customerDoc = await transaction.get(customerRef);
        
        if (customerDoc.exists) {
          const customerData = customerDoc.data()!;
          const currentLifetimeValue = customerData.lifetimeValueMinor || 0;
          const newLifetimeValue = currentLifetimeValue + orderData.grandTotalMinor;
          
          transaction.update(customerRef, {
            lifetimeValueMinor: newLifetimeValue,
            lastVisit: admin.firestore.FieldValue.serverTimestamp(),
            totalOrders: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          functions.logger.info(`Updated customer ${orderData.customerId} lifetime value: ${currentLifetimeValue} → ${newLifetimeValue}`);
        }
      });
    }

    // Log successful processing
    functions.logger.info(`Order ${orderId} processed successfully`);

  } catch (error) {
    functions.logger.error(`Error processing order ${orderId}:`, error);
    
    // Update order with processing error
    await snap.ref.update({
      processingError: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
});

// Order update handler - handles cancellations and adjustments
export const onOrderUpdate = functions.firestore.document('orders/{orderId}').onUpdate(async (change: any, context: any) => {
  const orderId = context.params.orderId;
  const beforeData = change.before.data();
  const afterData = change.after.data();
  
  if (!beforeData || !afterData) {
    functions.logger.error(`Order ${orderId} missing before/after data`);
    return;
  }

  // Check if order was cancelled
  if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
    functions.logger.info(`Order ${orderId} was cancelled, reverting customer lifetime value`);
    
    try {
      if (afterData.customerId) {
        const customerRef = db.collection('customers').doc(afterData.customerId);
        
        await db.runTransaction(async (transaction: any) => {
          const customerDoc = await transaction.get(customerRef);
          
          if (customerDoc.exists) {
            const customerData = customerDoc.data()!;
            const currentLifetimeValue = customerData.lifetimeValueMinor || 0;
            const revertedLifetimeValue = Math.max(0, currentLifetimeValue - afterData.grandTotalMinor);
            
            transaction.update(customerRef, {
              lifetimeValueMinor: revertedLifetimeValue,
              totalOrders: admin.firestore.FieldValue.increment(-1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            functions.logger.info(`Reverted customer ${afterData.customerId} lifetime value: ${currentLifetimeValue} → ${revertedLifetimeValue}`);
          }
        });
      }
    } catch (error) {
      functions.logger.error(`Error reverting customer lifetime value for cancelled order ${orderId}:`, error);
    }
  }

  // Check if order total was adjusted
  if (beforeData.grandTotalMinor !== afterData.grandTotalMinor && afterData.status !== 'cancelled') {
    functions.logger.info(`Order ${orderId} total adjusted: ${beforeData.grandTotalMinor} → ${afterData.grandTotalMinor}`);
    
    try {
      if (afterData.customerId) {
        const customerRef = db.collection('customers').doc(afterData.customerId);
        const adjustment = afterData.grandTotalMinor - beforeData.grandTotalMinor;
        
        await db.runTransaction(async (transaction: any) => {
          const customerDoc = await transaction.get(customerRef);
          
          if (customerDoc.exists) {
            const customerData = customerDoc.data()!;
            const currentLifetimeValue = customerData.lifetimeValueMinor || 0;
            const adjustedLifetimeValue = Math.max(0, currentLifetimeValue + adjustment);
            
            transaction.update(customerRef, {
              lifetimeValueMinor: adjustedLifetimeValue,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            functions.logger.info(`Adjusted customer ${afterData.customerId} lifetime value by ${adjustment}: ${currentLifetimeValue} → ${adjustedLifetimeValue}`);
          }
        });
      }
    } catch (error) {
      functions.logger.error(`Error adjusting customer lifetime value for order ${orderId}:`, error);
    }
  }
});

// Bulk dish update function
export const bulkUpdateDishAvailability = functions.https.onCall(async (data: any, context: any) => {
  const { dishIds, platform, enabled, restaurantId } = data;
  
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate restaurant membership
  const userRestaurantIds = context.auth.token.restaurantIds || [];
  if (!userRestaurantIds.includes(restaurantId)) {
    throw new functions.https.HttpsError('permission-denied', 'User not authorized for this restaurant');
  }

  // Validate input
  if (!Array.isArray(dishIds) || dishIds.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'dishIds must be a non-empty array');
  }

  if (!['restaurant', 'zomato', 'swiggy', 'other'].includes(platform)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid platform specified');
  }

  if (typeof enabled !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'enabled must be a boolean');
  }

  if (dishIds.length > 500) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot update more than 500 dishes at once');
  }

  functions.logger.info(`Bulk updating ${dishIds.length} dishes for platform ${platform} to ${enabled}`);

  try {
    // Process in batches of 500 (Firestore batch limit)
    const BATCH_SIZE = 500;
    const results = { updated: 0, errors: 0 };

    for (let i = 0; i < dishIds.length; i += BATCH_SIZE) {
      const batchDishIds = dishIds.slice(i, i + BATCH_SIZE);
      const batch = db.batch();

      for (const dishId of batchDishIds) {
        try {
          const dishRef = db.collection('dishes').doc(dishId);
          
          // Verify dish belongs to the restaurant
          const dishDoc = await dishRef.get();
          if (!dishDoc.exists) {
            functions.logger.warn(`Dish ${dishId} not found`);
            results.errors++;
            continue;
          }

          const dishData = dishDoc.data()!;
          if (dishData.restaurantId !== restaurantId) {
            functions.logger.warn(`Dish ${dishId} does not belong to restaurant ${restaurantId}`);
            results.errors++;
            continue;
          }

          // Update availability
          const currentAvailability = dishData.availability || {};
          const newAvailability = {
            ...currentAvailability,
            [platform]: enabled
          };

          batch.update(dishRef, {
            availability: newAvailability,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          results.updated++;
        } catch (error) {
          functions.logger.error(`Error preparing update for dish ${dishId}:`, error);
          results.errors++;
        }
      }

      // Commit batch
      await batch.commit();
      functions.logger.info(`Committed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    functions.logger.info(`Bulk update completed: ${results.updated} updated, ${results.errors} errors`);
    return results;

  } catch (error) {
    functions.logger.error('Bulk update failed:', error);
    throw new functions.https.HttpsError('internal', 'Bulk update failed');
  }
});

// Validate dish data function
export const validateDishData = functions.https.onCall(async (data: any, context: any) => {
  const { dishData } = data;
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const errors: string[] = [];

    // Validate required fields
    if (!dishData.name || typeof dishData.name !== 'string') {
      errors.push('Name is required and must be a string');
    }

    if (!dishData.restaurantId || typeof dishData.restaurantId !== 'string') {
      errors.push('Restaurant ID is required and must be a string');
    }

    if (typeof dishData.priceMinor !== 'number' || dishData.priceMinor < 0) {
      errors.push('Price must be a non-negative number in minor units');
    }

    if (!dishData.category || typeof dishData.category !== 'string') {
      errors.push('Category is required and must be a string');
    }

    // Validate availability map
    if (!dishData.availability || typeof dishData.availability !== 'object') {
      errors.push('Availability map is required');
    } else {
      const requiredPlatforms = ['restaurant', 'zomato', 'swiggy', 'other'];
      for (const platform of requiredPlatforms) {
        if (typeof dishData.availability[platform] !== 'boolean') {
          errors.push(`Availability.${platform} must be a boolean`);
        }
      }
    }

    // Validate images array
    if (dishData.images && !Array.isArray(dishData.images)) {
      errors.push('Images must be an array');
    } else if (dishData.images) {
      if (dishData.images.length > 10) {
        errors.push('Maximum 10 images allowed');
      }
      for (const image of dishData.images) {
        if (typeof image !== 'string' || !image.startsWith('https://')) {
          errors.push('All images must be valid HTTPS URLs');
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };

  } catch (error) {
    functions.logger.error('Dish validation failed:', error);
    throw new functions.https.HttpsError('internal', 'Validation failed');
  }
});
