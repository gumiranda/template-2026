import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { CATEGORY_ICONS, getCategoryIcon } from "@/lib/menu-constants";
import type { CategoryFormData } from "./menu-types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: CategoryFormData;
  onFormChange: (update: Partial<CategoryFormData>) => void;
  onSave: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  isEditing,
  form,
  onFormChange,
  onSave,
}: CategoryDialogProps) {
  const iconPreviewData = form.icon ? getCategoryIcon(form.icon) : null;
  const IconPreviewComponent = iconPreviewData?.icon ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="e.g. Main Courses"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Category Icon</Label>
            <Select
              value={form.icon}
              onValueChange={(v) => onFormChange({ icon: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ICONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {iconPreviewData && IconPreviewComponent && (
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <IconPreviewComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{form.name || "Category Name"}</p>
                <p className="text-xs text-muted-foreground">{iconPreviewData.label}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!form.name.trim()}
          >
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
