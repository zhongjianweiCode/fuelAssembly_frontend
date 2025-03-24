import api from "@/lib/api";
import {
  CreateSkeletonDto,
  SkeletonItem,
  UpdateSkeletonDto,
} from "@/types/skeleton";
import axios from "axios";

// 辅助函数：提取错误信息，确保它可以正确序列化
const extractErrorInfo = (error: unknown) => {
  try {
    if (axios.isAxiosError(error)) {
      // Axios错误处理
      return {
        type: 'AxiosError',
        message: error.message || 'Unknown axios error',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data || {},
        url: error.config?.url || 'unknown',
        method: error.config?.method || 'unknown'
      };
    } else if (error instanceof Error) {
      // 标准Error对象
      return {
        type: 'Error',
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // 简化堆栈信息
      };
    } else {
      // 其他类型错误
      const errorType = typeof error;
      let errorValue: string;
      
      try {
        // 尝试将错误对象转换为字符串
        if (error === null) {
          errorValue = 'null';
        } else if (error === undefined) {
          errorValue = 'undefined';
        } else if (typeof error === 'object') {
          // 安全地提取对象属性
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
          errorValue = JSON.stringify(safeProps);
        } else {
          errorValue = String(error);
        }
      } catch {
        errorValue = '[Object conversion failed]';
      }
      
      return {
        type: 'Unknown',
        errorType,
        value: errorValue
      };
    }
  } catch (formatError) {
    // 如果序列化过程失败，返回基本信息
    return {
      type: 'SerializationFailed',
      errorType: typeof error,
      formatError: String(formatError)
    };
  }
};

export const SkeletonService = {
  // 获取所有骨架
  getAllSkelton: async () => {
    console.log('Fetching all skeletons...');
    try {
      const response = await api.get<SkeletonItem[]>("/api/skeleton/");
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      
      // 安全输出错误信息
      console.error('Error fetching skeletons:', 
        typeof errorInfo === 'object' ? 
          JSON.stringify(errorInfo, (key, value) => 
            value === undefined ? '[undefined]' : value, 2) : 
          String(errorInfo)
      );
      
      // 重新抛出错误，但附加可读信息
      if (axios.isAxiosError(error)) {
        // 创建新的Error对象，包含更多信息
        const enhancedError = new Error(`API Error: ${errorInfo.status || 'unknown'} - ${errorInfo.message || 'No message'}`);
        // @ts-expect-error - 添加额外属性
        enhancedError.details = errorInfo;
        throw enhancedError;
      }
      
      // 对非Axios错误，确保我们返回一个带有message的Error对象
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Unknown error fetching skeletons: ${String(errorInfo.value || 'No details')}`);
      }
    }
  },

  // 获取单个骨架
  getSkeletonById: async (id: string) => {
    try {
      const response = await api.get<SkeletonItem>(`/api/skeleton/${id}/`);
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      console.error(`Error fetching skeleton ${id}:`, JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  },

  // 创建骨架
  createSkeleton: async (payload: CreateSkeletonDto) => {
    try {
      const response = await api.post<SkeletonItem>("/api/skeleton/", payload);
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      console.error('Error creating skeleton:', JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  },

  // 更新骨架
  updateSkeleton: async (id: string, payload: UpdateSkeletonDto) => {
    try {
      const response = await api.patch<SkeletonItem>(`/api/skeleton/${id}/`, payload);
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      console.error(`Error updating skeleton ${id}:`, JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  },

  // 删除骨架
  deleteSkeleton: async (id: string) => {
    try {
      const response = await api.delete(`/api/skeleton/${id}/`);
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      console.error(`Error deleting skeleton ${id}:`, JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  },

  // 导入Excel文件
  importExcel: async (file: File) => {
    console.log("Uploading file:", file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // 调试日志
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await api.post<{ success_count: number, error_count: number, errors: string[] }>(
        '/api/skeletons/import/',
        formData,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      const errorInfo = extractErrorInfo(error);
      console.error('Error importing Excel file:', JSON.stringify(errorInfo, null, 2));
      throw error;
    }
  },
};
