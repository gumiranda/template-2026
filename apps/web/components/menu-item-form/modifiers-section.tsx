"use client";

import { useCallback } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  name: string;
  required: boolean;
  options: ModifierOption[];
}

interface ModifiersSectionProps {
  groups: ModifierGroup[];
  onGroupsChange: (groups: ModifierGroup[]) => void;
}

export function ModifiersSection({
  groups,
  onGroupsChange,
}: ModifiersSectionProps) {
  const addGroup = useCallback(() => {
    onGroupsChange([
      ...groups,
      { name: "", required: false, options: [{ name: "", price: 0 }] },
    ]);
  }, [groups, onGroupsChange]);

  const removeGroup = useCallback(
    (index: number) => {
      onGroupsChange(groups.filter((_, i) => i !== index));
    },
    [groups, onGroupsChange]
  );

  const updateGroup = useCallback(
    (index: number, updates: Partial<ModifierGroup>) => {
      const next = groups.map((g, i) => (i === index ? { ...g, ...updates } : g));
      onGroupsChange(next);
    },
    [groups, onGroupsChange]
  );

  const addOption = useCallback(
    (groupIndex: number) => {
      const next = groups.map((g, i) =>
        i === groupIndex
          ? { ...g, options: [...g.options, { name: "", price: 0 }] }
          : g
      );
      onGroupsChange(next);
    },
    [groups, onGroupsChange]
  );

  const removeOption = useCallback(
    (groupIndex: number, optionIndex: number) => {
      const next = groups.map((g, i) =>
        i === groupIndex
          ? { ...g, options: g.options.filter((_, oi) => oi !== optionIndex) }
          : g
      );
      onGroupsChange(next);
    },
    [groups, onGroupsChange]
  );

  const updateOption = useCallback(
    (groupIndex: number, optionIndex: number, updates: Partial<ModifierOption>) => {
      const next = groups.map((g, gi) =>
        gi === groupIndex
          ? {
              ...g,
              options: g.options.map((o, oi) =>
                oi === optionIndex ? { ...o, ...updates } : o
              ),
            }
          : g
      );
      onGroupsChange(next);
    },
    [groups, onGroupsChange]
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add-ons & Modifiers</h2>
          <Button type="button" variant="outline" size="sm" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-1" />
            Add Modifier Group
          </Button>
        </div>

        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No modifier groups yet. Add one to let customers customize this
            item.
          </p>
        )}

        <div className="space-y-4">
          {groups.map((group, gi) => (
            <div key={gi} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={group.name}
                  onChange={(e) => updateGroup(gi, { name: e.target.value })}
                  placeholder="Group name (e.g. Size, Extras)"
                  className="flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Label htmlFor={`required-${gi}`} className="text-xs text-muted-foreground">
                    Required
                  </Label>
                  <Switch
                    id={`required-${gi}`}
                    checked={group.required}
                    onCheckedChange={(checked) =>
                      updateGroup(gi, { required: checked })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeGroup(gi)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 pl-6">
                {group.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                    <Input
                      value={option.name}
                      onChange={(e) =>
                        updateOption(gi, oi, { name: e.target.value })
                      }
                      placeholder="Option name"
                      className="flex-1"
                    />
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={option.price || ""}
                        onChange={(e) =>
                          updateOption(gi, oi, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeOption(gi, oi)}
                      disabled={group.options.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => addOption(gi)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
