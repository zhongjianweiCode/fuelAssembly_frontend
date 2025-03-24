"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridToolbarProps,
} from "@mui/x-data-grid";
import { SkeletonItem } from "@/types/skeleton";
import { format } from "date-fns";
import {
  useDeleteSkeleton,
  useAllSkeletons,
  useImportExcel,
  useRefreshSkeletons,
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
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { FileUpload } from "@/components/skeleton/components/FileUpload";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

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

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    handleAddClick: () => void;
    setIsImportDialogOpen: (open: boolean) => void;
    isImporting: boolean;
    importProgress: number;
    isRefreshing: boolean;
    onRefresh: () => void;
  }
}

interface CustomToolbarProps {
  handleAddClick: () => void;
  setIsImportDialogOpen: (open: boolean) => void;
  isImporting: boolean;
  importProgress: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function CustomToolbar(props: GridToolbarProps) {
  // Extract custom props from slotProps
  const customProps = props as GridToolbarProps & CustomToolbarProps;
  const { 
    setIsImportDialogOpen, 
    isImporting, 
    importProgress, 
    handleAddClick,
    isRefreshing,
    onRefresh
  } = customProps;
  
  return (
    <GridToolbarContainer
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 1,
      }}
    >
      <div className="flex flex-wrap gap-1">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          size="small"
          startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={isRefreshing}
          sx={{
            minWidth: "32px",
            height: "32px",
            color: "#64748b",
            transition: "all 0.2s",
            borderRadius: "6px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              color: "#334155"
            }
          }}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="flex-grow" />
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          color="primary"
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleAddClick}
          size="small"
          sx={{
            borderRadius: "8px",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            backgroundColor: "#3b82f6",
            textTransform: "none",
            fontWeight: 500,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#2563eb",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          Create Skeleton
        </Button>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => setIsImportDialogOpen(true)}
          size="small"
          startIcon={isImporting ? <CircularProgress size={16} color="inherit" /> : null}
          disabled={isImporting}
          sx={{
            borderRadius: "8px",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            borderColor: "#e2e8f0",
            color: "#64748b",
            backgroundColor: "white",
            textTransform: "none",
            fontWeight: 500,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            },
            "& .MuiCircularProgress-root": {
              color: "#6366f1",
            }
          }}
        >
          {isImporting ? `Importing ${importProgress > 0 ? `${importProgress}%` : ''}` : "Import file"}
        </Button>
        <GridToolbarExport 
          csvOptions={{ 
            fileName: `skeletons-export-${format(new Date(), "yyyy-MM-dd")}` 
          }} 
        />
        <GridToolbarQuickFilter />
      </div>
    </GridToolbarContainer>
  );
}

interface OrderData {
  order_name: string;
  order_batch: string;
}

