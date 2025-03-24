"use client";
import { SkeletonItem } from "@/types/skeleton";
import { parseISO } from "date-fns";

/**
 * 数据处理函数，接收骨架数据并计算各种统计信息
 * 这些函数不再负责数据获取，只负责数据转换
 */

// 获取年度生产骨架产品的数量
export function getYearlySkeletonCount(skeletons: SkeletonItem[]) {
  if (!skeletons || skeletons.length === 0) return 0;
  
  const currentYear = new Date().getFullYear();
  return skeletons.filter(skeleton => {
    const createdYear = new Date(skeleton.created_at).getFullYear();
    return createdYear === currentYear;
  }).length;
}

// 获取每月生产骨架产品的数量
export function getMonthlySkeletonCounts(skeletons: SkeletonItem[]) {
  if (!skeletons || skeletons.length === 0) return new Array(12).fill(0);
  
  const currentYear = new Date().getFullYear();
  const monthlyCounts = new Array(12).fill(0);

  skeletons.forEach(skeleton => {
    const createdDate = new Date(skeleton.created_at);
    if (createdDate.getFullYear() === currentYear) {
      monthlyCounts[createdDate.getMonth()]++;
    }
  });

  return monthlyCounts;
}

// 获取已放行骨架的数量
export function getReleasedSkeletonCount(skeletons: SkeletonItem[]) {
  if (!skeletons || skeletons.length === 0) return 0;
  return skeletons.filter(skeleton => skeleton.status === "Released").length;
}

// 获取新生产的骨架数量
export function getNewSkeletonCount(skeletons: SkeletonItem[]) {
  if (!skeletons || skeletons.length === 0) return 0;
  return skeletons.filter(skeleton => skeleton.status === "CMM").length;
}

// 获取当前月份的骨架数量
export function getCurrentMonthSkeletonCount(skeletons: SkeletonItem[]) {
  if (!skeletons || skeletons.length === 0) return 0;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  return skeletons.filter(skeleton => {
    const createdDate = new Date(skeleton.created_at);
    return createdDate.getFullYear() === currentYear && 
           createdDate.getMonth() === currentMonth;
  }).length;
}

interface QuarterlyData {
  quarter: string;
  perpendicularity: number[];
  flatness: number[];
}

interface QuarterlyStats {
  quarter: string;
  avgPerpendicularity: number;
  avgFlatness: number;
}

export function getQuarterlyStats(skeletons: SkeletonItem[], startDate: Date, endDate: Date): QuarterlyStats[] {
  return skeletons
    .filter(skeleton => {
      const date = parseISO(skeleton.created_at);
      return date >= startDate && date <= endDate;
    })
    .reduce((acc: QuarterlyData[], skeleton) => {
      const date = parseISO(skeleton.created_at);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const yearQuarter = `${date.getFullYear()} Q${quarter}`;
      
      const existingQuarter = acc.find(item => item.quarter === yearQuarter);
      if (existingQuarter) {
        existingQuarter.perpendicularity.push(skeleton.perpendiculartity);
        existingQuarter.flatness.push(skeleton.flatness);
      } else {
        acc.push({
          quarter: yearQuarter,
          perpendicularity: [skeleton.perpendiculartity],
          flatness: [skeleton.flatness],
        });
      }
      return acc;
    }, [])
    .map(quarter => ({
      quarter: quarter.quarter,
      avgPerpendicularity: quarter.perpendicularity.reduce((a: number, b: number) => a + b, 0) / quarter.perpendicularity.length,
      avgFlatness: quarter.flatness.reduce((a: number, b: number) => a + b, 0) / quarter.flatness.length,
    }));
}

interface PlatformData {
  sk_number: string;
  length: number;
}

interface PlatformGroups {
  [key: string]: PlatformData[];
}

interface PlatformComparisonData {
  sk_number: string;
  [key: string]: string | number;
}

