import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const clearCart = mutation({
    args:{
        tableId:v.id("tables")
    },
    handler:async(ctx, args)=> {
        const cart = await   ctx.db.query("carts").withIndex("by_table", c => c.eq("tableId", args.tableId)).first()
        const cartItens = await ctx.db.query("cartItems").withIndex("by_cart", c=> c.eq("cartId", cart?._id as any)).collect()
        cartItens.map(async (c) =>{
            return await ctx.db.delete(c._id)
        })
    }
})
export const getCart = query({
    args:{
        tableId:v.id("tables")
    }, handler:async (ctx, args) => {
        return await ctx.db.query("carts").withIndex("by_table", c=> c.eq("tableId", args.tableId)).first()
    },
})
export const addToCart = mutation({
    args:{
      sessionId:v.string(),
      menuItemId: v.string(),
      quantity: v.number(),
      price: v.number(),
    },
    handler:async(ctx, args) => {
        
        
    },
})