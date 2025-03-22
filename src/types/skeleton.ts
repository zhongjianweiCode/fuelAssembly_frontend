import { OrderItem } from "./order";

export interface SkeletonItem {
  id: string;
  sk_number: string;
  perpendiculartity: number;
  flatness: number;
  length: number;
  leg1_length: number;
  leg2_length: number;
  leg3_length: number;
  leg4_length: number;
  x: number | null;
  y: number | null;
  created_at: string;
  updated_at?: string;
  platform: string;
  type: string;
  status: string;
  order: OrderItem | null;
}

export interface CreateSkeletonDto {
  sk_number: string;
  perpendiculartity: number;
  flatness: number;
  length: number;
  platform: string;
  leg1_length: number;
  leg2_length: number;
  leg3_length: number;
  leg4_length: number;
  type: string;
  status: string;
  order_id: string | null;
  x: number | null;
  y: number | null;
  created_at: string;
}

export interface UpdateSkeletonDto {
  sk_number: string;
  perpendiculartity: number;
  flatness: number;
  length: number;
  platform: string;
  leg1_length: number;
  leg2_length: number;
  leg3_length: number;
  leg4_length: number;
  type: string;
  status: string;
  order_id: string | null;
  created_at: string;
}

export interface DeleteSkeletonDto {
  id: string;
}
