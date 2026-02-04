import { Card, CardContent } from "@workspace/ui/components/card";
import { OrderStatusBadge } from "@/components/store/order-status-badge";
import { formatCurrency } from "@/lib/format";

const MAX_VISIBLE_ITEMS = 3;

function formatShortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

interface OrderItemData {
  name: string;
  quantity: number;
  totalPrice: number;
}

interface SessionOrderData {
  _id: string;
  status: string;
  total: number;
  createdAt: number;
  items: OrderItemData[];
}

interface SessionOrderCardProps {
  order: SessionOrderData;
}

export function SessionOrderCard({ order }: SessionOrderCardProps) {
  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            #{formatShortId(order._id)}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="text-sm space-y-1">
          {order.items.slice(0, MAX_VISIBLE_ITEMS).map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-muted-foreground"
            >
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
          {order.items.length > MAX_VISIBLE_ITEMS && (
            <p className="text-xs text-muted-foreground">
              +{order.items.length - MAX_VISIBLE_ITEMS} itens
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-bold">
            {formatCurrency(order.total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
