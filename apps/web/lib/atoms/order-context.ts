import { atom } from "jotai";
import type { Id } from "@workspace/backend/_generated/dataModel";

export type OrderContext =
  | { type: "delivery" }
  | {
      type: "dine_in";
      sessionId: string;
      tableId: Id<"tables">;
      tableNumber: string;
      restaurantId: Id<"restaurants">;
    };

export const orderContextAtom = atom<OrderContext>({ type: "delivery" });
