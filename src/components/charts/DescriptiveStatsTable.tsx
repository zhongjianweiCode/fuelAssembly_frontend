import { Box, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { SkeletonItem } from "@/types/skeleton";
import { calculateDescriptiveStats } from "@/lib/data";

interface DescriptiveStatsTableProps {
  skeletons: SkeletonItem[];
  startDate: Date;
  endDate: Date;
}

export function DescriptiveStatsTable({
  skeletons,
  startDate,
  endDate,
}: DescriptiveStatsTableProps) {
  const [platform, setPlatform] = useState<"A" | "B">("A");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 根据日期范围过滤数据
  const filteredSkeletons = skeletons.filter((skeleton) => {
    const skeletonDate = new Date(skeleton.created_at);
    return skeletonDate >= startDate && skeletonDate <= endDate;
  });

  // 获取统计数据
  const stats = calculateDescriptiveStats(filteredSkeletons, platform);

  // 表格数据
  const rows = [
    {
      metric: "Length",
      min: stats.length.min,
      max: stats.length.max,
      mean: stats.length.mean,
    },
    {
      metric: "Perpendicularity",
      min: stats.perpendicularity.min,
      max: stats.perpendicularity.max,
      mean: stats.perpendicularity.mean,
    },
    {
      metric: "Flatness",
      min: stats.flatness.min,
      max: stats.flatness.max,
      mean: stats.flatness.mean,
    },
  ];

  // 导出CSV功能
  const exportToCSV = () => {
    // 创建CSV内容
    const headers = ["Metric", "Min", "Max", "Mean"];
    const csvContent = [
      headers.join(","),
      ...rows.map(row => [
        row.metric,
        row.min,
        row.max,
        row.mean
      ].join(","))
    ].join("\n");

    // 创建Blob对象
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement("a");
    const fileName = `descriptive-stats-platform-${platform}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);

    // 触发下载
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
        padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 10px 15px -3px rgb(59 130 246 / 0.1)",
          borderColor: "#93c5fd",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: "1rem", sm: "0" },
          marginBottom: { xs: "1.5rem", sm: "2rem" },
          paddingBottom: "1rem",
          borderBottom: "2px solid #f0f7ff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <span
            style={{
              color: "#1e40af",
              fontSize: isMobile ? "1.125rem" : "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
            }}
          >
            Descriptive Statistics
          </span>
          <span
            style={{
              backgroundColor: "#f0f7ff",
              color: "#3b82f6",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Platform {platform}
          </span>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          <button
            onClick={exportToCSV}
            style={{
              padding: isMobile ? "0.375rem 0.75rem" : "0.5rem 1rem",
              backgroundColor: "white",
              color: "#047857",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f0fdf4";
              e.currentTarget.style.borderColor = "#86efac";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(34 197 94 / 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.boxShadow = "0 1px 2px 0 rgb(0 0 0 / 0.05)";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "14" : "16"}
              height={isMobile ? "14" : "16"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isMobile ? "CSV" : "Export CSV"}
          </button>
          <ToggleButtonGroup
            value={platform}
            exclusive
            onChange={(_, newPlatform) => {
              if (newPlatform !== null) {
                setPlatform(newPlatform);
              }
            }}
            size={isMobile ? "small" : "small"}
            sx={{
              "& .MuiToggleButton-root": {
                padding: { xs: "0.375rem 0.75rem", sm: "0.5rem 1rem" },
                color: "#64748b",
                borderColor: "#e5e7eb",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f0f7ff",
                },
                "&.Mui-selected": {
                  backgroundColor: "#3b82f6",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                },
              },
            }}
          >
            <ToggleButton value="A">Platform A</ToggleButton>
            <ToggleButton value="B">Platform B</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box
        sx={{
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f5f9",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#94a3b8",
            },
          },
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: isMobile ? "300px" : "auto",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: isMobile ? "0.75rem" : "1rem",
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e5e7eb",
                  textAlign: "left",
                  color: "#1e40af",
                  fontWeight: 600,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  letterSpacing: "0.025em",
                  whiteSpace: "nowrap",
                }}
              >
                Metric
              </th>
              {["Min", "Max", "Mean"].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: isMobile ? "0.75rem" : "1rem",
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e5e7eb",
                    textAlign: "right",
                    color: "#1e40af",
                    fontWeight: 600,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    letterSpacing: "0.025em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.metric}
                style={{
                  backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                  transition: "background-color 0.2s ease-in-out",
                }}
              >
                <td
                  style={{
                    padding: isMobile ? "0.75rem" : "1rem",
                    color: "#1e40af",
                    fontWeight: 500,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.metric}
                </td>
                <td
                  style={{
                    padding: isMobile ? "0.75rem" : "1rem",
                    textAlign: "right",
                    color: "#64748b",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    fontFamily: "monospace",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.min}
                </td>
                <td
                  style={{
                    padding: isMobile ? "0.75rem" : "1rem",
                    textAlign: "right",
                    color: "#64748b",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    fontFamily: "monospace",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.max}
                </td>
                <td
                  style={{
                    padding: isMobile ? "0.75rem" : "1rem",
                    textAlign: "right",
                    color: "#64748b",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    fontFamily: "monospace",
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.mean}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
} 