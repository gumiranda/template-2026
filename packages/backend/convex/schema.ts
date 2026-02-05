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

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("served"),
  v.literal("completed"),
  v.literal("delivering"),
  v.literal("canceled")
);

const orderTypeValidator = v.union(
  v.literal("dine_in"),
  v.literal("delivery")
);

const restaurantStatusValidator = v.union(
  v.literal("active"),
  v.literal("maintenance"),
  v.literal("inactive")
);

const sessionStatusValidator = v.union(
  v.literal("open"),
  v.literal("requesting_closure"),
  v.literal("closed")
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
    deliveryFee: v.optional(v.number()),
    deliveryTimeMinutes: v.optional(v.number()),
    rating: v.optional(v.number()),
    coverImageId: v.optional(v.id("_storage")),
  })
    .index("by_owner", ["ownerId"])
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
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    icon: v.optional(v.string()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurantId_and_order", ["restaurantId", "order"])
    .index("by_restaurantId_and_isActive", ["restaurantId", "isActive"]),

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
    discountPercentage: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"])
    .index("by_categoryId_and_isActive", ["categoryId", "isActive"])
    .index("by_restaurantId_and_isActive", ["restaurantId", "isActive"])
    .index("by_discount", ["discountPercentage"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["restaurantId", "isActive"],
    }),

  modifierGroups: defineTable({
    menuItemId: v.id("menuItems"),
    name: v.string(),
    required: v.boolean(),
    order: v.number(),
  }).index("by_menuItem", ["menuItemId"]),

  modifierOptions: defineTable({
    modifierGroupId: v.id("modifierGroups"),
    name: v.string(),
    price: v.number(),
    order: v.number(),
  }).index("by_modifierGroup", ["modifierGroupId"]),

  sessions: defineTable({
    sessionId: v.string(),
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    status: v.optional(sessionStatusValidator),
    closedAt: v.optional(v.number()),
    closedBy: v.optional(v.id("users")),
    // Deprecated: use _creationTime instead. Kept optional for backward compatibility.
    createdAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_table", ["tableId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_restaurantId_and_status", ["restaurantId", "status"]),

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
    .index("by_restaurantId_and_isActive", ["restaurantId", "isActive"])
    .index("by_isActive", ["isActive"]),

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
    tableId: v.optional(v.id("tables")),
    sessionId: v.optional(v.string()),
    status: orderStatusValidator,
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.id("users")),
    orderType: v.optional(orderTypeValidator),
    subtotalPrice: v.optional(v.number()),
    totalDiscounts: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
    deliveryAddress: v.optional(v.string()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_table", ["tableId"])
    .index("by_restaurantId_and_status", ["restaurantId", "status"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    menuItemId: v.id("menuItems"),
    name: v.string(),
    quantity: v.number(),
    price: v.number(),
    totalPrice: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_menu_item", ["menuItemId"]),

  favoriteRestaurants: defineTable({
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
  })
    .index("by_user", ["userId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_user_and_restaurant", ["userId", "restaurantId"]),

  foodCategories: defineTable({
    name: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_order", ["order"])
    .index("by_active", ["isActive"]),

  restaurantFoodCategories: defineTable({
    restaurantId: v.id("restaurants"),
    foodCategoryId: v.id("foodCategories"),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["foodCategoryId"]),

  restaurantStaff: defineTable({
    restaurantId: v.id("restaurants"),
    userId: v.id("users"),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_user", ["userId"])
    .index("by_restaurant_and_user", ["restaurantId", "userId"]),

  stripeData: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
    status: v.optional(v.string()),
    priceId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    paymentMethodBrand: v.optional(v.string()),
    paymentMethodLast4: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_status", ["status"]),

  promoBanners: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_active_and_order", ["isActive", "order"]),
});
