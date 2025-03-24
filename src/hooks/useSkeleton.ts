import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonService } from "@/services/skeletonService";
import {
  CreateSkeletonDto,
  SkeletonItem,
  UpdateSkeletonDto,
} from "@/types/skeleton";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// 缓存时间配置 - v5 使用 gcTime 而不是 cacheTime
const STALE_TIME = 1000 * 60 * 5; // 5分钟
const GC_TIME = 1000 * 60 * 30; // 30分钟 - 垃圾回收时间

// 通用查询键生成器
export const queryKeys = {
  all: ["skeletons"] as const,
  detail: (id: string) => [...queryKeys.all, id] as const,
  filtered: (filter: Record<string, unknown>) => [...queryKeys.all, { filter }] as const, // 对象包装为了更好的序列化
};

// 错误处理辅助函数
const formatErrorForLogging = (error: unknown): Record<string, unknown> => {
  try {
    if (axios.isAxiosError(error)) {
      // Axios 错误处理
      const axiosError = error as AxiosError;
      return {
        type: 'AxiosError',
        message: axiosError.message || 'Unknown axios error',
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        url: axiosError.config?.url || 'Unknown URL',
        method: axiosError.config?.method || 'Unknown method',
        responseData: axiosError.response?.data || 'No response data',
        timestamp: new Date().toISOString()
      };
    } else if (error instanceof Error) {
      // 标准 Error 对象
      return {
        type: 'Error',
        name: error.name || 'Error',
        message: error.message || 'No message',
        stack: error.stack?.substring(0, 500) || 'No stack trace',
        timestamp: new Date().toISOString()
      };
    } else {
      // 未知类型错误处理
      let valueStr = 'Unknown value';
      
      try {
        if (error === null) {
          valueStr = 'null';
        } else if (error === undefined) {
          valueStr = 'undefined';
        } else if (typeof error === 'object') {
          // 安全提取对象属性
          const safeProps: Record<string, unknown> = {};
          for (const key in error) {
            try {
              const value = (error as Record<string, unknown>)[key];
              if (typeof value === 'object' && value !== null) {
                safeProps[key] = '[Complex Object]';
              } else {
                safeProps[key] = value;
              }
            } catch {
              safeProps[key] = '[Error accessing property]';
            }
          }
          valueStr = JSON.stringify(safeProps);
        } else {
          valueStr = String(error);
        }
      } catch {
        valueStr = '[Failed to stringify object]';
      }
      
      return {
        type: 'Unknown',
        valueType: typeof error,
        value: valueStr,
        timestamp: new Date().toISOString()
      };
    }
  } catch (formatError) {
    // 序列化失败时的后备选项
    return {
      type: 'SerializationFailed',
      errorType: typeof error,
      formatError: String(formatError),
      timestamp: new Date().toISOString()
    };
  }
};

// 处理错误并显示通知
const handleQueryError = (error: unknown, context?: string): Error => {
  try {
    const errorInfo = formatErrorForLogging(error);
    const contextPrefix = context ? `[${context}] ` : '';
    
    // 安全地记录错误
    console.error(`${contextPrefix}Query error:`, 
      typeof errorInfo === 'object' ? 
        JSON.stringify(errorInfo, (key, value) => 
          value === undefined ? '[undefined]' : value, 2) : 
        String(errorInfo)
    );
    
    let userMessage = 'An unexpected error occurred';
    
    // 根据错误类型定制错误消息
    if (axios.isAxiosError(error)) {
      // 网络错误
      if (error.message.includes('Network Error')) {
        userMessage = 'Network connection issue - please check your internet connection';
        
        toast.error('Network error', {
          description: 'Unable to connect to the server. Please check your connection.'
        });
      } 
      // 认证错误
      else if (error.response?.status === 401) {
        userMessage = 'Authentication failed - please log in again';
        
        toast.error('Authentication error', {
          description: 'Your session may have expired. Please try logging in again.'
        });
      } 
      // 服务器错误
      else if (error.response?.status && error.response.status >= 500) {
        userMessage = 'Server error - our team has been notified';
        
        toast.error('Server error', {
          description: 'Something went wrong on our servers. Please try again later.'
        });
      } 
      // API错误
      else {
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown API error';
        userMessage = `API error: ${errorMessage}`;
        
        toast.error('API Error', {
          description: errorMessage
        });
      }
    } else if (error instanceof Error) {
      userMessage = error.message || 'Unknown error';
      
      toast.error('Error', {
        description: error.message || 'An error occurred'
      });
    } else {
      // 处理未知错误类型
      const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
      
      toast.error('Unexpected error', {
        description: errorMessage
      });
    }
    
    // 确保总是返回Error对象
    if (error instanceof Error) {
      return error;
    }
    
    return new Error(userMessage);
  } catch (handlerError) {
    // 如果错误处理本身出错，提供一个后备错误
    console.error('Error in error handler:', handlerError);
    toast.error('Error processing failed', {
      description: 'There was a problem handling an error'
    });
    return new Error('Error processing failed');
  }
};

