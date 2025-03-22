import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

export const StyledDataGrid = styled(DataGrid)(() => ({
  border: "none",
  backgroundColor: "white",
  borderRadius: "1.5rem",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  "& .MuiDataGrid-main": {
    "& .MuiDataGrid-virtualScroller": {
      overflow: "auto",
      "&::-webkit-scrollbar": {
        width: "6px",
        height: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f5f9",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#cbd5e1",
        borderRadius: "3px",
        transition: "background-color 0.2s ease-in-out",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#94a3b8",
      },
    },
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    borderTopLeftRadius: "1.5rem",
    borderTopRightRadius: "1.5rem",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 16px!important",
    height: "52px!important",
    display: "flex!important",
    alignItems: "center!important",
    fontSize: "0.875rem",
    color: "#334155",
  },
  "& .MuiDataGrid-row": {
    height: "52px!important",
    minHeight: "52px!important",
    maxHeight: "52px!important",
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
    gap: "12px",
  },
  "& .textPrimary": {
    color: "#1e293b",
  },
})); 