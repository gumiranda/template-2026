import { Card, CardContent } from "@workspace/ui/components/card";
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
import { Search, Filter, ArrowUpDown } from "lucide-react";
import type { StatusFilter, SortBy, PageAction } from "./tables-reducer";

interface TableSearchToolbarProps {
  searchQuery: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  selectedCount: number;
  totalCount: number;
  dispatch: React.Dispatch<PageAction>;
  onSelectAll: () => void;
}

export function TableSearchToolbar({
  searchQuery,
  statusFilter,
  sortBy,
  selectedCount,
  totalCount,
  dispatch,
  onSelectAll,
}: TableSearchToolbarProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SEARCH_QUERY",
                    payload: e.target.value,
                  })
                }
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                dispatch({
                  type: "SET_STATUS_FILTER",
                  payload: value as StatusFilter,
                })
              }
            >
              <SelectTrigger className="w-[120px] sm:w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) =>
                dispatch({ type: "SET_SORT_BY", payload: value as SortBy })
              }
            >
              <SelectTrigger className="w-[120px] sm:w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch({ type: "TOGGLE_SORT_ORDER" })}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="select-all"
              checked={
                selectedCount === totalCount && totalCount > 0
              }
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm text-muted-foreground">
              Select all ({selectedCount} of {totalCount})
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
