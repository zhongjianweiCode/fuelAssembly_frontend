export interface OrderItem {
  id: string;
  order_name: string;
  order_batch: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderDto {
  order_name: string;
  order_batch: string;
}

export interface UpdateOrderDto {
  order_name: string;
  order_batch: string;
}

export interface DeleteOrderDto {
  id: string;
}


