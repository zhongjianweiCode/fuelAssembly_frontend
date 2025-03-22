import { GridColDef, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { format } from "date-fns";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { Tooltip } from "@mui/material";
import { SkeletonStatus, SkeletonPlatform } from "../types";

interface Order {
  order_batch: string;
  order_name: string;
}

interface SkeletonRow {
  id: string;
  sk_number: string;
  perpendiculartity: number;
  flatness: number;
  length: number;
  x: number | null;
  y: number | null;
  created_at: string;
  platform: string;
  type: string;
  status: string;
  order?: Order;
}

export const createColumns = (
  handleEditClick: (id: string) => () => void,
  handleDeleteClick: (id: string) => () => void
): GridColDef[] => [
  {
    field: "sk_number",
    headerName: "Skeleton ID",
    width: 106,
    editable: false,
    filterable: true,
  },
  {
    field: "perpendiculartity",
    headerName: "Rb",
    width: 58,
    editable: false,
    type: "number",
    filterable: true,
  },
  {
    field: "flatness",
    headerName: "Flatness",
    width: 85,
    editable: false,
    type: "number",
    filterable: true,
  },
  {
    field: "length",
    headerName: "Length",
    width: 85,
    editable: true,
    type: "number",
    filterable: true,
  },
  {
    field: "x",
    headerName: "X",
    width: 50,
    editable: false,
    type: "number",
    filterable: true,
  },
  {
    field: "y",
    headerName: "Y",
    width: 50,
    editable: false,
    type: "number",
    filterable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 95,
    editable: false,
    type: "singleSelect",
    valueOptions: Object.values(SkeletonStatus),
    filterable: true,
    renderCell: (params) => {
      const status = params.value as SkeletonStatus;
      const getStatusConfig = (status: SkeletonStatus) => {
        switch (status) {
          case SkeletonStatus.CMM:
            return {
              color: "#2563eb",
              bgColor: "#dbeafe",
              borderColor: "#bfdbfe",
            };
          case SkeletonStatus.Laboratory:
            return {
              color: "#9333ea",
              bgColor: "#f3e8ff",
              borderColor: "#e9d5ff",
            };
          case SkeletonStatus.Customer:
            return {
              color: "#0891b2",
              bgColor: "#cffafe",
              borderColor: "#a5f3fc",
            };
          case SkeletonStatus.Released:
            return {
              color: "#16a34a",
              bgColor: "#dcfce7",
              borderColor: "#bbf7d0",
            };
          case SkeletonStatus.Rejected:
            return {
              color: "#dc2626",
              bgColor: "#fee2e2",
              borderColor: "#fecaca",
            };
          case SkeletonStatus.USED:
            return {
              color: "#ca8a04",
              bgColor: "#fef9c3",
              borderColor: "#fef08a",
            };
          default:
            return {
              color: "#64748b",
              bgColor: "#f1f5f9",
              borderColor: "#e2e8f0",
            };
        }
      };

      const config = getStatusConfig(status);

      return (
        <div
          style={{
            backgroundColor: config.bgColor,
            color: config.color,
            border: `1px solid ${config.borderColor}`,
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 500,
            width: "fit-content",
            minWidth: "70px",
            textAlign: "center",
            textTransform: "capitalize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "24px",
          }}
        >
          {status.toLowerCase()}
        </div>
      );
    },
  },
  {
    field: "platform",
    headerName: "Platform",
    width: 85,
    editable: false,
    type: "singleSelect",
    valueOptions: Object.values(SkeletonPlatform),
    filterable: true,
  },
  {
    field: "created_at",
    headerName: "Created At",
    width: 99,
    editable: false,
    renderCell: (params) => {
      try {
        const date = new Date(params.row.created_at);
        if (isNaN(date.getTime())) {
          console.error("Invalid date:", params.row.created_at);
          return "Invalid Date";
        }
        return format(date, "yyyy-MM-dd");
      } catch (error) {
        console.error("Date formatting error:", error);
        return "Invalid Date";
      }
    },
  },
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 105,
    cellClassName: "actions",
    getActions: ({ id }) => [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon />}
        label="Edit"
        className="textPrimary"
        onClick={handleEditClick(id as string)}
        color="inherit"
        sx={{
          padding: "4px",
          color: "#3b82f6",
          "&:hover": {
            backgroundColor: "#eff6ff",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon />}
        label="Delete"
        onClick={handleDeleteClick(id as string)}
        color="inherit"
        sx={{
          padding: "4px",
          color: "#ef4444",
          "&:hover": {
            backgroundColor: "#fee2e2",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      />,
    ],
  },
  {
    field: "order",
    headerName: "Order",
    width: 105,
    filterable: true,
    renderCell: (params: GridRenderCellParams<SkeletonRow>) => {
      const row = params.row;
      const order = row?.order;
      return order ? (
        <Tooltip title={`Batch: ${order.order_batch}`}>
          <span>{`${order.order_name} (${order.order_batch})`}</span>
        </Tooltip>
      ) : (
        "No order"
      );
    },
    getApplyQuickFilterFn: (quickFilterValue: string) => {
      return (params: GridRenderCellParams<SkeletonRow>): boolean => {
        const row = params.row;
        const order = row?.order;
        if (!order) return false;
        
        const searchStr = quickFilterValue.toLowerCase();
        return (
          order.order_batch.toLowerCase().includes(searchStr) ||
          order.order_name.toLowerCase().includes(searchStr)
        );
      };
    }
  },
]; 