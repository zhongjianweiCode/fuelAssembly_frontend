"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { OrderItem } from "@/types/order";
import { useUpdateOrder } from "@/hooks/useOrder";

export function EditOrdersDialog({ data }: { data: OrderItem }) {
  const [orderName, setOrderName] = useState<string>(data.order_name);
  const [orderBatch, setOrderBatch] = useState<string>(data.order_batch);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setOrderName(data.order_name);
      setOrderBatch(data.order_batch);
    };
  }, [isDialogOpen, data.order_batch, data.order_name]);

  const { mutate: updateMutate} = useUpdateOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderBatch || !orderName) return;

    updateMutate(
      { id: data.id, payload: { order_batch: orderBatch, order_name: orderName } },
      {
        onSuccess: () => {
          toast.success("Order Updated", {
            description: "The order has been successfully updated.",
            className: "bg-blue-100 border-blue-200 text-blue-900",
          });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("Update Failed", {
            description: "Please check the order format and try again.",
            className: "bg-red-100 border-red-200 text-red-900",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border-0 bg-white p-8 shadow-xl sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-900">
              <Pencil className="h-5 w-5 text-blue-600" />
              Edit Order
            </DialogTitle>
            <DialogDescription className="mt-3 text-sm text-blue-700/80">
              Make changes to the order information below
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="orderName"
                className="text-sm font-medium text-gray-700"
              >
                Order Name
              </Label>
              <Input
                id="orderName"
                value={orderName}
                required
                type="text"
                placeholder="Enter order name"
                className="h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 transition-colors placeholder:text-gray-400"
                onChange={(e) => setOrderName(e.target.value)}
              />
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="orderBatch"
                className="text-sm font-medium text-gray-700"
              >
                Order Batch
              </Label>
              <Input
                id="orderBatch"
                value={orderBatch}
                required
                type="text"
                placeholder="Enter order batch"
                className="h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 transition-colors placeholder:text-gray-400"
                onChange={(e) => setOrderBatch(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-24 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 h-11 font-medium transition-colors sm:w-28"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-24 rounded-lg bg-blue-600 text-white hover:bg-blue-700 h-11 font-medium transition-colors sm:w-32"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
