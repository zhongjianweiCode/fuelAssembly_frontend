// types/waitlist.ts

// 基础等待列表项类型
export interface WaitlistItem {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  }
  
  // 创建DTO（Data Transfer Object）
  export interface CreateWaitlistDto {
    email: string;
  }
  
  // 更新DTO
  export interface UpdateWaitlistDto {
    email?: string;
  }
  
  // 分页参数
  export interface PaginationParams {
    page?: number;
    page_size?: number;
  }
  
  // 分页响应结构
  export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }