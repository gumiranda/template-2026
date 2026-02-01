"use client"
import { CartDrawer } from "@/components/restaurant/cart-drawer"
import { Id } from "@workspace/backend/_generated/dataModel"
import NavBarMesa from "./components/navBarMesa"
export default function Table() {
  
    return(
        <div>
            <div className="fixed-top">
            <NavBarMesa restaurantId={"jx7en0gpyh3djb41hqssq19p6d8070yt" as Id<"restaurants">} tableId={"k971186dj1s3s832bt97m9nnhd807j16"} sessionId={"session?.sessionId as any"}></NavBarMesa>
             </div>
           
        </div>
    )
}