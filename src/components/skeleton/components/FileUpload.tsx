import { Box, CircularProgress } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload = ({
  onFileSelect,
  isUploading = false,
  accept = ".xlsx,.xls",
  multiple = false,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{
        border: "1px dashed",
        borderColor: dragActive ? "#3b82f6" : "#e2e8f0",
        borderRadius: "0.75rem",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: dragActive 
          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.08))"
          : "linear-gradient(135deg, #f8fafc, #ffffff)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        minWidth: "200px",
        height: "56px",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05))",
          opacity: dragActive ? 1 : 0,
          transition: "all 0.3s ease-in-out",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))",
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
        },
        "&:hover": {
          borderColor: "#3b82f6",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(37, 99, 235, 0.04))",
          "&::after": {
            opacity: 1,
          },
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.1)",
        }
      }}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {isUploading ? (
        <CircularProgress 
          size={24} 
          sx={{ 
            color: "#3b82f6",
            marginRight: "0.5rem",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            }
          }} 
        />
      ) : (
        <CloudUpload
          sx={{
            fontSize: "1.5rem",
            color: dragActive ? "#3b82f6" : "#94a3b8",
            transition: "all 0.3s ease-in-out",
            transform: dragActive ? "scale(1.1)" : "scale(1)",
          }}
        />
      )}
      <Box
        sx={{
          color: "#475569",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box 
          component="span" 
          sx={{ 
            fontWeight: 600,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "all 0.3s ease-in-out",
            letterSpacing: "0.01em",
          }}
        >
          {isUploading ? "Uploading..." : "Choose file"}
        </Box>
        {!isUploading && (
          <Box 
            component="span" 
            sx={{ 
              color: "#94a3b8",
              fontSize: "0.75rem",
              fontWeight: 500,
              opacity: 0.9,
              letterSpacing: "0.01em",
            }}
          >
            or drop file here
          </Box>
        )}
      </Box>
    </Box>
  );
}; 