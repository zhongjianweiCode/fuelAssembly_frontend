"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridRowModesModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridToolbarProps,
} from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { SkeletonItem } from "@/types/skeleton";
import { format } from "date-fns";
import {
  useDeleteSkeleton,
  useAllSkeletons,
  useImportExcel,
} from "@/hooks/useSkeleton";
import { toast } from "sonner";
import { SkeletonDialog } from "@/components/SkeletonDialog";
import { OrderItem } from "@/types/order";
import {
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { FileUpload } from "@/components/skeleton/components/FileUpload";

enum SkeletonStatus {
  CMM = "CMM",
  Laboratory = "Laboratory",
  Customer = "Customer",
  Released = "Released",
  Rejected = "Rejected",
  USED = "Used",
}

enum SkeletonPlatform {
  A = "A",
  B = "B",
}

const StyledDataGrid = styled(DataGrid)(() => ({
  border: "none",
  backgroundColor: "white",
  borderRadius: "1rem",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
  "& .MuiDataGrid-main": {
    "& .MuiDataGrid-virtualScroller": {
      overflow: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f8fafc",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#e2e8f0",
        borderRadius: "4px",
        transition: "background-color 0.2s ease-in-out",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#cbd5e1",
      },
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    "& .MuiDataGrid-columnHeader": {
      padding: "16px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      fontWeight: 600,
      color: "#334155",
      fontSize: "0.875rem",
      letterSpacing: "0.025em",
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f1f5f9",
      },
      "&:focus": {
        outline: "none",
      },
      "&:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-columnSeparator": {
      display: "none",
    },
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid #f1f5f9",
    padding: "12px 16px!important",
    height: "48px!important",
    display: "flex!important",
    alignItems: "center!important",
    fontSize: "0.875rem",
    color: "#475569",
    transition: "background-color 0.15s ease-in-out",
    "&:focus": {
      outline: "none",
    },
    "&:focus-within": {
      outline: "none",
    },
  },
  "& .MuiDataGrid-row": {
    height: "48px!important",
    minHeight: "48px!important",
    maxHeight: "48px!important",
    transition: "background-color 0.15s ease-in-out",
    "&:hover": {
      backgroundColor: "#f8fafc!important",
    },
    "&.Mui-selected": {
      backgroundColor: "#f1f5f9!important",
      "&:hover": {
        backgroundColor: "#e2e8f0!important",
      },
    },
    "&:nth-of-type(odd)": {
      backgroundColor: "#fafafa",
    },
  },
  "& .actions": {
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  "& .textPrimary": {
    color: "#334155",
  },
  "& .MuiDataGrid-cellContent": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: "1rem",
    borderBottomRightRadius: "1rem",
    minHeight: "52px",
  },
  "& .MuiTablePagination-root": {
    color: "#64748b",
  },
  "& .MuiDataGrid-selectedRowCount": {
    color: "#64748b",
  },
}));

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: SkeletonItem[]) => SkeletonItem[]) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
    handleFileUpload: (file: File) => void;
    handleAddClick: () => void;
    isImporting: boolean;
  }
}

function CustomGridToolbar(props: GridToolbarProps & {
  handleFileUpload: (file: File) => void;
  handleAddClick: () => void;
  isImporting: boolean;
}) {
  const { handleFileUpload, handleAddClick, isImporting } = props;
  
  return (
    <GridToolbarContainer
      sx={{
        padding: "8px 16px",
        gap: "8px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <GridToolbarQuickFilter 
          sx={{
            "& .MuiInputBase-root": {
              borderRadius: "0.5rem",
              border: "1px solid #e2e8f0",
              "&:hover": {
                borderColor: "#cbd5e1",
              }
            }
          }}
        />
        <FileUpload
          onFileSelect={handleFileUpload}
          isUploading={isImporting}
          accept=".xlsx,.xls"
        />
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            padding: "6px 16px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            border: "none",
            boxShadow: "0 1px 3px 0 rgba(59, 130, 246, 0.1)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }
          }}
        >
          Add record
        </Button>
      </div>
    </GridToolbarContainer>
  );
}

interface ImportResult {
  success_count: number;
  error_count: number;
  errors: string[];
}

