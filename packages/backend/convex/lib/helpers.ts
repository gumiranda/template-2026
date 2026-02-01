import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

type ValidateSessionOptions = {
  checkExpiry?: boolean;
};

export async function validateSession(
  ctx: QueryCtx | MutationCtx,
  sessionId: string,
  options: ValidateSessionOptions = {}
): Promise<Doc<"sessions">> {
  const { checkExpiry = true } = options;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
    .first();

  if (!session) throw new Error("Invalid session");
  if (checkExpiry && session.expiresAt < Date.now()) throw new Error("Session expired");
  return session;
}

export async function batchFetchMenuItems(
  ctx: QueryCtx | MutationCtx,
  menuItemIds: Id<"menuItems">[]
): Promise<Map<string, Doc<"menuItems">>> {
  const uniqueIds = [...new Set(menuItemIds)];
  const menuItems = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));

  const menuMap = new Map<string, Doc<"menuItems">>();
  uniqueIds.forEach((id, i) => {
    const item = menuItems[i];
    if (item) menuMap.set(id.toString(), item);
  });

  return menuMap;
}

export async function batchFetchTables(
  ctx: QueryCtx | MutationCtx,
  tableIds: Id<"tables">[]
): Promise<Map<string, Doc<"tables">>> {
  const uniqueIds = [...new Set(tableIds)];
  const tables = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));

  const tableMap = new Map<string, Doc<"tables">>();
  uniqueIds.forEach((id, i) => {
    const table = tables[i];
    if (table) tableMap.set(id.toString(), table);
  });

  return tableMap;
}

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
