'use client';

import SideNav from "@/ui/sidenav";
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys, fetchAllSkeletons } from '@/hooks/useSkeleton';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // 在布局组件挂载时预获取骨架数据
  useEffect(() => {
    // 使用预获取函数来加载和缓存数据
    const prefetchData = async () => {
      try {
        // 使用与useAllSkeletons相同的查询键和查询函数
        await queryClient.prefetchQuery({
          queryKey: queryKeys.all,
          queryFn: fetchAllSkeletons,
        });
      } catch (error) {
        console.error('Query prefetch failed:', error);
        toast.error('Failed to load initial data', {
          description: 'Some dashboard data may not be available.',
        });
      }
    };
    
    prefetchData();
  }, [queryClient]);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
