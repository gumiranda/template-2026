
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { Id } from "./_generated/dataModel";

export const list = query({
    args:{},
    handler:async(ctx) =>{
        return await ctx.db.query("restaurants").collect();
    }
})
export const create = mutation({
    args:{
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    description: v.string(),
    
    },
    handler: async(ctx, args) => {
        const isActive = true
        const identity = await getAuthenticatedUser(ctx) ;
        
       return ctx.db.insert("restaurants",{... args,ownerId:identity?._id as Id<"users">, isActive:isActive})
    },
}) 

export const update = mutation({
    args:{
        id: v.id("restaurants"),
        options:v.object({
             name: v.string(),
    address: v.string(),
    phone: v.string(),
    description: v.string()
        })
    },
    handler:async(ctx, args) =>{
        return await ctx.db.patch(args.id, args.options)
    },
})

export const deleteRestaurant = mutation({
    args:{
        id:v.id("restaurants")
    },
    handler:async(ctx, args) => {
        return await ctx.db.delete(args.id)
    },
})
export const getByIdentifier = query({
    args:{
        restaurantId:v.id("restaurants")
    },
    handler: async(ctx, args)=>{
        return await ctx.db.query("restaurants").withIndex("by_id", r=> r.eq("_id", args.restaurantId)).first()
    }
})
export const get = query({
    args:{
        id:v.id("restaurants")
    },
    handler:async(ctx, args) => {
        return await ctx.db.get(args.id)
    },
})