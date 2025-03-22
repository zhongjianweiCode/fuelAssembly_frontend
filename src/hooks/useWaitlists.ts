// hooks/useWaitlists.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { WaitlistService } from "@/services/waitlistService";
import type {
  WaitlistItem,
  CreateWaitlistDto,
  UpdateWaitlistDto,
  PaginationParams,
  PaginatedResponse,
} from "@/types/waitlist";

// 通用查询键生成器
const queryKeys = {
  all: ["waitlists"],
  list: (params?: PaginationParams) => [...queryKeys.all, params],
  detail: (id: string) => [...queryKeys.all, id],
};

// 获取列表（带分页）
export const useWaitlists = (params?: PaginationParams) => {
  return useQuery<PaginatedResponse<WaitlistItem>, Error>({
    queryKey: queryKeys.list(params),
    queryFn: () => WaitlistService.getList(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

// 获取所有列表（不带分页）
export const useAllWaitlists = () => {
  return useQuery<WaitlistItem[], Error>({
    queryKey: queryKeys.all,
    queryFn: () => WaitlistService.getListAll().then((res) => res.data),
  });
};

// 获取单条数据
export const useWaitlist = (id: string) => {
  return useQuery<WaitlistItem, Error>({
    queryKey: queryKeys.detail(id),
    queryFn: () => WaitlistService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

// 创建条目
export const useCreateWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation<WaitlistItem, Error, CreateWaitlistDto>({
    mutationFn: (payload) =>
      WaitlistService.create(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};

// 更新条目（含乐观更新）
export const useUpdateWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WaitlistItem,
    Error,
    { id: string; payload: UpdateWaitlistDto },
    { previousItem?: WaitlistItem }
  >({
    mutationFn: ({ id, payload }) =>
      WaitlistService.update(id, payload).then((res) => res.data),

    // 乐观更新逻辑
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.detail(variables.id),
      });

      const previousItem = queryClient.getQueryData<WaitlistItem>(
        queryKeys.detail(variables.id)
      );

      // 乐观更新数据
      if (previousItem) {
        queryClient.setQueryData<WaitlistItem>(
          queryKeys.detail(variables.id),
          (old) => ({
            ...old!,
            ...variables.payload,
          })
        );
      }

      return { previousItem };
    },

    // 错误回滚
    onError: (err, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(
          queryKeys.detail(variables.id),
          context.previousItem
        );
      }
    },

    // 最终确认
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};

// 删除条目（含乐观更新）
export const useDeleteWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousList?: WaitlistItem[] }>({
    mutationFn: async (id) => {
      await WaitlistService.delete(id);
      return;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.all });

      const previousList = queryClient.getQueryData<WaitlistItem[]>(
        queryKeys.all
      );

      // 乐观移除数据
      if (previousList) {
        queryClient.setQueryData<WaitlistItem[]>(
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
