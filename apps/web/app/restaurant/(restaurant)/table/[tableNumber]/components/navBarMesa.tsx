import { useParams } from "next/navigation"
import { CartDrawer, CartDrawerProps } from "@/components/restaurant/cart-drawer"

export default function NavBarMesa({ restaurantId, tableId, sessionId, }: CartDrawerProps) {
    const params = useParams()
    const tableNumber = params.tableNumber
    return(
        <>
        <div className="flex justify-between items-center px-24  hover:scale-103 position-transition duration-500">
            <div className="">
                restaurantix
            </div>
            <div className="m-h-100px">
               Mesa {tableNumber}
            </div>
             
        </div>
           <CartDrawer restaurantId={restaurantId} tableId={tableId} sessionId={sessionId}></CartDrawer>
        </>
    )
}