interface OrderData {
  order_name: string;
  order_batch: string;
}

export function SkeletonFormMUI({ orders }: { orders: OrderItem[] }) {
  const { data: skeletonsData, isLoading, error } = useAllSkeletons();
  const skeletons = skeletonsData ? [...skeletonsData].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];
  
  const { mutate: importMutate, isPending: isImporting } = useImportExcel();
  const { mutate: deleteMutate } = useDeleteSkeleton();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkeleton, setSelectedSkeleton] = useState<SkeletonItem | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skeletonToDelete, setSkeletonToDelete] = useState<GridRowId | null>(null);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSkeleton(undefined);
  };

  const handleAddClick = () => {
    setDialogMode("add");
    setSelectedSkeleton(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (id: GridRowId) => () => {
    const skeleton = skeletons.find((row) => row.id === id);
    if (skeleton) {
      setDialogMode("edit");
      setSelectedSkeleton(skeleton);
      setDialogOpen(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setSkeletonToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (typeof skeletonToDelete === "string") {
      deleteMutate(skeletonToDelete, {
        onSuccess: () => {
          toast.success("Skeleton deleted successfully");
          setDeleteConfirmOpen(false);
          setSkeletonToDelete(null);
        },
        onError: (error: Error) => {
          toast.error("Failed to delete skeleton", {
            description: error.message,
          });
          setDeleteConfirmOpen(false);
          setSkeletonToDelete(null);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSkeletonToDelete(null);
  };

  const handleFileUpload = (file: File) => {
    importMutate(file, {
      onSuccess: (result: ImportResult) => {
        if (result.error_count > 0) {
          toast.error('Excel file import completed with errors', {
            description: `Successfully imported ${result.success_count} records, but encountered ${result.error_count} errors:\n${result.errors.join('\n')}`,
          });
        } else {
          toast.success('Excel file imported successfully', {
            description: `${result.success_count} records imported`,
          });
        }
      },
      onError: (error: Error) => {
        console.error("Import error:", error);
        toast.error('Failed to import Excel file', {
          description: error.message,
        });
      },
    });
  };

  const columns: GridColDef[] = [
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
      width: 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "flatness",
      headerName: "Flatness",
      width: 100,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "length",
      headerName: "Length",
      width: 110,
      editable: true,
      type: "number",
      filterable: true,
    },
    {
      field: "x",
      headerName: "X",
      width: 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "y",
      headerName: "Y",
      width: 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
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
                color: "#2563eb", // 蓝色
                bgColor: "#dbeafe",
                borderColor: "#bfdbfe",
              };
            case SkeletonStatus.Laboratory:
              return {
                color: "#9333ea", // 紫色
                bgColor: "#f3e8ff",
                borderColor: "#e9d5ff",
              };
            case SkeletonStatus.Customer:
              return {
                color: "#0891b2", // 青色
                bgColor: "#cffafe",
                borderColor: "#a5f3fc",
              };
            case SkeletonStatus.Released:
              return {
                color: "#16a34a", // 绿色
                bgColor: "#dcfce7",
                borderColor: "#bbf7d0",
              };
            case SkeletonStatus.Rejected:
              return {
                color: "#dc2626", // 红色
                bgColor: "#fee2e2",
                borderColor: "#fecaca",
              };
            case SkeletonStatus.USED:
              return {
                color: "#ca8a04", // 黄色
                bgColor: "#fef9c3",
                borderColor: "#fef08a",
              };
            default:
              return {
                color: "#64748b", // 默认灰色
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
              // textTransform: 'uppercase',
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
      width: 90,
      editable: false,
      type: "singleSelect",
      valueOptions: Object.values(SkeletonPlatform),
      filterable: true,
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 125,
      editable: false,
      renderCell: (params: GridRenderCellParams<SkeletonItem>) => {
        try {
          const date = new Date(params.row.created_at);
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
      width: 120,
      cellClassName: "actions",
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
          sx={{
            padding: "4px",
            color: "#3b82f6",
            "&:hover": {
              backgroundColor: "#eff6ff",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          color="inherit"
          sx={{
            padding: "4px",
            color: "#ef4444",
            "&:hover": {
              backgroundColor: "#fee2e2",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
            },
            "&:active": {
              transform: "translateY(0)",
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
      renderCell: (params: GridRenderCellParams) => {
        const order = (params.row as SkeletonItem).order as OrderData | undefined;
        return order ? (
          <Tooltip title={`Batch: ${order.order_batch}`}>
            <span>{`${order.order_name} (${order.order_batch})`}</span>
          </Tooltip>
        ) : (
          "No order"
        );
      },
      getApplyQuickFilterFn: (quickFilterValue: string) => {
        return (params: { row: SkeletonItem }): boolean => {
          if (!params?.row) return false;
          const order = params.row.order as OrderData | undefined;
          if (!order) return false;
          
          const searchStr = quickFilterValue.toLowerCase();
          return (
            order.order_batch.toLowerCase().includes(searchStr) ||
            order.order_name.toLowerCase().includes(searchStr)
          );
        };
      }
    },
    // {
    //   field: "order_count",
    //   headerName: "Counts",
    //   width: 80,
    //   renderCell: (params) => {
    //     const currentOrder = params.row.order;
    //     if (!currentOrder) return 0;
    //     return skeletons.filter((row) => row.order?.id === currentOrder.id)
    //       .length;
    //   },
    // },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "80vh",
        padding: "24px",
        background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
        borderRadius: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ 
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}>
        <Box sx={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          {error ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "2rem",
              textAlign: "center",
              color: "#ef4444"
            }}>
              <p style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 500 }}>
                Error loading skeletons
              </p>
              <p style={{ fontSize: "0.875rem", maxWidth: "400px", lineHeight: "1.5" }}>
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
            </div>
          ) : isLoading ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "2rem"
            }}>
              <p style={{ color: "#64748b" }}>Loading skeletons...</p>
            </div>
          ) : (
            <StyledDataGrid
              rows={skeletons}
              columns={columns}
              slots={{
                toolbar: CustomGridToolbar,
                noRowsOverlay: () => (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: "2rem",
                    textAlign: "center",
                    color: "#64748b"
                  }}>
                    <p style={{ marginBottom: "1rem", fontSize: "1.125rem", color: "#475569", fontWeight: 500 }}>
                      No skeletons found
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8", maxWidth: "400px", lineHeight: "1.5" }}>
                      Get started by adding your first skeleton using the &quot;Add record&quot; button above, or import data from an Excel file.
                    </p>
                  </div>
                ),
              }}
              slotProps={{
                toolbar: {
                  handleFileUpload,
                  handleAddClick,
                  isImporting
                }
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'created_at', sort: 'desc' }],
                },
                filter: {
                  filterModel: {
                    items: [],
                    quickFilterValues: [],
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              disableRowSelectionOnClick
              getRowHeight={() => 44}
              sx={{
                flex: 1,
                border: "none",
                borderTop: "1px solid #e2e8f0",
              }}
            />
          )}
        </Box>
      </Box>

      <SkeletonDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        data={selectedSkeleton}
        mode={dialogMode}
        orders={orders}
      />
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            borderBottom: "1px solid #e2e8f0",
            padding: "20px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ padding: "24px", backgroundColor: "white" }}>
          <DialogContentText sx={{ color: "#64748b" }}>
            Are you sure you want to delete this skeleton? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            gap: "12px",
          }}
        >
          <Button
            onClick={handleCancelDelete}
            sx={{
              color: "#64748b",
              padding: "8px 20px",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.025em",
              textTransform: "none",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f8fafc",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                border: "1px solid #cbd5e1",
              },
              "&:active": {
                backgroundColor: "#f1f5f9",
                transform: "translateY(0)",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              padding: "8px 20px",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.025em",
              textTransform: "none",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              boxShadow: "0 2px 4px -1px rgb(239 68 68 / 0.2)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#dc2626",
                transform: "translateY(-1px)",
                boxShadow:
                  "0 4px 6px -1px rgb(239 68 68 / 0.3), 0 2px 4px -2px rgb(239 68 68 / 0.2)",
              },
              "&:active": {
                backgroundColor: "#b91c1c",
                transform: "translateY(0)",
                boxShadow: "0 1px 2px 0 rgb(239 68 68 / 0.05)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
