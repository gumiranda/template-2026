// Centralized constants for the backend.
// Avoids scattering magic numbers across individual files.

// ============================================
// Numeric limits
// ============================================
export const MAX_RECENT_ORDERS = 10;
export const MAX_PUBLIC_RESTAURANTS = 50;
export const MAX_USER_ORDERS = 200;
export const MAX_ORDER_ITEMS = 100;
export const MAX_ITEMS_PER_RESTAURANT = 50;
export const CLEANUP_BATCH_SIZE = 100;
export const ABANDONED_CART_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_SEARCH_RESULTS = 20;
export const MAX_RELATED_PRODUCTS = 6;
export const MAX_DISCOUNT_CANDIDATES = 200;
export const MAX_RECOMMENDED_PRODUCTS = 20;
export const MAX_SESSIONS_PER_TABLE = 10;
export const MAX_BATCH_TABLES = 50;
export const MAX_TABLE_CAPACITY = 1000;
export const MAX_CART_ITEM_QUANTITY = 99;

// ============================================
// String length limits
// ============================================
export const MAX_RESTAURANT_NAME_LENGTH = 200;
export const MAX_ADDRESS_LENGTH = 500;
export const MAX_ITEM_NAME_LENGTH = 200;
export const MAX_CATEGORY_NAME_LENGTH = 200;
export const MAX_TABLE_NUMBER_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_NOTES_LENGTH = 500;
export const MAX_PHONE_LENGTH = 20;
export const MAX_ICON_LENGTH = 50;

// ============================================
// Valid icon IDs for menu categories
// ============================================
export const VALID_ICON_IDS = [
  "utensils-crossed",
  "wine",
  "coffee",
  "cake",
  "beef",
  "salad",
  "fish",
  "pizza",
  "sandwich",
  "egg",
  "leaf",
  "ice-cream-cone",
] as const;
