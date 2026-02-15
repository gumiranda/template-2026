import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        const memberUsers = await Promise.all(
          members.map(async (m) => {
            const u = await ctx.db.get(m.userId);
            return u ? { _id: u._id, name: u.name } : null;
          })
        );

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .order("desc")
          .first();

        const unreadCount = membership.lastReadAt
          ? (
              await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) =>
                  q.eq("conversationId", conversation._id)
                )
                .collect()
            ).filter(
              (msg) =>
                msg._creationTime > membership.lastReadAt! &&
                msg.senderId !== user._id
            ).length
          : (
              await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) =>
                  q.eq("conversationId", conversation._id)
                )
                .collect()
            ).filter((msg) => msg.senderId !== user._id).length;

        const otherMember = memberUsers.find(
          (m) => m && m._id !== user._id
        );
        const displayName = conversation.isGroup
          ? conversation.name ?? "Grupo"
          : otherMember?.name ?? "Chat";

        return {
          ...conversation,
          members: memberUsers.filter(Boolean),
          lastMessage: lastMessage
            ? { body: lastMessage.body, at: lastMessage._creationTime }
            : null,
          unreadCount,
          displayName,
        };
      })
    );

    return conversations
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b!.lastMessage?.at ?? b!._creationTime) -
          (a!.lastMessage?.at ?? a!._creationTime)
      );
  },
});

export const createDirect = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (user._id === args.userId) {
      throw new Error("Cannot create a conversation with yourself");
    }

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const membership of myMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (!conversation || conversation.isGroup) continue;

      const otherMember = await ctx.db
        .query("conversationMembers")
        .withIndex("by_user_and_conversation", (q) =>
          q.eq("userId", args.userId).eq("conversationId", conversation._id)
        )
        .first();

      if (otherMember) {
        return conversation._id;
      }
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdBy: user._id,
    });

    const now = Date.now();
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: user._id,
      joinedAt: now,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.userId,
      joinedAt: now,
    });

    return conversationId;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      isGroup: true,
      createdBy: user._id,
    });

    const now = Date.now();
    const allMembers = new Set([user._id, ...args.memberIds]);
    for (const memberId of allMembers) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId: memberId,
        joinedAt: now,
      });
    }

    return conversationId;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_conversation", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId)
      )
      .first();

    if (!membership) throw new Error("Not a member of this conversation");

    await ctx.db.patch(membership._id, { lastReadAt: Date.now() });
  },
});

export const getApprovedUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    return users
      .filter((u) => u._id !== user._id)
      .map((u) => ({ _id: u._id, name: u.name }));
  },
});
