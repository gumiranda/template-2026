import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByIdentifier = query({
    args:{
        tableId:v.id("tables")
    },
    handler:async (ctx, args)=> {
        return await ctx.db.query("tables").withIndex("by_id", t=> t.eq("_id", args.tableId)).first()
    },
})
export const listByRestaurant = query({
    args:{
        restaurantId:v.id("restaurants")
    },
    handler:async (ctx, args) =>{
        return await ctx.db.query("tables").withIndex("by_restaurant", t=> t.eq("restaurantId", args.restaurantId)).collect()
    },
})
export const getTablesOverview = query({
    args:{
        restaurantId:v.id("restaurants")
    },
    handler:async(ctx, args)=>{
         return await ctx.db.query("tables").withIndex("by_restaurant", t=> t.eq("restaurantId", args.restaurantId)).collect()
    }
})