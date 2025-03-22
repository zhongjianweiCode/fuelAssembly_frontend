import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { useState } from 'react';
import { Box } from '@mui/material';

interface QualityData {
  sk_number: string;
  perpendicularity?: number;
  flatness?: number;
  [key: string]: string | number | undefined;
}

interface QualityTrendChartProps {
  data: QualityData[];
  title: string;
  dataKey: string;
  color: string;
  mean: number;
  upperLimit: number;
  calculateInterval: () => number;
}

export function QualityTrendChart({
  data,
  title,
  dataKey,
  color,
  mean,
  upperLimit,
  calculateInterval
}: QualityTrendChartProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // 生成安全的ID
  const getSafeId = (text: string) => {
    return text.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  };

  // 导出SVG函数
  const exportToSVG = () => {
    const chartId = getSafeId(title);
    const svgElement = document.querySelector(`#${chartId}-chart svg`);
    if (svgElement) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${title.replace(/[^a-zA-Z0-9-]/g, '-')}-chart.svg`;
        link.download = fileName;
        
        if (window.confirm(`confirm to download this ${fileName}？\n to your folder.`)) {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setNotificationMessage(`The chart has been successfully exported to ${fileName}`);
          setShowNotification(true);
          
          setTimeout(() => {
            setShowNotification(false);
          }, 3000);
        }
      } catch {
        setNotificationMessage('An error occurred while exporting the chart, please try again');
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    }
  };

  const chartId = getSafeId(title);

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
        padding: "2rem",
        border: "1px solid #e5e7eb",
        position: "relative",
      }}
    >
      {showNotification && (
        <Box
          sx={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 50,
            padding: "1rem",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            backgroundColor: notificationMessage.includes('error') ? "#fee2e2" : "#ecfdf5",
            color: notificationMessage.includes('error') ? "#991b1b" : "#065f46",
          }}
        >
          {notificationMessage}
        </Box>
      )}
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            color: "#1e40af",
            fontSize: "1.125rem",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
        <button
          onClick={exportToSVG}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6";
          }}
        >
          Export SVG
        </button>
      </Box>
      <Box
        sx={{
          height: "500px",
        }}
        id={`${chartId}-chart`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="sk_number" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={calculateInterval()}
              tick={{ fontSize: 12, fill: "#64748b" }}
              stroke="#94a3b8"
            />
            <YAxis 
              domain={[0, dataKey === 'perpendicularity' ? 0.30 : 0.18]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => value.toFixed(3)}
              stroke="#94a3b8"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: "10px",
                color: "#1e40af",
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              dot={{ r: 2, fill: color }}
              activeDot={{ r: 5, fill: color }}
              strokeWidth={2}
            />
            <ReferenceLine 
              y={mean} 
              stroke="#4CAF50" 
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ 
                position: 'insideTopRight',
                fill: '#4CAF50',
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <ReferenceLine 
              y={upperLimit} 
              stroke="#F44336" 
              strokeDasharray="3 3"
              strokeWidth={3}
              label={{ 
                value: `Limit: ${upperLimit}`, 
                position: 'insideTopRight',
                fill: '#F44336',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
} 