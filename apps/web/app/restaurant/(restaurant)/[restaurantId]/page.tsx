'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
    ShoppingCart,
    Utensils,
    Clock,
    DollarSign,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useRouter } from "next/router";
export default function pageRestaurante() {
    const id = useParams().restaurantId
    
    const restaurants = useQuery(api.restaurants.list);
    const restaurantOrders = useQuery(
        api.orders.getOrdersByRestaurant,

        { restaurantId: id as any }

    );
    const pendingOrders = restaurantOrders?.filter((o) => o.status === "pending") || [];
    const totalOrders = restaurantOrders?.length || 0;
    const totalRevenue = restaurantOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

    return (


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:scale-101 transition-transform duration-500" >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                    <CardTitle className="text-sm font-medium ">
                        Pending Orders
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders.length}</div>
                </CardContent>
            </Card>

            <Card className="hover:scale-101 transition-transform duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Orders
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                </CardContent>
            </Card>

            <Card className="hover:scale-101 transition-transform duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {totalRevenue.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:scale-101 transition-transform duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Restaurants
                    </CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                      <div className="text-2xl font-bold">
                        {restaurants?.length || 0}
                      </div>
                    </CardContent>
            </Card>
        </div>

    )

}