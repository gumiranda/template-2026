import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader2, Plus } from "lucide-react";
import type { PageAction } from "./tables-reducer";

interface GenerateTablesFormProps {
  generateForm: { startId: string; endId: string };
  isGenerating: boolean;
  dispatch: React.Dispatch<PageAction>;
  onGenerate: () => void;
}

export function GenerateTablesForm({
  generateForm,
  isGenerating,
  dispatch,
  onGenerate,
}: GenerateTablesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Generate Tables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="start-id">START ID</Label>
            <Input
              id="start-id"
              type="number"
              min="1"
              placeholder="1"
              value={generateForm.startId}
              onChange={(e) =>
                dispatch({
                  type: "SET_GENERATE_FORM",
                  payload: { startId: e.target.value },
                })
              }
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-id">END ID</Label>
            <Input
              id="end-id"
              type="number"
              min="1"
              placeholder="10"
              value={generateForm.endId}
              onChange={(e) =>
                dispatch({
                  type: "SET_GENERATE_FORM",
                  payload: { endId: e.target.value },
                })
              }
              className="w-24"
            />
          </div>
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !generateForm.startId || !generateForm.endId}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum 50 tables per batch. Existing table numbers will be skipped.
        </p>
      </CardContent>
    </Card>
  );
}
