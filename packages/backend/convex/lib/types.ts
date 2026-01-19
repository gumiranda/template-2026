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
