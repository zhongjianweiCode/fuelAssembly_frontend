import api from "@/lib/api";
import { CreateOrderDto, OrderItem, UpdateOrderDto } from "@/types/order";

export const OrderService = {
  // 获取所有订单
  getAllOrders: () => api.get<OrderItem[]>("/api/orders/"),

  // 获取单个订单
  getOrderById: (id: string) => api.get<OrderItem>(`/api/orders/${id}/`),

  // 创建订单
  createOrder: (payload: CreateOrderDto) => api.post("/api/orders/", payload),

  // 更新订单
  updateOrder: (id: string, payload: UpdateOrderDto) =>
    api.patch(`/api/orders/${id}/`, payload),

  // 删除订单
  deleteOrder: (id: string) => api.delete(`/api/orders/${id}/`),

  
};