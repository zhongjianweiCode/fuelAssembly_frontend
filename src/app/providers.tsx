// app/providers.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from '@/components/ui/toast';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof Error) {
              toast.error(`query error: ${error.message}`);
            }
          }
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // 网络错误时重试 3 次
              if (error instanceof Error && error.message.includes('Network')) {
                return failureCount < 3;
              }
              return false;
            },
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 分钟缓存
          },
          mutations: {
            onError: (error) => {
              if (error instanceof Error) {
                toast.error(`fetch failed: ${error.message}`);
              }
            }
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}