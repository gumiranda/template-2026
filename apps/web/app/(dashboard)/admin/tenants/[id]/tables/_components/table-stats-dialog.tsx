import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Loader2, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface TableStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: Id<"tables"> | null;
}

export function TableStatsDialog({ open, onOpenChange, tableId }: TableStatsDialogProps) {
  const analytics = useQuery(
    api.tables.getTableAnalytics,
    tableId ? { tableId } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[100dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Table Statistics
            {analytics?.table && (
              <Badge variant="outline" className="ml-2">
                #{analytics.table.tableNumber}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {analytics === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : analytics === null ? (
          <p className="text-center text-muted-foreground py-8">
            Failed to load analytics
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.avgOrderValue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-medium mb-2">Orders by Status</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                  <Badge key={status} variant="outline">
                    {status}: {count}
                  </Badge>
                ))}
                {Object.keys(analytics.ordersByStatus).length === 0 && (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent Orders</h4>
              {analytics.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analytics.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="text-sm">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
