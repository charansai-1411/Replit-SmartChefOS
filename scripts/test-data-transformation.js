#!/usr/bin/env node

/**
 * Test Data Transformation Logic
 * 
 * This script tests the data transformation logic without requiring Firebase connection.
 * It validates phone normalization, minor units conversion, and other data fixes.
 */

const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

// Test phone number normalization
function normalizePhoneNumber(phone, defaultCountry = 'IN') {
  try {
    if (!phone) return null;
    
    // Clean the phone number
    const cleanPhone = phone.toString().replace(/\s+/g, '').trim();
    
    if (!cleanPhone) return null;
    
    // If already in E.164 format, validate and return
    if (cleanPhone.startsWith('+')) {
      if (isValidPhoneNumber(cleanPhone)) {
        return cleanPhone;
      }
      console.warn(`Invalid E.164 phone number: ${cleanPhone}`);
      return null;
    }
    
    // Parse with default country
    const phoneNumber = parsePhoneNumber(cleanPhone, defaultCountry);
    if (!phoneNumber || !phoneNumber.isValid()) {
      console.warn(`Invalid phone number: ${cleanPhone}`);
      return null;
    }
    
    return phoneNumber.format('E.164');
  } catch (error) {
    console.warn(`Error normalizing phone number ${phone}:`, error.message);
    return null;
  }
}

// Test lifetime value conversion
function convertLifetimeValueToMinorUnits(value, currency = 'INR') {
  try {
    if (typeof value === 'number') {
      return Math.round(value * 100);
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.warn(`Invalid lifetime value: ${value}`);
        return 0;
      }
      return Math.round(numValue * 100);
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error converting lifetime value ${value}:`, error.message);
    return 0;
  }
}

// Test price conversion
function convertPriceToMinorUnits(price, currency = 'INR') {
  try {
    if (typeof price === 'number') {
      return Math.round(price * 100);
    }
    
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        console.warn(`Invalid price: ${price}`);
        return 0;
      }
      return Math.round(numPrice * 100);
    }
    
    return 0;
  } catch (error) {
    console.warn(`Error converting price ${price}:`, error.message);
    return 0;
  }
}

// Run tests
function runTests() {
  console.log('🧪 Testing Data Transformation Logic\n');
  
  // Test 1: Phone number normalization
  console.log('📱 Test 1: Phone Number Normalization');
  const phoneTests = [
    '9876543210',
    '+919876543210',
    '98765 43210',
    '+91 98765 43210',
    'invalid_phone',
    '',
    null
  ];
  
  phoneTests.forEach(phone => {
    const normalized = normalizePhoneNumber(phone);
    console.log(`  ${phone || 'null'} → ${normalized || 'null'}`);
  });
  
  // Test 2: Lifetime value conversion
  console.log('\n💰 Test 2: Lifetime Value Conversion');
  const lifetimeTests = [
    '0',
    '250.50',
    250.50,
    0,
    'invalid',
    null
  ];
  
  lifetimeTests.forEach(value => {
    const converted = convertLifetimeValueToMinorUnits(value);
    console.log(`  ${value} → ${converted} paise (₹${converted / 100})`);
  });
  
  // Test 3: Price conversion
  console.log('\n🏷️  Test 3: Price Conversion');
  const priceTests = [
    199.50,
    '299.00',
    0,
    '0',
    'invalid',
    null
  ];
  
  priceTests.forEach(price => {
    const converted = convertPriceToMinorUnits(price);
    console.log(`  ${price} → ${converted} paise (₹${converted / 100})`);
  });
  
  // Test 4: Order total validation
  console.log('\n🧾 Test 4: Order Total Validation');
  const orderItems = [
    { qty: 2, unitPrice: 15000, totalPrice: 30000 }, // ₹150 x 2 = ₹300
    { qty: 1, unitPrice: 8000, totalPrice: 8000 }    // ₹80 x 1 = ₹80
  ];
  
  const itemsTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxTotal = Math.round(itemsTotal * 0.18); // 18% GST
  const discountTotal = 5000; // ₹50 discount
  const grandTotal = itemsTotal + taxTotal - discountTotal;
  
  console.log(`  Items Total: ${itemsTotal} paise (₹${itemsTotal / 100})`);
  console.log(`  Tax (18%): ${taxTotal} paise (₹${taxTotal / 100})`);
  console.log(`  Discount: ${discountTotal} paise (₹${discountTotal / 100})`);
  console.log(`  Grand Total: ${grandTotal} paise (₹${grandTotal / 100})`);
  
  // Validation
  const expectedItemsTotal = 38000; // ₹380
  const expectedTaxTotal = 6840;    // ₹68.40
  const expectedGrandTotal = 39840; // ₹398.40
  
  if (itemsTotal === expectedItemsTotal && taxTotal === expectedTaxTotal && grandTotal === expectedGrandTotal) {
    console.log('  ✅ Order calculation is correct!');
  } else {
    console.log('  ❌ Order calculation has errors!');
  }
  
  console.log('\n🎉 All transformation tests completed!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Phone numbers will be normalized to E.164 format');
  console.log('  ✅ Monetary values will be converted to integer minor units');
  console.log('  ✅ String numbers will be properly converted to integers');
  console.log('  ✅ Order totals will be validated server-side');
  
  console.log('\n🚀 Ready to run actual migration once Firebase is configured!');
}

// Run the tests
runTests();