export function SkeletonFormMUI({ orders }: { orders: OrderItem[] }) {
  const { data: skeletonsData, isLoading, error} = useAllSkeletons({
    refetchOnWindowFocus: false,
    // Reduce polling interval to improve responsiveness
    refetchInterval: 1000 * 30 // 30 seconds polling
  });
  
  const skeletons = skeletonsData ? [...skeletonsData].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];
  
  const refreshSkeletons = useRefreshSkeletons();
  const { mutate: importMutate, isPending: isMutationImporting } = useImportExcel();
  const { mutate: deleteMutate } = useDeleteSkeleton();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkeleton, setSelectedSkeleton] = useState<SkeletonItem | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skeletonToDelete, setSkeletonToDelete] = useState<GridRowId | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isRefreshComplete, setIsRefreshComplete] = useState(false);

  const isImportLoading = isImporting || isMutationImporting;
  
  // Only show refresh indicator for explicit manual refreshes, not after mutations
  const isRefreshing = isManualRefreshing;

  // Helper function to safely end refreshing state
  const endRefreshState = () => {
    try {
      // Mark refresh as complete
      setIsRefreshComplete(true);
      
      // Clear the refreshing state after a short delay
      setTimeout(() => {
        setIsManualRefreshing(false);
        setIsRefreshComplete(false);
      }, 300);
    } catch (error) {
      // Fallback in case of errors
      console.error("Error ending refresh state:", error);
      setIsManualRefreshing(false);
      setIsRefreshComplete(false);
    }
  };

  // Immediately stop any refresh indicators when component unmounts
  useEffect(() => {
    return () => {
      setIsManualRefreshing(false);
      setIsRefreshComplete(false);
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshSkeletons();
      endRefreshState();
    } catch (error) {
      console.error("Error refreshing skeletons:", error);
      endRefreshState();
      toast.error("Failed to refresh data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // Add useEffect to handle automatic refresh state clearing
  useEffect(() => {
    // Only monitor refresh state for manual refreshes
    if (isManualRefreshing && !isRefreshComplete) {
      // Set a max timeout just in case something goes wrong with refresh
      const safetyTimeout = setTimeout(() => {
        console.log("Safety timeout: forcing end of refresh state");
        endRefreshState();
      }, 5000); // 5 second safety timeout
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [isManualRefreshing, isRefreshComplete]);

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
      // Close modal immediately while showing loading toast
      setDeleteConfirmOpen(false);
      const loadingToast = toast.loading("Deleting skeleton...");
      
      deleteMutate(skeletonToDelete, {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success("Skeleton deleted successfully");
          setSkeletonToDelete(null);
          // Ensure refreshing indicator stops
          endRefreshState();
        },
        onError: (error: Error) => {
          toast.dismiss(loadingToast);
          toast.error("Failed to delete skeleton", {
            description: error.message,
          });
          setSkeletonToDelete(null);
          // Ensure refreshing indicator stops
          endRefreshState();
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSkeletonToDelete(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setIsImporting(true);
      setImportError(null);
      
      // 模拟上传进度 - 在真实环境中可以使用 axios 的 onUploadProgress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Call the import mutation
      importMutate(file);
      
      // Set progress to 100% after successful import
      clearInterval(progressInterval);
      setImportProgress(100);
      
      // Close the dialog after a delay
      setTimeout(() => {
        setIsImportDialogOpen(false);
        setIsImporting(false);
        setImportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("file import error:", error);
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleImportDialogClose = () => {
    if (!isImportLoading) {
      setIsImportDialogOpen(false);
      setImportError(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "sk_number",
      headerName: "Skeleton ID",
      width: isMobile ? 90 : 106,
      editable: false,
      filterable: true,
    },
    {
      field: "perpendiculartity",
      headerName: "Rb",
      width: isMobile ? 60 : 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "flatness",
      headerName: "Flatness",
      width: isMobile ? 80 : 100,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "length",
      headerName: "Length",
      width: isMobile ? 80 : 110,
      editable: true,
      type: "number",
      filterable: true,
    },
    {
      field: "x",
      headerName: "X",
      width: isMobile ? 60 : 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "y",
      headerName: "Y",
      width: isMobile ? 60 : 70,
      editable: false,
      type: "number",
      filterable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: isMobile ? 100 : 120,
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
              padding: isMobile ? "2px 4px" : "2px 6px",
              borderRadius: "6px",
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              fontWeight: 500,
              width: "fit-content",
              minWidth: isMobile ? "60px" : "70px",
              textAlign: "center",
              textTransform: "capitalize",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "auto",
              lineHeight: "normal",
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
      width: isMobile ? 80 : 90,
      editable: false,
      type: "singleSelect",
      valueOptions: Object.values(SkeletonPlatform),
      filterable: true,
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: isMobile ? 100 : 125,
      editable: false,
      renderCell: (params: GridRenderCellParams<SkeletonItem>) => {
        try {
          const date = new Date(params.row.created_at);
          return (
            <span style={{ 
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              lineHeight: "normal" 
            }}>
              {format(date, "yyyy-MM-dd")}
            </span>
          );
        } catch (error) {
          console.error("Date formatting error:", error);
          return <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>Invalid Date</span>;
        }
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: isMobile ? 90 : 120,
      cellClassName: "actions",
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
          sx={{
            padding: isMobile ? "4px" : "6px",
            color: "#3b82f6",
            height: "28px",
            width: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          icon={<DeleteIcon fontSize="small" />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          color="inherit"
          sx={{
            padding: isMobile ? "4px" : "6px",
            color: "#ef4444",
            height: "28px",
            width: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
      width: isMobile ? 90 : 105,
      filterable: true,
      renderCell: (params: GridRenderCellParams) => {
        const order = (params.row as SkeletonItem).order as OrderData | undefined;
        return order ? (
          <Tooltip title={`Batch: ${order.order_batch}`}>
            <span style={{ 
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "normal"
            }}>
              {`${order.order_name} (${order.order_batch})`}
            </span>
          </Tooltip>
        ) : (
          <span style={{ 
            fontSize: isMobile ? "0.75rem" : "0.875rem",
            color: "#94a3b8"
          }}>
            No order
          </span>
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
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "80vh",
        padding: isMobile ? "12px" : "24px",
        background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
        borderRadius: isMobile ? "1rem" : "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 2 : 3,
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
        position: "relative"
      }}>
        {isRefreshing && (
          <Box 
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 5,
              height: "3px",
              background: "linear-gradient(to right, transparent, #6366f1, transparent)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              opacity: isRefreshComplete ? 0 : 1,
              transition: "opacity 0.3s ease-out",
              "@keyframes loading": {
                "0%": {
                  backgroundPosition: "100% 0%"
                },
                "100%": {
                  backgroundPosition: "0% 0%"
                }
              }
            }}
          />
        )}
        <Box sx={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          {error ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: isMobile ? "1rem" : "2rem",
              textAlign: "center",
              color: "#ef4444"
            }}>
              <p style={{ 
                marginBottom: "1rem", 
                fontSize: isMobile ? "1rem" : "1.125rem", 
                fontWeight: 500 
              }}>
                Error loading skeletons
              </p>
              <p style={{ 
                fontSize: isMobile ? "0.75rem" : "0.875rem", 
                maxWidth: "400px", 
                lineHeight: "1.5" 
              }}>
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
              padding: isMobile ? "1rem" : "2rem"
            }}>
              <p style={{ color: "#64748b" }}>Loading skeletons...</p>
            </div>
          ) : (
            <DataGrid
              rows={skeletons}
              columns={columns}
              editMode="row"
              slots={{
                toolbar: CustomToolbar,
                noRowsOverlay: () => (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: isMobile ? "1.5rem" : "2.5rem",
                    textAlign: "center",
                    color: "#64748b",
                    background: "#f8fafc"
                  }}>
                    <p style={{ 
                      marginBottom: "1rem", 
                      fontSize: isMobile ? "1rem" : "1.125rem", 
                      color: "#334155", 
                      fontWeight: 600 
                    }}>
                      No skeletons found
                    </p>
                    <p style={{ 
                      fontSize: isMobile ? "0.75rem" : "0.875rem", 
                      color: "#64748b", 
                      maxWidth: "400px", 
                      lineHeight: "1.5",
                      marginBottom: "1rem"
                    }}>
                      Get started by adding your first skeleton using the &quot;Create Skeleton&quot; button above, or import data from an Excel file.
                    </p>
                  </div>
                ),
                loadingOverlay: () => (
                  <Backdrop open={true} sx={{ color: "#fff", zIndex: 1, backdropFilter: "blur(4px)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <CircularProgress color="primary" size={36} thickness={4} />
                      <div className="text-white text-sm font-medium">Loading skeletons...</div>
                    </div>
                  </Backdrop>
                ),
              }}
              slotProps={{
                toolbar: {
                  handleAddClick,
                  setIsImportDialogOpen,
                  isImporting: isImportLoading,
                  importProgress,
                  isRefreshing,
                  onRefresh: handleRefresh
                } as Partial<GridToolbarProps & {
                  handleAddClick: () => void;
                  setIsImportDialogOpen: (open: boolean) => void;
                  isImporting: boolean;
                  importProgress: number;
                  isRefreshing: boolean;
                  onRefresh: () => void;
                }>,
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: isMobile ? 5 : 10 } },
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
              pageSizeOptions={isMobile ? [5, 10, 25] : [5, 10, 25, 50, 100]}
              disableRowSelectionOnClick
              getRowHeight={() => isMobile ? 44 : 52}
              sx={{
                border: "none",
                borderRadius: "12px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
                "& .MuiDataGrid-main": {
                  padding: { xs: "0.5rem", sm: "1rem" },
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "0 8px",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                },
                "& .MuiDataGrid-columnHeader": {
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  fontWeight: 600,
                  color: "#475569",
                },
                "& .MuiDataGrid-row": {
                  borderRadius: "8px",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                  marginTop: "4px",
                  marginBottom: "4px",
                  height: isMobile ? "44px !important" : "52px !important",
                  maxHeight: isMobile ? "44px !important" : "52px !important",
                  minHeight: isMobile ? "44px !important" : "52px !important",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: "0 8px",
                  height: "100% !important",
                  display: "flex !important",
                  alignItems: "center !important",
                },
                "& .MuiDataGrid-cellContent": {
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  width: "100%",
                },
                "& .MuiDataGrid-cell--withRenderer": {
                  alignItems: "center",
                  lineHeight: "normal",
                },
                "& .MuiDataGrid-cell--textLeft": {
                  alignItems: "center",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "none",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  marginTop: "8px",
                },
                "& .MuiTablePagination-root": {
                  color: "#64748b",
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                },
                "& .MuiDataGrid-virtualScroller": {
                  marginTop: "0 !important",
                  marginBottom: "0 !important",
                },
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
            borderRadius: isMobile ? "1rem" : "1.5rem",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            overflow: "hidden",
            width: isMobile ? "calc(100% - 32px)" : "auto",
            margin: isMobile ? "0 16px" : "32px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: isMobile ? "1.125rem" : "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            borderBottom: "1px solid #e2e8f0",
            padding: isMobile ? "16px 20px" : "20px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ 
          padding: isMobile ? "20px" : "24px", 
          backgroundColor: "white" 
        }}>
          <DialogContentText sx={{ 
            color: "#64748b",
            fontSize: isMobile ? "0.875rem" : "1rem" 
          }}>
            Are you sure you want to delete this skeleton? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            padding: isMobile ? "12px 20px" : "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          <Button
            onClick={handleCancelDelete}
            sx={{
              color: "#64748b",
              padding: isMobile ? "6px 16px" : "8px 20px",
              borderRadius: isMobile ? "0.5rem" : "0.75rem",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
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
              padding: isMobile ? "6px 16px" : "8px 20px",
              borderRadius: isMobile ? "0.5rem" : "0.75rem",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
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

      <Dialog 
        open={isImportDialogOpen} 
        onClose={handleImportDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: '12px',
            padding: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.2rem', sm: '1.5rem' }, 
          fontWeight: 600,
          color: '#1e293b',
          pb: 1
        }}>
          Import Excel file
        </DialogTitle>
        <DialogContent>
          {importError ? (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <h4 className="font-bold mb-1">Import error</h4>
              <p className="text-sm">{importError}</p>
            </div>
          ) : null}
          
          <DialogContentText className="mb-4" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Please upload an Excel file containing skeleton data.
            {isImportLoading && (
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 text-right">{importProgress}%</div>
              </div>
            )}
          </DialogContentText>
          
          <FileUpload 
            onFileSelect={handleFileUpload} 
            isUploading={isImportLoading}
            accept=".xlsx,.xls"
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={handleImportDialogClose} 
            color="inherit"
            disabled={isImportLoading}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
