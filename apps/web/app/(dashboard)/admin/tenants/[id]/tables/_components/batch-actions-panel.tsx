import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Printer, Sun, Moon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { BatchSettings, ColorTheme, FormatTemplate, PageAction } from "./tables-reducer";

const DESKTOP_SIZE_THRESHOLD = 60;

interface BatchActionsPanelProps {
  batchSettings: BatchSettings;
  selectedCount: number;
  dispatch: React.Dispatch<PageAction>;
  onPrint: () => void;
}

export function BatchActionsDesktop({
  batchSettings,
  selectedCount,
  dispatch,
  onPrint,
}: BatchActionsPanelProps) {
  return (
    <div className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Batch Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BatchPreview batchSettings={batchSettings} size={80} />
            <BatchSettingsFields batchSettings={batchSettings} dispatch={dispatch} idPrefix="desktop" />
            <Button className="w-full" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print {selectedCount > 0 ? `Selected (${selectedCount})` : "All"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BatchActionsMobile({
  batchSettings,
  selectedCount,
  dispatch,
  onPrint,
}: BatchActionsPanelProps) {
  return (
    <>
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer className="h-5 w-5" />
              Impressao em Lote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BatchPreview batchSettings={batchSettings} size={60} />
            <BatchSettingsFields batchSettings={batchSettings} dispatch={dispatch} idPrefix="mobile" compact />
          </CardContent>
        </Card>
      </div>

      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <Button className="w-full" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir {selectedCount > 0 ? `Selecionadas (${selectedCount})` : "Todas"}
        </Button>
      </div>
    </>
  );
}

function BatchPreview({
  batchSettings,
  size,
}: {
  batchSettings: BatchSettings;
  size: number;
}) {
  const isDark = batchSettings.colorTheme === "dark";
  const isLarge = size > DESKTOP_SIZE_THRESHOLD;

  return (
    <div className="border rounded-lg p-3 bg-muted/50">
      <p className="text-xs text-muted-foreground mb-2 text-center">
        {isLarge ? "Live Preview" : "Preview"}
      </p>
      <div
        className={cn(
          "aspect-[3/2] rounded-md flex flex-col items-center justify-center p-3",
          isDark ? "bg-zinc-900 text-white" : "bg-white text-black border"
        )}
      >
        <p className={cn("font-bold", isLarge ? "text-xs mb-2" : "text-[10px] mb-1")}>
          {batchSettings.callToAction}
        </p>
        <QRCodeSVG
          value="https://example.com/menu/preview?table=1"
          size={size}
          bgColor={isDark ? "#18181b" : "#ffffff"}
          fgColor={isDark ? "#ffffff" : "#000000"}
        />
        {batchSettings.showTableNumber && (
          <p className={cn("font-bold", isLarge ? "text-lg mt-2" : "text-sm mt-1")}>
            TABLE 1
          </p>
        )}
      </div>
    </div>
  );
}

function BatchSettingsFields({
  batchSettings,
  dispatch,
  idPrefix,
  compact = false,
}: {
  batchSettings: BatchSettings;
  dispatch: React.Dispatch<PageAction>;
  idPrefix: string;
  compact?: boolean;
}) {
  const labelSize = compact ? "text-xs" : undefined;

  return (
    <>
      <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-2"}>
        <div className="space-y-2">
          <Label className={labelSize}>{compact ? "Formato" : "Format Template"}</Label>
          <Select
            value={batchSettings.formatTemplate}
            onValueChange={(value) =>
              dispatch({
                type: "SET_BATCH_SETTING",
                payload: { formatTemplate: value as FormatTemplate },
              })
            }
          >
            <SelectTrigger className={compact ? "text-xs" : undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tent-card-4x6">Tent Card (4x6)</SelectItem>
              <SelectItem value="sticker-2x2">Sticker (2x2)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelSize}>{compact ? "Tema" : "Color Theme"}</Label>
          <ToggleGroup
            type="single"
            value={batchSettings.colorTheme}
            onValueChange={(value) =>
              value &&
              dispatch({
                type: "SET_BATCH_SETTING",
                payload: { colorTheme: value as ColorTheme },
              })
            }
            className="w-full"
          >
            <ToggleGroupItem value="light" className={cn("flex-1", compact && "text-xs")}>
              <Sun className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className={cn("flex-1", compact && "text-xs")}>
              <Moon className={cn("mr-1", compact ? "h-3 w-3" : "h-4 w-4")} />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-call-to-action`} className={labelSize}>
          Call to Action
        </Label>
        <Input
          id={`${idPrefix}-call-to-action`}
          value={batchSettings.callToAction}
          onChange={(e) =>
            dispatch({
              type: "SET_BATCH_SETTING",
              payload: { callToAction: e.target.value },
            })
          }
          placeholder="SCAN TO ORDER"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${idPrefix}-show-table-number`}
          checked={batchSettings.showTableNumber}
          onCheckedChange={(checked) =>
            dispatch({
              type: "SET_BATCH_SETTING",
              payload: { showTableNumber: checked === true },
            })
          }
        />
        <Label htmlFor={`${idPrefix}-show-table-number`} className="text-sm">
          {compact ? "Exibir numero da mesa" : "Show Table Number"}
        </Label>
      </div>
    </>
  );
}
