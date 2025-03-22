import { Box, CircularProgress } from "@mui/material";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "2rem",
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: "#3b82f6",
        }}
      />
      
      <Box
        sx={{
          color: "#475569",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {message}
      </Box>
    </Box>
  );
}; 