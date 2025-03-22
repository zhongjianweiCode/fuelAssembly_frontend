'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { lusitana } from '../font';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function RevenueChart({ monthlyCounts }: { monthlyCounts: number[] }) {
  const data = monthlyCounts.map((count, index) => ({
    name: months[index],
    value: count,
  }));

  return (
    <div className="flex w-full flex-col h-full">
      <h2 className={`${lusitana.className} mb-4 text-2xl md:text-3xl font-bold text-gray-800`}>
        Monthly Productions
      </h2>
      <div className="flex grow flex-col justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 shadow-lg">
        <div className="bg-white px-6 h-[400px] rounded-xl border border-gray-100 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
              />
              <YAxis
                hide={true}
                domain={[0, Math.max(...monthlyCounts) * 1.2]}
              />
              <Tooltip
                cursor={{ fill: '#e5e7eb' }}
                contentStyle={{
                  background: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                formatter={(value) => [`Count: ${value}`, '']}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                animationDuration={600}
                fill="url(#colorGradient)"
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#1f2937"
                  fontSize={12}
                  fontWeight={500}
                  formatter={(value: number) => value > 0 ? value : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}