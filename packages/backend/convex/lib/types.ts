export const Sector = {
  GENERAL: "general",
} as const;

export type SectorType = (typeof Sector)[keyof typeof Sector];

export const Role = {
  SUPERADMIN: "superadmin",
  CEO: "ceo",
  USER: "user",
  WAITER: "waiter",
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  COMPLETED: "completed",
  DELIVERING: "delivering",
  CANCELED: "canceled",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
  DINE_IN: "dine_in",
  DELIVERY: "delivery",
} as const;

export type OrderTypeType = (typeof OrderType)[keyof typeof OrderType];

export const StripeSubStatus = {
  NONE: "none",
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  TRIALING: "trialing",
  UNPAID: "unpaid",
  PAUSED: "paused",
} as const;

export type StripeSubStatusType = (typeof StripeSubStatus)[keyof typeof StripeSubStatus];

export function isValidRole(value: string): value is RoleType {
  return Object.values(Role).includes(value as RoleType);
}

export function isValidSector(value: string): value is SectorType {
  return Object.values(Sector).includes(value as SectorType);
}

export function isValidOrderStatus(value: string): value is OrderStatusType {
  return Object.values(OrderStatus).includes(value as OrderStatusType);
}

export const RestaurantStatus = {
  ACTIVE: "active",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive",
} as const;

export type RestaurantStatusType = (typeof RestaurantStatus)[keyof typeof RestaurantStatus];

export function isValidRestaurantStatus(value: string): value is RestaurantStatusType {
  return Object.values(RestaurantStatus).includes(value as RestaurantStatusType);
}

export const SessionStatus = {
  OPEN: "open",
  REQUESTING_CLOSURE: "requesting_closure",
  CLOSED: "closed",
} as const;

export type SessionStatusType = (typeof SessionStatus)[keyof typeof SessionStatus];
