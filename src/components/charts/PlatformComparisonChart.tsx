'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';

interface PlatformData {
  sk_number: string;
  A: number;
  B: number;
}

interface PlatformComparisonChartProps {
  data: PlatformData[];
}

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Platform Length Comparison</h2>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="sk_number"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[3972.8, 3974.3]}
              tickFormatter={(value) => value.toFixed(3)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="A"
              name="Platform A"
              stroke="#1f77b4"
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="B"
              name="Platform B"
              stroke="#ff7f0e"
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 