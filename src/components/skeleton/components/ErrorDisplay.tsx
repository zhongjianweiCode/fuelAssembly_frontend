import { Box, Button } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fef2f2",
        border: "1px solid #fee2e2",
        borderRadius: "1rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <ErrorIcon
        sx={{
          fontSize: "3rem",
          color: "#ef4444",
        }}
      />
      
      <Box
        sx={{
          color: "#991b1b",
          textAlign: "center",
          fontSize: "0.875rem",
          maxWidth: "24rem",
        }}
      >
        {message}
      </Box>

      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            textTransform: "none",
            backgroundColor: "#ef4444",
            "&:hover": {
              backgroundColor: "#dc2626",
            },
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
}; 