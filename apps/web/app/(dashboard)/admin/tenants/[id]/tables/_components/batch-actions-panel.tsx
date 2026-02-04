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
import type { BatchSettings, ColorTheme, FormatTemplate, PageAction } from "./tables-reducer";

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
            <BatchSettingsForm batchSettings={batchSettings} dispatch={dispatch} />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Formato</Label>
                <Select
                  value={batchSettings.formatTemplate}
                  onValueChange={(value) =>
                    dispatch({
                      type: "SET_BATCH_SETTING",
                      payload: { formatTemplate: value as FormatTemplate },
                    })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tent-card-4x6">Tent Card (4x6)</SelectItem>
                    <SelectItem value="sticker-2x2">Sticker (2x2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tema</Label>
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
                  <ToggleGroupItem value="light" className="flex-1 text-xs">
                    <Sun className="h-3 w-3 mr-1" />
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" className="flex-1 text-xs">
                    <Moon className="h-3 w-3 mr-1" />
                    Dark
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-call-to-action" className="text-xs">Call to Action</Label>
              <Input
                id="mobile-call-to-action"
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
                id="mobile-show-table-number"
                checked={batchSettings.showTableNumber}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: "SET_BATCH_SETTING",
                    payload: { showTableNumber: checked === true },
                  })
                }
              />
              <Label htmlFor="mobile-show-table-number" className="text-sm">
                Exibir numero da mesa
              </Label>
            </div>
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

  return (
    <div className="border rounded-lg p-3 bg-muted/50">
      <p className="text-xs text-muted-foreground mb-2 text-center">
        {size > 60 ? "Live Preview" : "Preview"}
      </p>
      <div
        className={`aspect-[3/2] rounded-md flex flex-col items-center justify-center p-3 ${
          isDark
            ? "bg-zinc-900 text-white"
            : "bg-white text-black border"
        }`}
      >
        <p className={`${size > 60 ? "text-xs" : "text-[10px]"} font-bold mb-${size > 60 ? "2" : "1"}`}>
          {batchSettings.callToAction}
        </p>
        <QRCodeSVG
          value="https://example.com/menu/preview?table=1"
          size={size}
          bgColor={isDark ? "#18181b" : "#ffffff"}
          fgColor={isDark ? "#ffffff" : "#000000"}
        />
        {batchSettings.showTableNumber && (
          <p className={`${size > 60 ? "text-lg" : "text-sm"} font-bold mt-${size > 60 ? "2" : "1"}`}>
            TABLE 1
          </p>
        )}
      </div>
    </div>
  );
}

function BatchSettingsForm({
  batchSettings,
  dispatch,
}: {
  batchSettings: BatchSettings;
  dispatch: React.Dispatch<PageAction>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Format Template</Label>
        <Select
          value={batchSettings.formatTemplate}
          onValueChange={(value) =>
            dispatch({
              type: "SET_BATCH_SETTING",
              payload: { formatTemplate: value as FormatTemplate },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tent-card-4x6">Tent Card (4x6)</SelectItem>
            <SelectItem value="sticker-2x2">Sticker (2x2)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color Theme</Label>
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
          <ToggleGroupItem value="light" className="flex-1">
            <Sun className="h-4 w-4 mr-1" />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" className="flex-1">
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="call-to-action">Call to Action</Label>
        <Input
          id="call-to-action"
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

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-table-number"
            checked={batchSettings.showTableNumber}
            onCheckedChange={(checked) =>
              dispatch({
                type: "SET_BATCH_SETTING",
                payload: { showTableNumber: checked === true },
              })
            }
          />
          <Label htmlFor="show-table-number">Show Table Number</Label>
        </div>
      </div>
    </>
  );
}
