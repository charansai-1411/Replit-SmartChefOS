import { storage } from "./storage";
import { initializeFirebase } from "./firebase";
import { COLLECTIONS } from "@shared/schema";

const db = initializeFirebase();

/**
 * Storage Context Wrapper
 * Adds ownerId filtering to all storage operations
 * This ensures data isolation between restaurant owners
 */
export class StorageContext {
  constructor(private ownerId: string) {}

  // Helper to add ownerId to Firestore queries
  private getOwnerQuery(collectionName: string) {
    return db.collection(collectionName).where('ownerId', '==', this.ownerId);
  }

  // Helper to add ownerId to data
  private addOwner<T>(data: T): T & { ownerId: string } {
    return { ...data, ownerId: this.ownerId };
  }

  // Dishes
  async getAllDishes() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.DISHES).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getDish(id: string) {
    const doc = await db.collection(COLLECTIONS.DISHES).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    // Verify ownership
    if (data?.ownerId !== this.ownerId) return undefined;
    return { id: doc.id, ...data };
  }

  async createDish(dish: any) {
    const dishData = this.addOwner({ ...dish, image: dish.image ?? null });
    const docRef = await db.collection(COLLECTIONS.DISHES).add(dishData);
    return { id: docRef.id, ...dishData };
  }

  async updateDish(id: string, dish: any) {
    const docRef = db.collection(COLLECTIONS.DISHES).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return undefined;
    
    // Verify ownership
    const data = doc.data();
    if (data?.ownerId !== this.ownerId) {
      throw new Error('Unauthorized');
    }
    
    await docRef.update(dish);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async deleteDish(id: string) {
    const doc = await db.collection(COLLECTIONS.DISHES).doc(id).get();
    if (doc.exists && doc.data()?.ownerId === this.ownerId) {
      await db.collection(COLLECTIONS.DISHES).doc(id).delete();
    }
  }

  // Orders
  async getAllOrders() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  }

  async getOrder(id: string) {
    const doc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    if (data?.ownerId !== this.ownerId) return undefined;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  async createOrder(order: any) {
    const orderData = this.addOwner({
      ...order,
      customerId: order.customerId || null,
      tableNumber: order.tableNumber || null,
      createdAt: new Date(),
    });
    const docRef = await db.collection(COLLECTIONS.ORDERS).add(orderData);
    return {
      id: docRef.id,
      ...orderData,
    };
  }

  async updateOrderStatus(id: string, status: string) {
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update({ status });
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  }

  async updateOrderKitchenStatus(id: string, kitchenStatus: string) {
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update({ kitchenStatus });
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  }

  async getActiveOrders() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS)
      .where('status', 'in', ['pending', 'confirmed', 'preparing'])
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  }

  async getKOTOrders() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS)
      .where('kitchenStatus', 'in', ['pending', 'sent', 'preparing'])
      .orderBy('createdAt', 'asc')
      .get();
    
    const orders = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const items = await this.getOrderItems(doc.id);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          items,
        };
      })
    );
    
    return orders;
  }

  // Order Items (no ownerId needed, verified through order)
  async getOrderItems(orderId: string) {
    // First verify the order belongs to this owner
    const order = await this.getOrder(orderId);
    if (!order) return [];
    
    const snapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', orderId)
      .get();
    
    const items = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const dish = await this.getDish(data.dishId);
        return {
          id: doc.id,
          ...data,
          dish,
        };
      })
    );
    
    return items;
  }

  async createOrderItem(item: any) {
    const itemData = { ...item, notes: item.notes || null };
    const docRef = await db.collection(COLLECTIONS.ORDER_ITEMS).add(itemData);
    return { id: docRef.id, ...itemData };
  }

  // Customers
  async getAllCustomers() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.CUSTOMERS).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastVisit: data.lastVisit?.toDate() || null,
      };
    });
  }

  async getCustomer(id: string) {
    const doc = await db.collection(COLLECTIONS.CUSTOMERS).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    if (data?.ownerId !== this.ownerId) return undefined;
    return {
      id: doc.id,
      ...data,
      lastVisit: data.lastVisit?.toDate() || null,
    };
  }

  async createCustomer(customer: any) {
    const customerData = this.addOwner({
      ...customer,
      lastVisit: customer.lastVisit || null,
    });
    const docRef = await db.collection(COLLECTIONS.CUSTOMERS).add(customerData);
    return {
      id: docRef.id,
      name: customer.name,
      phone: customer.phone,
      lifetimeValue: customer.lifetimeValue,
      lastVisit: customer.lastVisit || null,
    };
  }

  async updateCustomer(id: string, customer: any) {
    const docRef = db.collection(COLLECTIONS.CUSTOMERS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update(customer);
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      lastVisit: data?.lastVisit?.toDate() || null,
    };
  }

  // Tables
  async getAllTables() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.TABLES).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  }

  async getTable(id: string) {
    const doc = await db.collection(COLLECTIONS.TABLES).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    if (data?.ownerId !== this.ownerId) return undefined;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  async createTable(table: any) {
    const tableData = this.addOwner({
      ...table,
      createdAt: new Date(),
    });
    const docRef = await db.collection(COLLECTIONS.TABLES).add(tableData);
    return {
      id: docRef.id,
      ...tableData,
    };
  }

  async updateTable(id: string, table: any) {
    const docRef = db.collection(COLLECTIONS.TABLES).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update(table);
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  }

  async deleteTable(id: string) {
    const doc = await db.collection(COLLECTIONS.TABLES).doc(id).get();
    if (doc.exists && doc.data()?.ownerId === this.ownerId) {
      await db.collection(COLLECTIONS.TABLES).doc(id).delete();
    }
  }

  // Ingredients
  async getAllIngredients() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.INGREDIENTS).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  }

  async getIngredient(id: string) {
    const doc = await db.collection(COLLECTIONS.INGREDIENTS).doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    if (data?.ownerId !== this.ownerId) return undefined;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  async createIngredient(ingredient: any) {
    const now = new Date();
    const ingredientData = this.addOwner({
      ...ingredient,
      createdAt: now,
      updatedAt: now,
    });
    const docRef = await db.collection(COLLECTIONS.INGREDIENTS).add(ingredientData);
    return {
      id: docRef.id,
      ...ingredientData,
    };
  }

  async updateIngredient(id: string, ingredient: any) {
    const docRef = db.collection(COLLECTIONS.INGREDIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update({ ...ingredient, updatedAt: new Date() });
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  }

  async deleteIngredient(id: string) {
    const doc = await db.collection(COLLECTIONS.INGREDIENTS).doc(id).get();
    if (doc.exists && doc.data()?.ownerId === this.ownerId) {
      await db.collection(COLLECTIONS.INGREDIENTS).doc(id).delete();
    }
  }

  async updateIngredientStock(id: string, quantity: number) {
    const docRef = db.collection(COLLECTIONS.INGREDIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    const data = doc.data();
    const currentStock = parseFloat(data?.currentStock || '0');
    const newStock = (currentStock + quantity).toString();
    
    await docRef.update({
      currentStock: newStock,
      updatedAt: new Date(),
    });
    
    const updated = await docRef.get();
    const updatedData = updated.data();
    return {
      id: updated.id,
      ...updatedData,
      createdAt: updatedData?.createdAt?.toDate() || new Date(),
      updatedAt: updatedData?.updatedAt?.toDate() || new Date(),
    };
  }

  async getLowStockIngredients() {
    const snapshot = await this.getOwnerQuery(COLLECTIONS.INGREDIENTS).get();
    const ingredients = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    
    return ingredients.filter((ing: any) => 
      parseFloat(ing.currentStock) <= parseFloat(ing.minLevel)
    );
  }

  // Dish Ingredients
  async getDishIngredients(dishId: string) {
    // Verify dish ownership first
    const dish = await this.getDish(dishId);
    if (!dish) return [];
    
    const snapshot = await db.collection(COLLECTIONS.DISH_INGREDIENTS)
      .where('dishId', '==', dishId)
      .get();
    
    const dishIngredients = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const ingredient = await this.getIngredient(data.ingredientId);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          ingredient,
        };
      })
    );
    
    return dishIngredients.filter(di => di.ingredient);
  }

  async addDishIngredient(dishIngredient: any) {
    const dishIngredientData = this.addOwner({
      ...dishIngredient,
      createdAt: new Date(),
    });
    const docRef = await db.collection(COLLECTIONS.DISH_INGREDIENTS).add(dishIngredientData);
    return {
      id: docRef.id,
      ...dishIngredientData,
    };
  }

  async removeDishIngredient(id: string) {
    const doc = await db.collection(COLLECTIONS.DISH_INGREDIENTS).doc(id).get();
    if (doc.exists && doc.data()?.ownerId === this.ownerId) {
      await db.collection(COLLECTIONS.DISH_INGREDIENTS).doc(id).delete();
    }
  }

  async updateDishIngredient(id: string, dishIngredient: any) {
    const docRef = db.collection(COLLECTIONS.DISH_INGREDIENTS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.ownerId !== this.ownerId) return undefined;
    
    await docRef.update(dishIngredient);
    const updated = await docRef.get();
    const data = updated.data();
    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  }

  // Analytics
  async getDailySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all orders for this owner
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS).get();
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      // Filter by today and status in memory
      if (createdAt >= today && data.status === 'served') {
        total += parseFloat(data.total || '0');
      }
    });
    
    return total;
  }

  async getOrderCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all orders for this owner
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS).get();
    
    let count = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      // Filter by today in memory
      if (createdAt >= today) {
        count++;
      }
    });
    
    return count;
  }

  async getAverageTicket() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all orders for this owner
    const snapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS).get();
    
    let total = 0;
    let count = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      // Filter by today and status in memory
      if (createdAt >= today && data.status === 'served') {
        total += parseFloat(data.total || '0');
        count++;
      }
    });
    
    return count > 0 ? total / count : 0;
  }

  async getTopDishes(limit: number = 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all orders for this owner
    const ordersSnapshot = await this.getOwnerQuery(COLLECTIONS.ORDERS).get();
    
    // Filter by today in memory
    const orderIds = ordersSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        return createdAt >= today;
      })
      .map(doc => doc.id);
    
    if (orderIds.length === 0) return [];
    
    const dishCounts: Record<string, number> = {};
    
    for (const orderId of orderIds) {
      const itemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', '==', orderId)
        .get();
      
      itemsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        dishCounts[data.dishId] = (dishCounts[data.dishId] || 0) + data.quantity;
      });
    }
    
    const topDishIds = Object.entries(dishCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([dishId]) => dishId);
    
    const topDishes = await Promise.all(
      topDishIds.map(async (dishId) => {
        const dish: any = await this.getDish(dishId);
        return {
          dishId,
          name: dish?.name || 'Unknown',
          image: dish?.image || null,
          orders: dishCounts[dishId],
        };
      })
    );
    
    return topDishes;
  }
}

// Factory function to create storage context
export function createStorageContext(ownerId: string) {
  return new StorageContext(ownerId);
}
