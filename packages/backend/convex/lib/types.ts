export const Sector = {
  GENERAL: "general",
} as const;

export type SectorType = (typeof Sector)[keyof typeof Sector];

export const Role = {
  SUPERADMIN: "superadmin",
  CEO: "ceo",
  USER: "user",
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

export const Plan = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type PlanType = (typeof Plan)[keyof typeof Plan];

export const SubscriptionEventType = {
  CREATED: "created",
  UPGRADED: "upgraded",
  DOWNGRADED: "downgraded",
  CANCELLED: "cancelled",
  RENEWED: "renewed",
} as const;

export type SubscriptionEventTypeValue =
  (typeof SubscriptionEventType)[keyof typeof SubscriptionEventType];
