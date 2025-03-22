import { OrderService } from "@/services/orderService";
import { CreateOrderDto, OrderItem, UpdateOrderDto } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 通用查询键生成器
const queryKeys = {
  all: ["orders"] as const,
  detail: (id: string) => [...queryKeys.all, id] as const,
  search: (query: string) => [...queryKeys.all, "search", query] as const,
};

// 获取所有订单
export const useAllOrders = () => {
  return useQuery<OrderItem[], Error>({
    queryKey: queryKeys.all,
    queryFn: () => OrderService.getAllOrders().then((res) => res.data),
  });
};

// 搜索订单
export const useSearchOrders = (query: string) => {
  return useQuery<OrderItem[], Error>({
    queryKey: queryKeys.search(query),
    queryFn: () => OrderService.getAllOrders().then((res) => {
      // 在前端进行过滤，如果后端有搜索API，应该使用后端搜索
      const searchTerm = query.toLowerCase();
      return res.data.filter(
        (order) =>
          order.order_name.toLowerCase().includes(searchTerm) ||
          order.order_batch.toLowerCase().includes(searchTerm)
      );
    }),
    enabled: query.length > 0, // 只在有搜索词时执行查询
  });
};

// 获取单条数据
export const useOrder = (id: string) => {
  return useQuery<OrderItem, Error>({
    queryKey: queryKeys.detail(id),
    queryFn: () => OrderService.getOrderById(id).then((res) => res.data),
    enabled: !!id,
  });
};

// 创建订单
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<OrderItem, Error, CreateOrderDto>({
    mutationFn: (payload) => OrderService.createOrder(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};

// 更新订单，含乐观更新
export const useUpdateOrder = () => {
    const queryClient = useQueryClient();
  
    return useMutation<
      OrderItem,
      Error,
      { id: string; payload: UpdateOrderDto },
      { previousItem?: OrderItem }
    >({
      mutationFn: ({ id, payload }) =>
        OrderService.updateOrder(id, payload).then((res) => res.data),
  
      // 乐观更新逻辑
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: queryKeys.detail(variables.id),
        });
  
        const previousItem = queryClient.getQueryData<OrderItem>(
          queryKeys.detail(variables.id)
        );
  
        // 乐观更新数据
        if (previousItem) {
          queryClient.setQueryData<OrderItem>(
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


  // 删除订单（含乐观更新）
  export const useDeleteOrder = () => {
    const queryClient = useQueryClient();
  
    return useMutation<void, Error, string, { previousList?: OrderItem[] }>({
      mutationFn: async (id) => {
        await OrderService.deleteOrder(id);
        return;
      },
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.all });
  
        const previousList = queryClient.getQueryData<OrderItem[]>(
          queryKeys.all
        );
  
        // 乐观移除数据
        if (previousList) {
          queryClient.setQueryData<OrderItem[]>(
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
  
