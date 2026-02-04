// Centralized constants for the backend.
// Avoids scattering magic numbers across individual files.

export const MAX_RECENT_ORDERS = 10;
export const MAX_PUBLIC_RESTAURANTS = 50;
export const MAX_USER_ORDERS = 200;
export const MAX_ORDER_ITEMS = 100;
export const MAX_ITEMS_PER_RESTAURANT = 50;
export const CLEANUP_BATCH_SIZE = 100;
export const ABANDONED_CART_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_DESCRIPTION_LENGTH = 1000;
