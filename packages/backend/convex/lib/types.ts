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
