export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function calculateDiscountedPrice(
  price: number,
  discountPercentage?: number
): number {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }
  return price * (1 - discountPercentage / 100);
}

/**
 * Formats a timestamp as time only (HH:mm).
 * Example: "14:30"
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a timestamp as full date and time.
 * Example: "05/02/2026, 14:30"
 */
export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/**
 * Formats a timestamp as short date and time (no year).
 * Example: "05/02 14:30"
 */
export function formatShortDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/**
 * Formats an ID to a short display format.
 * Example: "abc123xyz" → "23XYZ"
 */
export function formatShortId(id: string): string {
  return id.slice(-6).toUpperCase();
}