// 提取骨架获取查询函数，以便在其他地方复用
export const fetchAllSkeletons = async (): Promise<SkeletonItem[]> => {
  try {
    console.log('Fetching all skeletons...');
    const response = await SkeletonService.getAllSkelton();
    
    if (!response.data) {
      console.error('No data in response');
      throw new Error('No data received from the server');
    }
    
    if (!Array.isArray(response.data)) {
      console.error('Response data is not an array');
      throw new Error('Invalid response format');
    }
    
    console.log(`Successfully fetched ${response.data.length} skeletons`);
    return response.data;
  } catch (error) {
    throw handleQueryError(error, 'fetchAllSkeletons');
  }
};

// 获取单个骨架数据查询函数
const fetchSkeletonById = async (id: string): Promise<SkeletonItem> => {
  try {
    const res = await SkeletonService.getSkeletonById(id);
    return res.data;
  } catch (error) {
    throw handleQueryError(error, `fetchSkeletonById(${id})`);
  }
};

// 获取所有骨架（不带分页）
export const useAllSkeletons = (options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.all,
    queryFn: fetchAllSkeletons,
    // React Query v5 配置
    retry: 1,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 3, // 每3分钟轮询一次
    ...options
  });
};

// 提供一个手动刷新骨架数据的函数
export const useRefreshSkeletons = () => {
  const queryClient = useQueryClient();
  
  return async () => {
    toast.info("Refreshing data...");
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.all });
      console.log("Cache invalidated, data will be refetched");
      return true;
    } catch (error) {
      console.error("Error invalidating queries:", error);
      return false;
    }
  };
};

// 获取单个骨架数据
export const useSkeleton = (id: string, options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => fetchSkeletonById(id),
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    ...options
  });
};

