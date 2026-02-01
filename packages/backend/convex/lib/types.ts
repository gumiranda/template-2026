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
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export function isValidRole(value: string): value is RoleType {
  return Object.values(Role).includes(value as RoleType);
}

export function isValidSector(value: string): value is SectorType {
  return Object.values(Sector).includes(value as SectorType);
}

export function isValidOrderStatus(value: string): value is OrderStatusType {
  return Object.values(OrderStatus).includes(value as OrderStatusType);
}
