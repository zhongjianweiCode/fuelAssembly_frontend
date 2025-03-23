import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SkeletonService } from "@/services/skeletonService";
import {
  CreateSkeletonDto,
  SkeletonItem,
  UpdateSkeletonDto,
} from "@/types/skeleton";
import axios from "axios";

// 通用查询键生成器
const queryKeys = {
  all: ["skeletons"] as const,
  detail: (id: string) => [...queryKeys.all, id] as const,
};

// 获取所有骨架（不带分页）
export const useAllSkeletons = () => {
  return useQuery<SkeletonItem[], Error>({
    queryKey: queryKeys.all,
    queryFn: async () => {
      console.log('Starting to fetch skeletons...');
      try {
        // console.log('Making API request to /api/skeleton/');
        const response = await SkeletonService.getAllSkelton();
        // console.log('Full API response:', response);
        // console.log('Response status:', response.status);
        // console.log('Response headers:', response.headers);
        // console.log('Response data:', response.data);
        
        if (!response.data) {
          console.error('No data in response');
          throw new Error('No data received from the server');
        }
        
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} skeletons`);
        } else {
          console.error('Response data is not an array:', response.data);
          throw new Error('Invalid response format');
        }
        
        return response.data;
      } catch (error) {
        console.error('Error in useAllSkeletons:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: error.config,
            message: error.message
          });
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// 获取单个骨架数据
export const useSkeleton = (id: string) => {
  return useQuery<SkeletonItem, Error>({
    queryKey: queryKeys.detail(id),
    queryFn: () => SkeletonService.getSkeletonById(id).then((res) => res.data),
    enabled: !!id,
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
    mutationFn: (payload: CreateSkeletonDto) => SkeletonService.createSkeleton(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    }
  });
};

// 更新骨架（含乐观更新）
export const useUpdateSkeleton = (options?: MutationOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: UpdateSkeletonParams) => SkeletonService.updateSkeleton(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    }
  });
};

// 删除骨架（含乐观更新）
export const useDeleteSkeleton = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousList?: SkeletonItem[] }>({
    mutationFn: async (id) => {
      await SkeletonService.deleteSkeleton(id);
      return;
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
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.all, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
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

  return useMutation<ImportResponse, Error, File, void>({
    mutationFn: (file) => SkeletonService.importExcel(file).then((res) => res.data),
    onSuccess: () => {
      // 导入成功后刷新骨架数据
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
