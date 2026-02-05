"use client";

import { useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { PREDEFINED_TAGS } from "@/lib/menu-constants";
import { useMenuItemFormContext } from "./context";

export function DietaryTagsCard() {
  const { tags, setTags } = useMenuItemFormContext();
  const [customTagInput, setCustomTagInput] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleTag = useCallback(
    (tag: string) => {
      if (tags.includes(tag)) {
        setTags(tags.filter((t) => t !== tag));
      } else {
        setTags([...tags, tag]);
      }
    },
    [tags, setTags]
  );

  const addCustomTag = useCallback(() => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setCustomTagInput("");
    setPopoverOpen(false);
  }, [customTagInput, tags, setTags]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomTag();
      }
    },
    [addCustomTag]
  );

  // Custom tags not in predefined list
  const customTags = tags.filter(
    (t) => !PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number])
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Label className="font-semibold">Dietary Tags</Label>

        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={tags.includes(tag) ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", tags.includes(tag) && "bg-primary")}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}

          {customTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="h-7 gap-1 pl-2 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" align="start">
              <div className="space-y-2">
                <Label className="text-xs">Custom tag name</Label>
                <div className="flex gap-2">
                  <Input
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Halal"
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    onClick={addCustomTag}
                    disabled={!customTagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
