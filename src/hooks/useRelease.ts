import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReleaseService } from "@/services/releaseService";
import {
  CreateReleaseRequest,
  UpdateReleaseRequest,
  ReleaseResponse,
  ReleaseDetailResponse,
  AddMembershipRequest,
  BatchAddMembershipRequest,
  DeleteReleaseRequest,
} from "@/types/release";

// 通用查询键生成器
const queryKeys = {
  all: ["releases"] as const,
  detail: (id: string) => [...queryKeys.all, id] as const,
  search: (query: string) => [...queryKeys.all, "search", query] as const,
};

// 获取所有放行单
export const useAllReleases = () => {
  return useQuery<ReleaseDetailResponse[], Error>({
    queryKey: queryKeys.all,
    queryFn: () => ReleaseService.getAllReleases().then((res) => res.data),
    refetchInterval: 1000,  // 每秒自动重新获取
    refetchOnWindowFocus: true,  // 窗口聚焦时重新获取
    refetchOnMount: true,  // 组件挂载时重新获取
    staleTime: 0,  // 数据立即变为 stale，这样可以立即重新获取
  });
};

// 搜索放行单
export const useSearchReleases = (query: string) => {
  return useQuery<ReleaseResponse[], Error>({
    queryKey: queryKeys.search(query),
    queryFn: () => ReleaseService.getAllReleases().then((res) => {
      const searchTerm = query.toLowerCase();
      return res.data.filter((release) =>
        release.release_number.toLowerCase().includes(searchTerm)
      );
    }),
    enabled: query.length > 0,
  });
};

// 获取单个放行单详情
export const useSingleRelease = (id: string) => {
  return useQuery<ReleaseDetailResponse, Error>({
    queryKey: queryKeys.detail(id),
    queryFn: () => ReleaseService.getReleaseById(id).then((res) => res.data),
    enabled: !!id,
  });
};

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// 创建放行单
export const useCreateRelease = (options?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<ReleaseResponse, Error, CreateReleaseRequest>({
    mutationFn: (payload) =>
      ReleaseService.createRelease(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

// 更新放行单（含乐观更新）
export const useUpdateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ReleaseResponse,
    Error,
    { id: string; payload: UpdateReleaseRequest },
    { previousItem?: ReleaseDetailResponse }
  >({
    mutationFn: ({ id, payload }) =>
      ReleaseService.updateRelease(id, payload).then((res) => res.data),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.detail(variables.id),
      });

      const previousItem = queryClient.getQueryData<ReleaseDetailResponse>(
        queryKeys.detail(variables.id)
      );

      if (previousItem && variables.payload.release_number) {
        queryClient.setQueryData<ReleaseDetailResponse>(
          queryKeys.detail(variables.id),
          {
            ...previousItem,
            release_number: variables.payload.release_number,
          }
        );
      }

      return { previousItem };
    },

    onError: (err, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(
          queryKeys.detail(variables.id),
          context.previousItem
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};

// 删除放行单（含乐观更新）
export const useDeleteRelease = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; payload: DeleteReleaseRequest }, { previousList?: ReleaseResponse[] }>({
    mutationFn: async ({ id, payload }) => {
      await ReleaseService.deleteRelease(id, payload);
      return;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.all });

      const previousList = queryClient.getQueryData<ReleaseResponse[]>(
        queryKeys.all
      );

      if (previousList) {
        queryClient.setQueryData<ReleaseResponse[]>(
          queryKeys.all,
          previousList.filter((item) => item.id !== id)
        );
      }

      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.all, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};

// 添加单个骨架到放行单
export const useAddSkeletonToRelease = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ReleaseDetailResponse,
    Error,
    { releaseId: string; payload: AddMembershipRequest }
  >({
    mutationFn: ({ releaseId, payload }) =>
      ReleaseService.addSkeletonToRelease(releaseId, payload).then((res) => res.data),
    onSuccess: (data, { releaseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(releaseId) });
    },
  });
};

// 批量添加骨架到放行单
export const useBatchAddSkeletonsToRelease = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ReleaseDetailResponse,
    Error,
    { releaseId: string; payload: BatchAddMembershipRequest }
  >({
    mutationFn: ({ releaseId, payload }) =>
      ReleaseService.batchAddSkeletonsToRelease(releaseId, payload).then((res) => res.data),
    onSuccess: (data, { releaseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(releaseId) });
    },
  });
};

// 从放行单中移除骨架
export const useRemoveSkeletonFromRelease = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { releaseId: string; skeletonNumber: string },
    { previousItem?: ReleaseDetailResponse }
  >({
    mutationFn: async ({ releaseId, skeletonNumber }) => {
      await ReleaseService.removeSkeletonFromRelease(releaseId, skeletonNumber);
      return;
    },

    onMutate: async ({ releaseId, skeletonNumber }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.detail(releaseId),
      });

      const previousItem = queryClient.getQueryData<ReleaseDetailResponse>(
        queryKeys.detail(releaseId)
      );

      if (previousItem) {
        const updatedItem = {
          ...previousItem,
          memberships: previousItem.memberships.filter(
            (m) => m.skeleton !== skeletonNumber
          ),
        };
        queryClient.setQueryData(queryKeys.detail(releaseId), updatedItem);
      }

      return { previousItem };
    },

    onError: (err, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(
          queryKeys.detail(variables.releaseId),
          context.previousItem
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.releaseId),
      });
    },
  });
}; 