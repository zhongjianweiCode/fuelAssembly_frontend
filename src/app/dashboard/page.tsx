"use client";

import { fetchSkeletons, getDashboardData } from "@/lib/data";
import { Card } from "@/ui/dashboard/cards";
import { lusitana } from "@/ui/font";
import { RevenueChart } from "@/ui/dashboard/revenue-chart";
import LatestSkeletons from "@/ui/dashboard/latest-skeletons";
import { useState, useEffect } from "react";
import { SkeletonItem } from "@/types/skeleton";

export default function Page() {
  const [dashboardData, setDashboardData] = useState({
    yearlyCount: 0,
    monthlyCounts: new Array(12).fill(0),
    releasedCount: 0,
    newCount: 0,
    currentMonthCount: 0,
    totalCount: 0,
    statusDistribution: {},
    platformDistribution: {},
    recentSkeletons: [] as SkeletonItem[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const skeletonsData = await fetchSkeletons();
        if (skeletonsData) {
          const data = getDashboardData(skeletonsData);
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch skeletons:", error);
      }
    }
    loadData();
  }, []);
  
  return (
    <main className="space-y-6">
      <h1 className={`${lusitana.className} text-2xl md:text-3xl font-bold text-gray-800`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Annual Productions" value={dashboardData.yearlyCount} type="yearly" />
        <Card title="Current Month" value={dashboardData.currentMonthCount} type="monthly" />
        <Card title="Released" value={dashboardData.releasedCount} type="released" />
        <Card title="New Production" value={dashboardData.newCount} type="recent" />        
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 h-[600px]">
        <div className="h-full">
          <RevenueChart monthlyCounts={dashboardData.monthlyCounts} />
        </div>
        <div className="h-full">
          <LatestSkeletons latestSkeletons={dashboardData.recentSkeletons} />
        </div>
      </div>
    </main>
  );
}