export function getPlatformComparison(skeletons: SkeletonItem[], startDate: Date, endDate: Date): PlatformComparisonData[] {
  const platformGroups = skeletons
    .filter(skeleton => {
      const date = parseISO(skeleton.created_at);
      return date >= startDate && date <= endDate;
    })
    .reduce((groups: PlatformGroups, skeleton) => {
      const platform = skeleton.platform;
      if (!groups[platform]) {
        groups[platform] = [];
      }
      groups[platform].push({
        sk_number: skeleton.sk_number,
        length: skeleton.length
      });
      return groups;
    }, {});

  const allSkNumbers = [...new Set(
    Object.values(platformGroups)
      .flat()
      .map(item => item.sk_number)
  )].sort();

  return allSkNumbers.map(sk_number => {
    const dataPoint: PlatformComparisonData = { sk_number };
    Object.keys(platformGroups).forEach(platform => {
      const skeletonData = platformGroups[platform].find(s => s.sk_number === sk_number);
      if (skeletonData) {
        dataPoint[platform] = skeletonData.length;
      }
    });
    return dataPoint;
  });
}

// 计算区间统计
export function calculateBinStats(data: number[], bins: number[]) {
  const counts = new Array(bins.length - 1).fill(0);
  const percentages = new Array(bins.length - 1).fill(0);
  
  // 过滤掉无效数据
  const validData = data.filter(value => value !== null && value !== undefined && !isNaN(value));
  
  // 计数
  validData.forEach(value => {
    for (let i = 0; i < bins.length - 1; i++) {
      if (value >= bins[i] && value < bins[i + 1]) {
        counts[i]++;
        break;
      }
    }
  });

  // 计算百分比
  const total = validData.length;
  if (total > 0) {
    for (let i = 0; i < counts.length; i++) {
      percentages[i] = (counts[i] / total) * 100;
    }
  }

  return { counts, percentages };
}

// 获取所有 dashboard 数据 - 接收骨架数据作为参数，不再负责获取数据
export function getDashboardData(skeletons: SkeletonItem[] = []) {
  return {
    yearlyCount: getYearlySkeletonCount(skeletons),
    monthlyCounts: getMonthlySkeletonCounts(skeletons),
    releasedCount: getReleasedSkeletonCount(skeletons),
    newCount: getNewSkeletonCount(skeletons),
    currentMonthCount: getCurrentMonthSkeletonCount(skeletons),
    totalCount: skeletons?.length || 0,
    statusDistribution: getStatusDistribution(skeletons),
    platformDistribution: getPlatformDistribution(skeletons),
    recentSkeletons: getRecentSkeletons(skeletons, 10),
  };
}

// 获取状态分布
export function getStatusDistribution(skeletons: SkeletonItem[]) {
  const distribution: { [key: string]: number } = {};
  skeletons.forEach(skeleton => {
    distribution[skeleton.status] = (distribution[skeleton.status] || 0) + 1;
  });
  return distribution;
}

// 获取平台分布
export function getPlatformDistribution(skeletons: SkeletonItem[]) {
  const distribution: { [key: string]: number } = {};
  skeletons.forEach(skeleton => {
    distribution[skeleton.platform] = (distribution[skeleton.platform] || 0) + 1;
  });
  return distribution;
}

// 获取最近的骨架数据
export function getRecentSkeletons(skeletons: SkeletonItem[], limit: number): SkeletonItem[] {
  return [...skeletons]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// 获取特定月份的骨架数量
export function getSkeletonCountByMonth(skeletons: SkeletonItem[], year: number, month: number) {
  return skeletons.filter(skeleton => {
    const date = new Date(skeleton.created_at);
    return date.getFullYear() === year && date.getMonth() === month;
  }).length;
}

// 获取特定状态的骨架列表
export function getSkeletonsByStatus(skeletons: SkeletonItem[], status: string): SkeletonItem[] {
  return skeletons.filter(skeleton => skeleton.status === status);
}

// 获取特定平台的骨架列表
export function getSkeletonsByPlatform(skeletons: SkeletonItem[], platform: string): SkeletonItem[] {
  return skeletons.filter(skeleton => skeleton.platform === platform);
}

// 获取日期范围内的骨架数量
export function getSkeletonCountInDateRange(skeletons: SkeletonItem[], startDate: Date, endDate: Date) {
  return skeletons.filter(skeleton => {
    const createdDate = new Date(skeleton.created_at);
    return createdDate >= startDate && createdDate <= endDate;
  }).length;
}

// 获取骨架生产趋势数据（按天统计）
export function getSkeletonProductionTrend(skeletons: SkeletonItem[], days: number) {
  const trend: { [key: string]: number } = {};
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 初始化日期范围内的所有日期
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    trend[d.toISOString().split('T')[0]] = 0;
  }

  // 统计每天的生产数量
  skeletons.forEach(skeleton => {
    const date = new Date(skeleton.created_at).toISOString().split('T')[0];
    if (trend.hasOwnProperty(date)) {
      trend[date]++;
    }
  });

  return trend;
}

