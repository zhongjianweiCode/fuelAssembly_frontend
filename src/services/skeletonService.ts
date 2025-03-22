import api from "@/lib/api";
import {
  CreateSkeletonDto,
  SkeletonItem,
  UpdateSkeletonDto,
} from "@/types/skeleton";

export const SkeletonService = {
  // 获取所有骨架
  getAllSkelton: async () => {
    console.log('Fetching all skeletons...');
    try {
      const response = await api.get<SkeletonItem[]>("/api/skeleton/");
      console.log('Skeletons API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching skeletons:', error);
      throw error;
    }
  },

  // 获取单个骨架
  getSkeletonById: async (id: string) => {
    try {
      const response = await api.get<SkeletonItem>(`/api/skeleton/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching skeleton ${id}:`, error);
      throw error;
    }
  },

  // 创建骨架
  createSkeleton: async (payload: CreateSkeletonDto) => {
    try {
      const response = await api.post<SkeletonItem>("/api/skeleton/", payload);
      return response;
    } catch (error) {
      console.error('Error creating skeleton:', error);
      throw error;
    }
  },

  // 更新骨架
  updateSkeleton: async (id: string, payload: UpdateSkeletonDto) => {
    try {
      const response = await api.patch<SkeletonItem>(`/api/skeleton/${id}/`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating skeleton ${id}:`, error);
      throw error;
    }
  },

  // 删除骨架
  deleteSkeleton: async (id: string) => {
    try {
      const response = await api.delete(`/api/skeleton/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error deleting skeleton ${id}:`, error);
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
      console.error('Error importing Excel file:', error);
      throw error;
    }
  },
};
