"use client";

import { getDashboardData } from "@/lib/data";
import { Card } from "@/ui/dashboard/cards";
import { lusitana } from "@/ui/font";
import { RevenueChart } from "@/ui/dashboard/revenue-chart";
import LatestSkeletons from "@/ui/dashboard/latest-skeletons";
import { Suspense, useState, useEffect } from "react";
import { useAllSkeletons, useRefreshSkeletons } from "@/hooks/useSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import { Button, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SyncIcon from '@mui/icons-material/Sync';

// 数据展示组件 - 将数据获取和展示分离
function DashboardContent() {
  // 使用React Query钩子获取数据
  const { data: skeletons, isLoading: isDataLoading, error, refetch, isRefetching } = useAllSkeletons();
  // 获取刷新函数
  const refreshSkeletons = useRefreshSkeletons();
  // 本地加载状态
  const [refreshing, setRefreshing] = useState(false);
  // 旋转动画角度
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // 处理刷新按钮点击
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSkeletons();
      await refetch();
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // 实现图标旋转动画
  useEffect(() => {
    let animationFrame: number;
    
    if (refreshing || isRefetching) {
      const animate = () => {
        setRotationAngle(prev => (prev + 5) % 360);
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [refreshing, isRefetching]);
  
  // 处理错误状态
  if (error) {
    return (
      <ErrorMessage message={
        error instanceof Error 
          ? error.message 
          : "Failed to load dashboard data"
      } />
    );
  }
  
  // 使用获取的数据计算仪表板内容
  const dashboardData = getDashboardData(skeletons || []);
  
  // 获取最后更新时间
  const lastUpdated = new Date().toLocaleTimeString();
  
  const isLoading = refreshing || isRefetching || isDataLoading;
  
  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className={`${lusitana.className} text-2xl md:text-3xl font-bold text-gray-800`}>
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={
              isLoading ? (
                <SyncIcon 
                  style={{ 
                    transform: `rotate(${rotationAngle}deg)`,
                    transition: 'transform 0.1s linear'
                  }} 
                />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={handleRefresh}
            disabled={isLoading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: 'none',
              minWidth: '100px',
              position: 'relative',
              overflow: 'hidden',
              '&::after': isLoading ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: 'rgba(255, 255, 255, 0.5)',
                animation: 'loading 1.5s infinite linear',
              } : {},
              '@keyframes loading': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              },
              '&:hover': {
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              },
            }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <CircularProgress 
                  size={16} 
                  color="inherit" 
                  thickness={6} 
                  sx={{ 
                    position: 'absolute',
                    right: '10px',
                    opacity: 0.7
                  }} 
                />
              </span>
            )}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Annual Productions" value={dashboardData.yearlyCount} type="yearly" />
        <Card title="Current Month" value={dashboardData.currentMonthCount} type="monthly" />
        <Card title="Released" value={dashboardData.releasedCount} type="released" />
        <Card title="New Production" value={dashboardData.newCount} type="recent" />        
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 h-[600px]">
        <div className="h-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
            <RevenueChart monthlyCounts={dashboardData.monthlyCounts} />
          </Suspense>
        </div>
        <div className="h-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading recent items...</div>}>
            <LatestSkeletons latestSkeletons={dashboardData.recentSkeletons} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

// 加载状态组件 - 使用骨架UI
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-1/4 bg-gray-200 rounded"></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-32 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 h-[600px]">
        <div className="bg-gray-100 rounded-lg"></div>
        <div className="bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

// 主页面组件 - 添加Suspense边界
export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
