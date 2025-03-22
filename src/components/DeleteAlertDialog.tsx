import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useDeleteOrder } from "@/hooks/useOrder";

export function DeleteAlertDialog({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteMutate, isPending } = useDeleteOrder();

  const handleDelete = () => {
    deleteMutate(id, {
      onSuccess: () => {
        toast.success("Order Deleted", {
          description: "The order has been successfully deleted",
          className: "bg-red-100 border-red-200 text-red-900",
        });
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Delete Failed", {
          description: "Please try again later",
          className: "bg-red-100 border-red-200 text-red-900",
        });
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded-2xl border-0 bg-white p-8 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-red-900">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Order
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 text-sm text-gray-600">
            Are you sure you want to delete this order? This action cannot be undone and will permanently remove the order from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel className="w-24 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 h-11 font-medium transition-colors sm:w-28">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className={clsx(
              "w-24 rounded-lg bg-red-600 text-white hover:bg-red-700 h-11 font-medium transition-colors sm:w-32",
              isPending && "pointer-events-none opacity-50"
            )}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
