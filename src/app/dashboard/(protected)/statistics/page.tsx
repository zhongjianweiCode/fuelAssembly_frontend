'use client';

import { useState } from 'react';
import { useAllSkeletons } from '@/hooks/useSkeleton';
import { getSkeletonStats, calculateBinStats } from '@/lib/data';
import { QualityTrendChart } from '@/components/charts/QualityTrendChart';
import DistributionTable from '@/components/charts/DistributionTable';
import { Statistics } from '@/components/skeleton/components/Statistics';
import { DatePicker } from '@/components/common/DatePicker';
import { DescriptiveStatsTable } from '@/components/charts/DescriptiveStatsTable';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// 定义区间
const flatnessBins = [0, 0.03, 0.06, 0.09, 0.12, 0.15];
const perpendicularityBins = [0, 0.05, 0.10, 0.12, 0.15, 0.25];

export default function StatisticsPage() {
  const { data: skeletons } = useAllSkeletons();
  const [startDate, setStartDate] = useState<Date>(() => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1); // January 1st of current year
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // 使用辅助函数获取数据
  const skeletonData = getSkeletonStats(skeletons || [], startDate, endDate);
  
  // 根据日期范围过滤数据后再计算分布
  const filteredSkeletons = (skeletons || []).filter(skeleton => {
    const skeletonDate = new Date(skeleton.created_at);
    return skeletonDate >= startDate && skeletonDate <= endDate;
  });

  const flatnessStats = calculateBinStats(
    filteredSkeletons.map(s => s.flatness),
    flatnessBins
  );
  const perpendicularityStats = calculateBinStats(
    filteredSkeletons.map(s => s.perpendiculartity),
    perpendicularityBins
  );

  // 计算平均值
  const avgPerpendicularity = skeletonData.reduce((sum, item) => sum + item.perpendicularity, 0) / skeletonData.length;
  const avgFlatness = skeletonData.reduce((sum, item) => sum + item.flatness, 0) / skeletonData.length;

  // 计算合适的标签间隔
  const calculateInterval = () => {
    return Math.ceil(skeletonData.length / (isMobile ? 10 : 20)); // 移动端显示更少的标签
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Statistics Analysis</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
          />
        </div>
      </div>

      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-[300px]">
          {['Total Skeletons','Quality Trends',  'Distribution Analysis',].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 sm:mt-6">
        {activeTab === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <QualityTrendChart
              data={skeletonData}
              title="Perpendicularity(Rb)"
              dataKey="perpendicularity"
              color="#8884d8"
              mean={avgPerpendicularity}
              upperLimit={0.25}
              calculateInterval={calculateInterval}
            />
            <QualityTrendChart
              data={skeletonData}
              title="Flatness Trend"
              dataKey="flatness"
              color="#008C8C"              
              mean={avgFlatness}
              upperLimit={0.15}
              calculateInterval={calculateInterval}
            />
          </div>
        )}

        {activeTab === 0 && (
          <Statistics 
            skeletons={skeletons || []} 
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {activeTab === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DistributionTable
                title="Perpendicularity(Rb) Distribution"
                bins={perpendicularityBins}
                counts={perpendicularityStats.counts}
                percentages={perpendicularityStats.percentages}
                theme="blue"
              />
              <DistributionTable
                title="Flatness Distribution"
                bins={flatnessBins}
                counts={flatnessStats.counts}
                percentages={flatnessStats.percentages}
                theme="orange"
              />
            </div>
            <DescriptiveStatsTable
              skeletons={skeletons || []}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}