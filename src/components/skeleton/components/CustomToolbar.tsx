import { Button } from "@mui/material";
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { CustomToolbarProps } from "../types";

export const CustomToolbar = ({
  handleFileUpload,
  handleAddClick,
  isImporting,
}: CustomToolbarProps) => (
  <GridToolbarContainer
    sx={{
      padding: "16px 20px!important",
      gap: "12px",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc",
      borderTopLeftRadius: "1.5rem",
      borderTopRightRadius: "1.5rem",
    }}
  >
    <GridToolbarFilterButton />
    <GridToolbarExport
      printOptions={{
        hideFooter: true,
        hideToolbar: true,
      }}
      csvOptions={{
        fileName: "skeletons-data",
        delimiter: ",",
        utf8WithBom: true,
      }}
    />
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleFileUpload}
      style={{ display: "none" }}
      id="excel-upload-input"
    />
    <label htmlFor="excel-upload-input">
      <Button
        component="span"
        startIcon={<UploadFileIcon />}
        disabled={isImporting}
        sx={{
          marginLeft: "auto",
          padding: "8px 20px",
          background: isImporting
            ? "#d1d5db"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
          "&:hover": {
            transform: isImporting ? "none" : "translateY(-2px)",
            boxShadow: isImporting
              ? "none"
              : "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
            background: isImporting
              ? "#d1d5db"
              : "linear-gradient(135deg, #059669 0%, #047857 100%)",
          },
        }}
      >
        {isImporting ? "Importing..." : "Import Excel"}
      </Button>
    </label>
    <Button
      startIcon={<AddIcon />}
      onClick={handleAddClick}
      sx={{
        marginLeft: "auto",
        padding: "8px 20px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        color: "white",
        border: "none",
        boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.2)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        },
      }}
    >
      Add record
    </Button>
  </GridToolbarContainer>
); 