interface UpdateSkeletonParams {
  id: string;
  payload: UpdateSkeletonDto;
}

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// 创建骨架
export const useCreateSkeleton = (options?: MutationOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateSkeletonDto) => {
      try {
        const response = await SkeletonService.createSkeleton(payload);
        return response.data;
      } catch (error) {
        throw handleQueryError(error, 'createSkeleton');
      }
    },
    onMutate: async (newSkeleton) => {
      // 取消所有进行中的查询以避免冲突
      await queryClient.cancelQueries({ queryKey: queryKeys.all });
      
      // 获取当前骨架列表
      const previousSkeletons = queryClient.getQueryData<SkeletonItem[]>(queryKeys.all);
      
      // 创建一个临时ID进行乐观更新
      const tempId = `temp-${Date.now()}`;
      
      // 创建一个乐观更新的骨架对象
      const optimisticSkeleton: SkeletonItem = {
        id: tempId,
        ...newSkeleton,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // 其他必要字段设置
        order: newSkeleton.order_id 
          ? { 
              id: newSkeleton.order_id, 
              order_name: "Loading...", 
              order_batch: "...",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } 
          : null
      } as SkeletonItem;
      
      // 乐观地添加新骨架到列表
      queryClient.setQueryData<SkeletonItem[]>(
        queryKeys.all,
        old => old ? [optimisticSkeleton, ...old] : [optimisticSkeleton]
      );
      
      // 返回之前的骨架列表，以便在出现错误时可以回滚
      return { previousSkeletons };
    },
    onError: (err, newSkeleton, context) => {
      // 如果出错，恢复为之前的数据
      if (context?.previousSkeletons) {
        queryClient.setQueryData(queryKeys.all, context.previousSkeletons);
      }
      
      // 移除所有相关加载状态
      toast.dismiss();
      
      // 显示错误消息
      toast.error("Failed to create skeleton", {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
      
      // 调用可选的错误回调
      options?.onError?.(err);
    },
    onSuccess: (data) => {
      // 移除所有相关加载状态
      toast.dismiss();
      
      // 更新缓存中特定的骨架详情
      queryClient.setQueryData(queryKeys.detail(data.id), data);
      
      // 更新骨架列表，替换掉临时乐观更新的骨架
      queryClient.setQueryData<SkeletonItem[]>(queryKeys.all, (oldData) => {
        if (!oldData) return [data];
        return oldData
          .filter(item => !item.id.toString().startsWith('temp-'))
          .concat([data])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      });
      
      // 显示成功通知
      toast.success("Skeleton created successfully", {
        description: "The new skeleton has been added to the list."
      });
      
      // 调用可选的成功回调
      options?.onSuccess?.();
    },
    onSettled: () => {
      // 由于我们已经使用了乐观更新，不需要自动重新获取数据
      // 仅在需要时手动调用invalidateQueries
      // queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};

// 更新骨架（含乐观更新）
export const useUpdateSkeleton = (options?: MutationOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: UpdateSkeletonParams) => {
      try {
        const response = await SkeletonService.updateSkeleton(id, payload);
        return response.data;
      } catch (error) {
        throw handleQueryError(error, `updateSkeleton(${id})`);
      }
    },
    onMutate: async ({ id, payload }) => {
      // 取消所有进行中的查询以避免冲突
      await queryClient.cancelQueries({ queryKey: queryKeys.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
      
      // 获取当前的骨架列表和详细信息
      const previousList = queryClient.getQueryData<SkeletonItem[]>(queryKeys.all);
      const previousDetails = queryClient.getQueryData<SkeletonItem>(queryKeys.detail(id));
      
      // 找到当前骨架
      let currentSkeleton: SkeletonItem | undefined;
      if (previousList) {
        currentSkeleton = previousList.find(item => item.id === id);
      } else {
        currentSkeleton = previousDetails;
      }
      
      if (!currentSkeleton) {
        return { previousList, previousDetails };
      }
      
      // 创建乐观更新的骨架对象
      const optimisticSkeleton: SkeletonItem = {
        ...currentSkeleton,
        ...payload,
        // 确保保留原始的order信息
        order: currentSkeleton.order
      };
      
      // 乐观更新缓存中的骨架列表
      if (previousList) {
        queryClient.setQueryData<SkeletonItem[]>(
          queryKeys.all,
          old => old?.map(item => item.id === id ? optimisticSkeleton : item) || []
        );
      }
      
      // 乐观更新骨架详情
      queryClient.setQueryData(queryKeys.detail(id), optimisticSkeleton);
      
      return { previousList, previousDetails };
    },
    onError: (err, variables, context) => {
      // 如果出错，恢复为之前的数据
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.all, context.previousList);
      }
      
      if (context?.previousDetails) {
        queryClient.setQueryData(queryKeys.detail(variables.id), context.previousDetails);
      }
      
      // 移除所有相关加载状态
      toast.dismiss();
      
      // 显示错误消息
      toast.error("Failed to update skeleton", {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      
      // 调用可选的错误回调
      options?.onError?.(err);
    },
    onSuccess: (data) => {
      // 移除所有相关加载状态
      toast.dismiss();
      
      // 更新缓存中的特定骨架
      queryClient.setQueryData(queryKeys.detail(data.id), data);
      
      // 更新缓存中的骨架列表
      queryClient.setQueryData<SkeletonItem[]>(queryKeys.all, (oldData) => {
        if (!oldData) return [data];
        return oldData.map(item => item.id === data.id ? data : item);
      });
      
      // 显示成功通知
      toast.success("Skeleton updated successfully", {
        description: "Changes have been saved successfully."
      });
      
      // 调用可选的成功回调
      options?.onSuccess?.();
    },
    onSettled: () => {
      // 由于我们已经使用了乐观更新，不需要自动重新获取数据
      // 仅在需要时手动调用invalidateQueries
      // queryClient.invalidateQueries({ queryKey: queryKeys.all });
      // queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
    },
  });
};

// 删除骨架（含乐观更新）
export const useDeleteSkeleton = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await SkeletonService.deleteSkeleton(id);
      } catch (error) {
        throw handleQueryError(error, `deleteSkeleton(${id})`);
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.all });

      const previousList = queryClient.getQueryData<SkeletonItem[]>(
        queryKeys.all
      );

      // 乐观移除数据
      if (previousList) {
        queryClient.setQueryData<SkeletonItem[]>(
          queryKeys.all,
          (old) => old?.filter((item) => item.id !== id) || []
        );
      }

      return { previousList };
    },
    onError: (err, id, context) => {
      // 还原乐观更新
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.all, context.previousList);
      }
      
      toast.error("Failed to delete skeleton", {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    },
    onSuccess: () => {
      toast.success("Skeleton deleted successfully");
    },
    onSettled: () => {
      // 由于我们已经使用了乐观更新，不需要自动重新获取数据
      // 仅在需要时手动调用invalidateQueries
      // queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};

interface ImportResponse {
  success_count: number;
  error_count: number;
  errors: string[];
}

// 导入Excel文件
export const useImportExcel = (options?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportResponse> => {
      try {
        const res = await SkeletonService.importExcel(file);
        return res.data;
      } catch (error) {
        throw handleQueryError(error, 'importExcel');
      }
    },
    onSuccess: (data) => {
      // 导入成功后刷新骨架数据
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      // 显示成功通知，包含导入统计信息
      toast.success(`Import completed`, {
        description: `Successfully imported ${data.success_count} items. ${data.error_count > 0 ? `${data.error_count} errors encountered.` : ''}`
      });
      
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
