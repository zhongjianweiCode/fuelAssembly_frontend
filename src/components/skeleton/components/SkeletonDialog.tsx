import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { SkeletonItem } from "@/types/skeleton";
import { OrderItem } from "@/types/order";
import { useState, ChangeEvent } from "react";

interface SkeletonDialogProps {
  open: boolean;
  onClose: () => void;
  data?: SkeletonItem;
  mode: "add" | "edit";
  orders: OrderItem[];
}

export function SkeletonDialog({ open, onClose, data, mode, orders }: SkeletonDialogProps) {
  const [formData, setFormData] = useState<Partial<SkeletonItem>>(data || {});

  const handleChange = (field: keyof SkeletonItem) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    // TODO: Implement form submission
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          minWidth: "400px",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
        {mode === "add" ? "Add New Skeleton" : "Edit Skeleton"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Skeleton ID"
            value={formData.sk_number || ""}
            onChange={handleChange("sk_number")}
            disabled={mode === "edit"}
            fullWidth
          />
          <TextField
            label="Perpendicularity (Rb)"
            type="number"
            value={formData.perpendiculartity || ""}
            onChange={handleChange("perpendiculartity")}
            fullWidth
          />
          <TextField
            label="Flatness"
            type="number"
            value={formData.flatness || ""}
            onChange={handleChange("flatness")}
            fullWidth
          />
          <TextField
            label="Length"
            type="number"
            value={formData.length || ""}
            onChange={handleChange("length")}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="X"
              type="number"
              value={formData.x || ""}
              onChange={handleChange("x")}
              fullWidth
            />
            <TextField
              label="Y"
              type="number"
              value={formData.y || ""}
              onChange={handleChange("y")}
              fullWidth
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || ""}
              onChange={handleChange("status")}
              label="Status"
            >
              <MenuItem value="CMM">CMM</MenuItem>
              <MenuItem value="Laboratory">Laboratory</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="Released">Released</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Used">Used</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              value={formData.platform || ""}
              onChange={handleChange("platform")}
              label="Platform"
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={formData.order?.id || ""}
              onChange={handleChange("order")}
              label="Order"
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {`${order.order_name} (${order.order_batch})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
        <Button 
          onClick={onClose}
          sx={{
            color: "#64748b",
            "&:hover": { bgcolor: "#f1f5f9" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#3b82f6",
            "&:hover": { bgcolor: "#2563eb" },
          }}
        >
          {mode === "add" ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 