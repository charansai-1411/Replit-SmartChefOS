/**
 * Validation utilities for Cloud Functions
 */

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+[1-9]\d{1,14}$/,
  password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
  gstin: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
  slug: /^[a-z0-9-]{3,64}$/,
};

export function validateEmail(email: string): boolean {
  return REGEX.email.test(email);
}

export function validatePhone(phone: string): boolean {
  return REGEX.phone.test(phone);
}

export function validatePassword(password: string): boolean {
  return REGEX.password.test(password);
}

export function validateGSTIN(gstin: string): boolean {
  return REGEX.gstin.test(gstin);
}

export function validateSlug(slug: string): boolean {
  return REGEX.slug.test(slug);
}

export function validateRole(role: string): boolean {
  return ['admin', 'manager', 'cashier', 'server', 'kitchen'].includes(role);
}

export function validateCountry(country: string): boolean {
  // Add more countries as needed
  const validCountries = ['IN', 'US', 'GB', 'AU', 'CA', 'SG', 'AE'];
  return validCountries.includes(country);
}

export function validateCurrency(currency: string): boolean {
  const validCurrencies = ['INR', 'USD', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'EUR'];
  return validCurrencies.includes(currency);
}

export function validateTimezone(timezone: string): boolean {
  // Basic validation - in production, use a proper timezone library
  return timezone.length > 0 && timezone.includes('/');
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 64);
}
