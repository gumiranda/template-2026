import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreVertical,
  Download,
  BarChart3,
  Power,
  Trash2,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";

function extractPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

interface TableCardProps {
  table: {
    _id: Id<"tables">;
    tableNumber: string;
    capacity: number;
    isActive: boolean;
    qrCode: string;
  };
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onDownloadQR: () => void;
  onViewStats: () => void;
  onManageCart: () => void;
}

export function TableCard({
  table,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onDelete,
  onDownloadQR,
  onViewStats,
  onManageCart,
}: TableCardProps) {
  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
            <span className="font-bold text-lg">#{table.tableNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={table.isActive ? "default" : "secondary"}>
              {table.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onManageCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Gerenciar Carrinho
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewStats}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Stats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadQR}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStatus}>
                  <Power className="mr-2 h-4 w-4" />
                  {table.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-center p-2 bg-white rounded-md">
          <QRCodeSVG
            id={`qr-${table._id}`}
            value={table.qrCode}
            size={100}
            level="M"
          />
        </div>
        <Link
          href={extractPath(table.qrCode)}
          target="_blank"
          className="flex items-center justify-center gap-1 text-xs text-primary hover:underline mt-2"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir link da mesa
        </Link>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Capacity: {table.capacity}
        </p>
      </CardContent>
    </Card>
  );
}
