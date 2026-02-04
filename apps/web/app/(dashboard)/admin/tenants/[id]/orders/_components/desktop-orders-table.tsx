"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { formatCurrency } from "@/lib/format";
import { getStatusConfig, type OrderStatusType } from "./orders-types";
import { OrderStatusSelect } from "./order-status-select";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderRow {
  _id: string;
  status: OrderStatusType;
  total: number;
  createdAt: number;
  table: { tableNumber: string } | null;
  items: OrderItem[];
}

interface DesktopOrdersTableProps {
  orders: OrderRow[];
  onStatusChange: (orderId: string, newStatus: OrderStatusType) => void;
  updatingOrderId: string | null;
}

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

function getTotalItemsCount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function DesktopOrdersTable({
  orders,
  onStatusChange,
  updatingOrderId,
}: DesktopOrdersTableProps) {
  return (
    <div className="hidden md:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Mesa</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[180px]">Acao</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs">
                  {formatShortId(order._id)}
                </TableCell>
                <TableCell>
                  {order.table?.tableNumber ?? "—"}
                </TableCell>
                <TableCell>
                  {getTotalItemsCount(order.items)} item(s)
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <OrderStatusSelect
                    currentStatus={order.status}
                    onStatusChange={(newStatus) =>
                      onStatusChange(order._id, newStatus)
                    }
                    disabled={updatingOrderId === order._id}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
