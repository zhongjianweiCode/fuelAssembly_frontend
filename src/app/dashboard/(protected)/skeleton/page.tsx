"use client";

import ErrorMessage from "@/components/ErrorMessage";;
import { SkeletonFormMUI } from "@/components/SkeletonFormMUI";
import { useAllOrders } from "@/hooks/useOrder";
import { Suspense, useState } from "react";
import { Button, CircularProgress, Skeleton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

// 表格加载骨架屏组件
function SkeletonTableSkeleton() {
  return (
    <div className="bg-white w-full rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden p-4 sm:p-6">
      {/* 表头骨架 */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton variant="text" width={200} height={40} />
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={120} height={36} />
        </div>
      </div>

      {/* 搜索栏骨架 */}
      <div className="mb-6">
        <Skeleton variant="rounded" width={300} height={40} />
      </div>

      {/* 表格行骨架 */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex gap-2 py-3 border-b border-gray-100">
          {Array.from({ length: 5 }).map((_, cellIndex) => (
            <Skeleton 
              key={cellIndex} 
              variant="text" 
              width={`${Math.floor(Math.random() * 20) + 10}%`} 
              height={24} 
            />
          ))}
        </div>
      ))}

      {/* 分页骨架 */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="text" width={100} height={32} />
        <div className="flex gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      </div>
    </div>
  );
}

// 骨架页面骨架屏
function SkeletonPageSkeleton() {
  return (
    <div className="p-2 sm:p-4 w-full space-y-4 sm:space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width={250} height={48} />
        <Skeleton variant="rounded" width={100} height={36} />
      </div>
      <SkeletonTableSkeleton />
    </div>
  );
}

// 内容组件，用于包装在 Suspense 中
function SkeletonContent() {
  const {
    data: orderData,
    isLoading,
    isError,
    error,
    refetch
  } = useAllOrders();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Error refreshing orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <SkeletonPageSkeleton />;
  }

  if (isError) {
    return <ErrorMessage message={error?.message || "Failed to load data"} />;
  }
  
  return (
    <div className="p-2 sm:p-4 w-full space-y-4 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-3xl font-bold text-blue-600">
          Skeletons Management
        </h1>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={isRefreshing ? 
            <CircularProgress size={16} color="inherit" /> : 
            <RefreshIcon />
          }
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            },
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <Suspense fallback={<SkeletonTableSkeleton />}>
        <div className="bg-white w-full rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
          <SkeletonFormMUI orders={orderData || []} />
        </div>
      </Suspense>
    </div>
  );
}

// 主页面组件
export default function Page() {
  return (
    <Suspense fallback={<SkeletonPageSkeleton />}>
      <SkeletonContent />
    </Suspense>
  );
}
