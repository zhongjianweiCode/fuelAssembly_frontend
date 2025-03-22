import { Box } from "@mui/material";
import { format } from "date-fns";
import { SkeletonItem } from "@/types/skeleton";
import { StatusStatistics } from "./StatusStatistics";

interface StatisticsProps {
  skeletons: SkeletonItem[];
  startDate: Date;
  endDate: Date;
}

export function Statistics({ skeletons, startDate, endDate }: StatisticsProps) {
  // Filter skeletons by date range
  const filteredSkeletons = skeletons.filter((skeleton) => {
    const skeletonDate = new Date(skeleton.created_at);
    return skeletonDate >= startDate && skeletonDate <= endDate;
  });

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "2rem",
        height: "auto",
        minHeight: "fit-content",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* 总数统计卡片 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: "1.5rem",
          backgroundColor: "#f0f7ff",
          borderRadius: "0.75rem",
          border: "1px solid #e0eeff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              color: "#1e40af",
              fontSize: "2.5rem",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {filteredSkeletons.length}
          </span>
          <span
            style={{
              color: "#3b82f6",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Total Skeletons in Period
          </span>
        </Box>
      </Box>

      {/* 状态统计 */}
      <StatusStatistics skeletons={filteredSkeletons} />

      {/* 订单统计标题 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #f0f7ff",
          paddingBottom: "0.75rem",
        }}
      >
        <span
          style={{
            color: "#1e40af",
            fontSize: "1.125rem",
            fontWeight: 600,
          }}
        >
          Latest Orders Statistics
        </span>
      </Box>

      {/* 订单统计卡片网格 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {Array.from(
          filteredSkeletons.reduce((acc, skeleton) => {
            if (skeleton.order && acc.size < 10) {
              const key = `${skeleton.order.order_name} (${skeleton.order.order_batch})`;
              if (!acc.has(key)) {
                acc.set(key, {
                  count: 1,
                  created_at: skeleton.created_at,
                  order_batch: skeleton.order.order_batch,
                });
              } else {
                const existing = acc.get(key);
                if (existing) {
                  existing.count += 1;
                }
              }
            }
            return acc;
          }, new Map())
        )
          .sort((a, b) => {
            const batchA = parseInt(a[1].order_batch.replace(/\D/g, ""), 10);
            const batchB = parseInt(b[1].order_batch.replace(/\D/g, ""), 10);
            return batchB - batchA;
          })
          .slice(0, 8)
          .map(([orderName, data]) => (
            <Box
              key={orderName}
              sx={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 15px -3px rgb(59 130 246 / 0.1)",
                  borderColor: "#93c5fd",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#1e40af",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {orderName}
                </span>
                <span
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {data.count}
                </span>
              </Box>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {format(new Date(data.created_at), "yyyy-MM-dd")}
              </span>
            </Box>
          ))}
      </Box>
    </Box>
  );
}
