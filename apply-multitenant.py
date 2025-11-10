#!/usr/bin/env python3
"""
Multi-Tenancy Migration Script
Automatically updates storage.ts to add ownerId filtering
"""

import re
import sys

def update_storage_file(filepath):
    """Update storage.ts with multi-tenant support"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Backup original
    with open(filepath + '.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Created backup: storage.ts.backup")
    
    # Pattern replacements for each method type
    replacements = [
        # getAllDishes
        (
            r'async getAllDishes\(\): Promise<Dish\[\]> \{\s*const snapshot = await db\.collection\(COLLECTIONS\.DISHES\)\.get\(\);',
            'async getAllDishes(ownerId: string): Promise<Dish[]> {\n    const snapshot = await db.collection(COLLECTIONS.DISHES)\n      .where(\'ownerId\', \'==\', ownerId)\n      .get();'
        ),
        # getDish
        (
            r'async getDish\(id: string\): Promise<Dish \| undefined> \{',
            'async getDish(ownerId: string, id: string): Promise<Dish | undefined> {'
        ),
        # createDish
        (
            r'async createDish\(dish: InsertDish\): Promise<Dish> \{\s*const dishData = \{ \.\.\.dish, image: dish\.image \?\? null \};',
            'async createDish(ownerId: string, dish: InsertDish): Promise<Dish> {\n    const dishData = { ...dish, ownerId, image: dish.image ?? null };'
        ),
        # updateDish
        (
            r'async updateDish\(id: string, dish: Partial<InsertDish>\): Promise<Dish \| undefined> \{',
            'async updateDish(ownerId: string, id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {'
        ),
        # deleteDish
        (
            r'async deleteDish\(id: string\): Promise<void> \{',
            'async deleteDish(ownerId: string, id: string): Promise<void> {'
        ),
        # getAllOrders
        (
            r'async getAllOrders\(\): Promise<Order\[\]> \{\s*const snapshot = await db\.collection\(COLLECTIONS\.ORDERS\)',
            'async getAllOrders(ownerId: string): Promise<Order[]> {\n    const snapshot = await db.collection(COLLECTIONS.ORDERS)\n      .where(\'ownerId\', \'==\', ownerId)'
        ),
        # getOrder
        (
            r'async getOrder\(id: string\): Promise<Order \| undefined> \{',
            'async getOrder(ownerId: string, id: string): Promise<Order | undefined> {'
        ),
        # createOrder
        (
            r'async createOrder\(order: InsertOrder\): Promise<Order> \{\s*const orderData = \{',
            'async createOrder(ownerId: string, order: InsertOrder): Promise<Order> {\n    const orderData = {\n      ownerId,'
        ),
        # updateOrderStatus
        (
            r'async updateOrderStatus\(id: string, status: string\): Promise<Order \| undefined> \{',
            'async updateOrderStatus(ownerId: string, id: string, status: string): Promise<Order | undefined> {'
        ),
        # getOrderItems
        (
            r'async getOrderItems\(orderId: string\): Promise<OrderItem\[\]> \{',
            'async getOrderItems(ownerId: string, orderId: string): Promise<OrderItem[]> {'
        ),
        # createOrderItem - Note: OrderItem doesn't have ownerId in schema
        (
            r'async createOrderItem\(item: InsertOrderItem\): Promise<OrderItem> \{',
            'async createOrderItem(ownerId: string, item: InsertOrderItem): Promise<OrderItem> {'
        ),
        # getAllCustomers
        (
            r'async getAllCustomers\(\): Promise<Customer\[\]> \{\s*const snapshot = await db\.collection\(COLLECTIONS\.CUSTOMERS\)\.get\(\);',
            'async getAllCustomers(ownerId: string): Promise<Customer[]> {\n    const snapshot = await db.collection(COLLECTIONS.CUSTOMERS)\n      .where(\'ownerId\', \'==\', ownerId)\n      .get();'
        ),
        # getCustomer
        (
            r'async getCustomer\(id: string\): Promise<Customer \| undefined> \{',
            'async getCustomer(ownerId: string, id: string): Promise<Customer | undefined> {'
        ),
        # createCustomer
        (
            r'async createCustomer\(customer: InsertCustomer\): Promise<Customer> \{\s*const customerData = \{',
            'async createCustomer(ownerId: string, customer: InsertCustomer): Promise<Customer> {\n    const customerData = {\n      ownerId,'
        ),
        # updateCustomer
        (
            r'async updateCustomer\(id: string, customer: Partial<InsertCustomer>\): Promise<Customer \| undefined> \{',
            'async updateCustomer(ownerId: string, id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {'
        ),
        # getAllTables
        (
            r'async getAllTables\(\): Promise<Table\[\]> \{\s*const snapshot = await db\.collection\(COLLECTIONS\.TABLES\)\.get\(\);',
            'async getAllTables(ownerId: string): Promise<Table[]> {\n    const snapshot = await db.collection(COLLECTIONS.TABLES)\n      .where(\'ownerId\', \'==\', ownerId)\n      .get();'
        ),
        # getTable
        (
            r'async getTable\(id: string\): Promise<Table \| undefined> \{',
            'async getTable(ownerId: string, id: string): Promise<Table | undefined> {'
        ),
        # createTable
        (
            r'async createTable\(table: InsertTable\): Promise<Table> \{',
            'async createTable(ownerId: string, table: InsertTable): Promise<Table> {'
        ),
        # updateTable
        (
            r'async updateTable\(id: string, table: Partial<InsertTable>\): Promise<Table \| undefined> \{',
            'async updateTable(ownerId: string, id: string, table: Partial<InsertTable>): Promise<Table | undefined> {'
        ),
        # deleteTable
        (
            r'async deleteTable\(id: string\): Promise<void> \{',
            'async deleteTable(ownerId: string, id: string): Promise<void> {'
        ),
        # Analytics methods
        (
            r'async getDailySales\(\): Promise<number> \{',
            'async getDailySales(ownerId: string): Promise<number> {'
        ),
        (
            r'async getOrderCount\(\): Promise<number> \{',
            'async getOrderCount(ownerId: string): Promise<number> {'
        ),
        (
            r'async getAverageTicket\(\): Promise<number> \{',
            'async getAverageTicket(ownerId: string): Promise<number> {'
        ),
        (
            r'async getTopDishes\(limit: number = 3\): Promise<',
            'async getTopDishes(ownerId: string, limit: number = 3): Promise<'
        ),
        # Ingredients
        (
            r'async getAllIngredients\(\): Promise<Ingredient\[\]> \{\s*const snapshot = await db\.collection\(COLLECTIONS\.INGREDIENTS\)\.get\(\);',
            'async getAllIngredients(ownerId: string): Promise<Ingredient[]> {\n    const snapshot = await db.collection(COLLECTIONS.INGREDIENTS)\n      .where(\'ownerId\', \'==\', ownerId)\n      .get();'
        ),
        (
            r'async getIngredient\(id: string\): Promise<Ingredient \| undefined> \{',
            'async getIngredient(ownerId: string, id: string): Promise<Ingredient | undefined> {'
        ),
        (
            r'async createIngredient\(ingredient: InsertIngredient\): Promise<Ingredient> \{',
            'async createIngredient(ownerId: string, ingredient: InsertIngredient): Promise<Ingredient> {'
        ),
        (
            r'async updateIngredient\(id: string, ingredient: Partial<InsertIngredient>\): Promise<Ingredient \| undefined> \{',
            'async updateIngredient(ownerId: string, id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined> {'
        ),
        (
            r'async deleteIngredient\(id: string\): Promise<void> \{',
            'async deleteIngredient(ownerId: string, id: string): Promise<void> {'
        ),
        (
            r'async updateIngredientStock\(id: string, quantity: number\): Promise<Ingredient \| undefined> \{',
            'async updateIngredientStock(ownerId: string, id: string, quantity: number): Promise<Ingredient | undefined> {'
        ),
        (
            r'async getLowStockIngredients\(\): Promise<Ingredient\[\]> \{',
            'async getLowStockIngredients(ownerId: string): Promise<Ingredient[]> {'
        ),
        # Dish Ingredients
        (
            r'async getDishIngredients\(dishId: string\): Promise<',
            'async getDishIngredients(ownerId: string, dishId: string): Promise<'
        ),
        (
            r'async addDishIngredient\(dishIngredient: InsertDishIngredient\): Promise<DishIngredient> \{',
            'async addDishIngredient(ownerId: string, dishIngredient: InsertDishIngredient): Promise<DishIngredient> {'
        ),
        (
            r'async removeDishIngredient\(id: string\): Promise<void> \{',
            'async removeDishIngredient(ownerId: string, id: string): Promise<void> {'
        ),
        (
            r'async updateDishIngredient\(id: string, dishIngredient: Partial<InsertDishIngredient>\): Promise<DishIngredient \| undefined> \{',
            'async updateDishIngredient(ownerId: string, id: string, dishIngredient: Partial<InsertDishIngredient>): Promise<DishIngredient | undefined> {'
        ),
        # Kitchen methods
        (
            r'async getActiveOrders\(\): Promise<Order\[\]> \{',
            'async getActiveOrders(ownerId: string): Promise<Order[]> {'
        ),
        (
            r'async updateOrderKitchenStatus\(id: string, kitchenStatus: string\): Promise<Order \| undefined> \{',
            'async updateOrderKitchenStatus(ownerId: string, id: string, kitchenStatus: string): Promise<Order | undefined> {'
        ),
        (
            r'async getKOTOrders\(\): Promise<',
            'async getKOTOrders(ownerId: string): Promise<'
        ),
    ]
    
    # Apply replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    # Add ownerId to data creation objects
    content = re.sub(
        r'const tableData = \{\s*\.\.\.table,\s*createdAt: Timestamp\.now\(\),',
        'const tableData = {\n      ...table,\n      ownerId,\n      createdAt: Timestamp.now(),',
        content
    )
    
    content = re.sub(
        r'const ingredientData = \{\s*\.\.\.ingredient,\s*createdAt: now,',
        'const ingredientData = {\n      ...ingredient,\n      ownerId,\n      createdAt: now,',
        content
    )
    
    content = re.sub(
        r'const dishIngredientData = \{\s*\.\.\.dishIngredient,\s*createdAt: Timestamp\.now\(\),',
        'const dishIngredientData = {\n      ...dishIngredient,\n      ownerId,\n      createdAt: Timestamp.now(),',
        content
    )
    
    # Add where clauses for analytics
    content = re.sub(
        r'(const snapshot = await db\.collection\(COLLECTIONS\.ORDERS\))\s*(\.where\(\'createdAt\', \'>=\', Timestamp\.fromDate\(today\)\))',
        r'\1\n      .where(\'ownerId\', \'==\', ownerId)\2',
        content
    )
    
    # Write updated content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Updated storage.ts with multi-tenant support")
    print("\n⚠️  MANUAL STEPS REQUIRED:")
    print("1. Review the changes in storage.ts")
    print("2. Add ownership verification in update/delete methods")
    print("3. Update routes.ts to pass ownerId from req.session")
    print("4. Update seed script")
    print("5. Test thoroughly")

if __name__ == '__main__':
    storage_path = 'server/storage.ts'
    try:
        update_storage_file(storage_path)
        print("\n✅ Migration script completed!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
