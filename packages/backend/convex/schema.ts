import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roleValidator = v.union(
  v.literal("superadmin"),
  v.literal("ceo"),
  v.literal("user"),
  v.literal("waiter")
);

const userStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("served"),
  v.literal("completed")
);

const restaurantStatusValidator = v.union(
  v.literal("active"),
  v.literal("maintenance"),
  v.literal("inactive")
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    role: v.optional(roleValidator),
    sector: v.optional(v.string()),
    status: v.optional(userStatusValidator),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  restaurants: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    logoId: v.optional(v.id("_storage")),
    // Deprecated: use logoId instead. Kept for backward compatibility with existing data.
    logoUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    status: v.optional(restaurantStatusValidator),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_status", ["status"])
    .index("by_owner_and_deletedAt", ["ownerId", "deletedAt"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["status"],
    }),

  tables: defineTable({
    restaurantId: v.id("restaurants"),
    tableNumber: v.string(),
    capacity: v.number(),
    qrCode: v.string(),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurantId_and_tableNumber", ["restaurantId", "tableNumber"]),

  menuCategories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurantId_and_order", ["restaurantId", "order"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    // Deprecated: use imageId instead. Kept for backward compatibility with existing data.
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["restaurantId", "isActive"],
    }),

  sessions: defineTable({
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    // Deprecated: use _creationTime instead. Kept optional for backward compatibility.
    createdAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_table", ["tableId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_expires_at", ["expiresAt"]),

  carts: defineTable({
    tableId: v.id("tables"),
    restaurantId: v.id("restaurants"),
    isActive: v.boolean(),
    // Deprecated: use _creationTime instead. Kept optional for backward compatibility.
    createdAt: v.optional(v.number()),
  })
    .index("by_table", ["tableId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_tableId_and_isActive", ["tableId", "isActive"])
    .index("by_restaurantId_and_isActive", ["restaurantId", "isActive"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
    addedAt: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_menu_item", ["menuItemId"])
    .index("by_cartId_and_menuItemId", ["cartId", "menuItemId"]),

  sessionCartItems: defineTable({
    sessionId: v.string(),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
    addedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_menu_item", ["menuItemId"])
    .index("by_sessionId_and_menuItemId", ["sessionId", "menuItemId"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    sessionId: v.string(),
    status: orderStatusValidator,
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_table", ["tableId"])
    .index("by_restaurantId_and_status", ["restaurantId", "status"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    menuItemId: v.id("menuItems"),
    name: v.string(),
    quantity: v.number(),
    price: v.number(),
    totalPrice: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_menu_item", ["menuItemId"]),
});
