import { Box } from "@mui/material";
import { format } from "date-fns";

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <span
        style={{
          color: "#1e40af",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <input
        type="date"
        value={format(value, "yyyy-MM-dd")}
        onChange={(e) => onChange(new Date(e.target.value))}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          color: "#1e40af",
          fontSize: "0.875rem",
          fontWeight: 500,
          outline: "none",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#93c5fd";
          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
      />
    </Box>
  );
} 