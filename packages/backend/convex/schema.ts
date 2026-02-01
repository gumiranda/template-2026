import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    role: v.optional(v.string()),
    sector: v.optional(v.string()),
    status: v.optional(v.string()),
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
    logoUrl: v.optional(v.string()),
    isActive: v.boolean(),
    subdomain: v.optional(v.string()),
    status: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_subdomain", ["subdomain"])
    .index("by_status", ["status"]),

  tables: defineTable({
    restaurantId: v.id("restaurants"),
    tableNumber: v.string(),
    capacity: v.number(),
    qrCode: v.string(),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_table_number", ["restaurantId", "tableNumber"]),

  menuCategories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_order", ["restaurantId", "order"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"]),

  sessions: defineTable({
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_table", ["tableId"])
    .index("by_restaurant", ["restaurantId"]),

  carts: defineTable({
    tableId: v.id("tables"),
    restaurantId: v.id("restaurants"),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_table", ["tableId"])
    .index("by_restaurant", ["restaurantId"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
    addedAt: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_menu_item", ["menuItemId"]),

  sessionCartItems: defineTable({
    sessionId: v.string(),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    price: v.number(),
    addedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_menu_item", ["menuItemId"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    sessionId: v.string(),
    status: v.string(),
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_table", ["tableId"])
    .index("by_status", ["restaurantId", "status"])
    .index("by_session", ["sessionId"]),

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