// 获取骨架数据
export function getSkeletonStats(skeletons: SkeletonItem[], startDate: Date, endDate: Date) {
  return skeletons
    .filter(skeleton => {
      const date = parseISO(skeleton.created_at);
      return date >= startDate && date <= endDate;
    })
    .map(skeleton => ({
      sk_number: skeleton.sk_number,
      perpendicularity: skeleton.perpendiculartity,
      flatness: skeleton.flatness,
    }))
    .sort((a, b) => a.sk_number.localeCompare(b.sk_number));
}

// 计算描述性统计
export function calculateDescriptiveStats(skeletons: SkeletonItem[], platform?: string) {
  // 如果指定了平台，则过滤数据
  const filteredData = platform
    ? skeletons.filter(s => s.platform === platform)
    : skeletons;

  // 初始化结果对象
  const stats = {
    length: { min: Infinity, max: -Infinity, mean: 0 },
    perpendicularity: { min: Infinity, max: -Infinity, mean: 0 },
    flatness: { min: Infinity, max: -Infinity, mean: 0 }
  };

  // 如果没有数据，返回默认值
  if (filteredData.length === 0) {
    return {
      length: { min: 0, max: 0, mean: 0 },
      perpendicularity: { min: 0, max: 0, mean: 0 },
      flatness: { min: 0, max: 0, mean: 0 }
    };
  }

  // 计算统计值
  let lengthSum = 0;
  let perpendicularitySum = 0;
  let flatnessSum = 0;

  filteredData.forEach(skeleton => {
    // Length
    stats.length.min = Math.min(stats.length.min, skeleton.length);
    stats.length.max = Math.max(stats.length.max, skeleton.length);
    lengthSum += skeleton.length;

    // Perpendicularity
    stats.perpendicularity.min = Math.min(stats.perpendicularity.min, skeleton.perpendiculartity);
    stats.perpendicularity.max = Math.max(stats.perpendicularity.max, skeleton.perpendiculartity);
    perpendicularitySum += skeleton.perpendiculartity;

    // Flatness
    stats.flatness.min = Math.min(stats.flatness.min, skeleton.flatness);
    stats.flatness.max = Math.max(stats.flatness.max, skeleton.flatness);
    flatnessSum += skeleton.flatness;
  });

  const count = filteredData.length;
  stats.length.mean = lengthSum / count;
  stats.perpendicularity.mean = perpendicularitySum / count;
  stats.flatness.mean = flatnessSum / count;

  // 格式化数值，保留4位小数
  return {
    length: {
      min: Number(stats.length.min.toFixed(4)),
      max: Number(stats.length.max.toFixed(4)),
      mean: Number(stats.length.mean.toFixed(4))
    },
    perpendicularity: {
      min: Number(stats.perpendicularity.min.toFixed(4)),
      max: Number(stats.perpendicularity.max.toFixed(4)),
      mean: Number(stats.perpendicularity.mean.toFixed(4))
    },
    flatness: {
      min: Number(stats.flatness.min.toFixed(4)),
      max: Number(stats.flatness.max.toFixed(4)),
      mean: Number(stats.flatness.mean.toFixed(4))
    }
  };
}
