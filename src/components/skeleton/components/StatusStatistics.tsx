import { Box, useMediaQuery, useTheme } from "@mui/material";
import { SkeletonItem } from "@/types/skeleton";

interface StatusStatisticsProps {
  skeletons: SkeletonItem[];
}

const statusConfig = {
  CMM: {
    color: "#2563eb",
    bgColor: "#dbeafe",
    borderColor: "#bfdbfe",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 0113 15.473v.001l.002-.001a.75.75 0 01.063 0z" />
      </svg>
    ),
  },
  Laboratory: {
    color: "#9333ea",
    bgColor: "#f3e8ff",
    borderColor: "#e9d5ff",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
      </svg>
    ),
  },
  Customer: {
    color: "#0891b2",
    bgColor: "#cffafe",
    borderColor: "#a5f3fc",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      </svg>
    ),
  },
  Released: {
    color: "#16a34a",
    bgColor: "#dcfce7",
    borderColor: "#bbf7d0",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  Used: {
    color: "#ca8a04",
    bgColor: "#fef9c3",
    borderColor: "#fef08a",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function StatusStatistics({ skeletons }: StatusStatisticsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const statusCounts = skeletons.reduce((acc, skeleton) => {
    const status = skeleton.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ marginTop: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #f0f7ff",
          paddingBottom: "0.75rem",
          marginBottom: { xs: "1rem", sm: "1.5rem" },
        }}
      >
        <span
          style={{
            color: "#1e40af",
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: 600,
          }}
        >
          Status Distribution
        </span>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(auto-fill, minmax(150px, 1fr))",
            sm: "repeat(auto-fill, minmax(200px, 1fr))",
          },
          gap: { xs: "0.75rem", sm: "1rem" },
        }}
      >
        {Object.entries(statusConfig).map(([status, config]) => (
          <Box
            key={status}
            sx={{
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              borderRadius: "1rem",
              padding: { xs: "0.75rem", sm: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: { xs: "0.75rem", sm: "1rem" },
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 16px -4px ${config.borderColor}`,
              },
            }}
          >
            <Box
              sx={{
                color: config.color,
                width: { xs: "2rem", sm: "2.5rem" },
                height: { xs: "2rem", sm: "2.5rem" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.75rem",
                backgroundColor: "white",
                boxShadow: `0 2px 4px ${config.borderColor}`,
                flexShrink: 0,
              }}
            >
              {config.icon}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  color: config.color,
                  fontSize: isMobile ? "1.125rem" : "1.25rem",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {statusCounts[status] || 0}
              </span>
              <span
                style={{
                  color: config.color,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {status}
              </span>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
} 