"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { QRCodeSVG } from "@/components/restaurant/qr-code-generator";
import { Download, Loader2, Printer } from "lucide-react";

import { useRestaurantSelection } from "@/hooks/use-restaurant-selection";
import { RestaurantSelectorButtons, RestaurantEmptyState } from "../components/RestaurantSelector";

interface Table {
  _id: Id<"tables">;
  tableNumber: string;
  capacity: number;
}

export default function QRCodesPage() {
  const { selectedRestaurantId, setSelectedRestaurantId, restaurants } =
    useRestaurantSelection();

  const tables = useQuery(
    api.tables.listByRestaurant,
    selectedRestaurantId ? { restaurantId: selectedRestaurantId } : "skip"
  );

  const isLoading = selectedRestaurantId && tables === undefined;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Codes</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
              .qr-card { border: 2px solid #000; padding: 20px; text-align: center; }
              .qr-code { width: 150px; height: 150px; margin: 10px auto; }
              .table-number { font-size: 24px; font-weight: bold; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h1>Restaurant QR Codes</h1>
            <div class="qr-grid">
              ${tables?.map(table => `
                <div class="qr-card">
                  <img class="qr-code" src="${window.location.origin}/table/${selectedRestaurantId}/${table._id}/qr" alt="QR Code" />
                  <div class="table-number">Table ${table.tableNumber}</div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground">
            Generate and download QR codes for tables
          </p>
        </div>
        <div className="flex gap-2">
          <RestaurantSelectorButtons
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurantId}
            onSelect={setSelectedRestaurantId}
          />
        </div>
      </div>

      {!selectedRestaurantId && (
        <RestaurantEmptyState message="Select a restaurant to view QR codes" />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedRestaurantId && tables && tables.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print QR Codes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <QRCodeCard
                key={table._id}
                table={table as Table}
                restaurantId={selectedRestaurantId}
              />
            ))}
          </div>
        </>
      )}

      {selectedRestaurantId && tables && tables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tables found for this restaurant
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QRCodeCardProps {
  table: Table;
  restaurantId: Id<"restaurants">;
}

function QRCodeCard({ table, restaurantId }: QRCodeCardProps) {
  const qrCodeUrl = `${window.location.origin}/table/${restaurantId}/${table._id}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-table-${table.tableNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Table {table.tableNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            value={qrCodeUrl}
            size={150}
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Capacity: {table.capacity} people</p>
          <p>Scan to view menu</p>
        </div>

        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download QR
        </Button>
      </CardContent>
    </Card>
  );
}
