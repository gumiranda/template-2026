import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  restaurantName: string;
  isDeleting: boolean;
}

export function DeleteRestaurantDialog({
  open,
  onOpenChange,
  onConfirm,
  restaurantName,
  isDeleting,
}: DeleteRestaurantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Deletar {restaurantName}?
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              Esta ação não pode ser desfeita. O restaurante será desativado permanentemente.
            </span>
            <span className="block text-sm text-muted-foreground">
              Consequências:
            </span>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Todas as mesas serão desativadas</li>
              <li>Todas as sessões ativas serão encerradas</li>
              <li>Todos os carrinhos serão cancelados</li>
              <li>Os pedidos existentes serão mantidos para histórico</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deletando..." : "Deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
