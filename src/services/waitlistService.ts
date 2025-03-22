import api from "@/lib/api";
import {
  WaitlistItem,
  CreateWaitlistDto,
  UpdateWaitlistDto,
  PaginationParams,
  PaginatedResponse,
} from "@/types/waitlist";

export const WaitlistService = {
  // 获取列表（带分页）
  getList: (params?: PaginationParams) =>
    api.get<PaginatedResponse<WaitlistItem>>("/api/waitlists/", { params }),

  // 获取列表（不带分页）
  getListAll: () => api.get<WaitlistItem[]>("/api/waitlists/"),

  // 获取单条数据
  getById: (id: string) => api.get<WaitlistItem>(`/api/waitlists/${id}/`),

  // 创建条目
  create: (payload: CreateWaitlistDto) =>
    api.post<WaitlistItem>("/api/waitlists/", payload),

  // 更新条目
  update: (id: string, payload: UpdateWaitlistDto) =>
    api.patch<WaitlistItem>(`/api/waitlists/${id}/`, payload),

  // 删除条目
  delete: (id: string) => api.delete(`/api/waitlists/${id}/`),
};
