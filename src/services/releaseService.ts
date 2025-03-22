import api from "@/lib/api";
import {
  CreateReleaseRequest,
  UpdateReleaseRequest,
  ReleaseResponse,
  ReleaseDetailResponse,
  AddMembershipRequest,
  BatchAddMembershipRequest,
  DeleteReleaseRequest,
  RELEASE_ENDPOINTS,
} from "@/types/release";

export const ReleaseService = {
  // 获取所有放行单列表
  getAllReleases: () => 
    api.get<ReleaseDetailResponse[]>(RELEASE_ENDPOINTS.LIST),

  // 获取单个放行单详情
  getReleaseById: (id: string) => 
    api.get<ReleaseDetailResponse>(RELEASE_ENDPOINTS.DETAIL(id)),

  // 创建新放行单
  createRelease: (payload: CreateReleaseRequest) => 
    api.post<ReleaseResponse>(RELEASE_ENDPOINTS.CREATE, payload),

  // 更新放行单
  updateRelease: (id: string, payload: UpdateReleaseRequest) => 
    api.patch<ReleaseResponse>(RELEASE_ENDPOINTS.UPDATE(id), payload),

  // 删除放行单
  deleteRelease: (id: string, payload: DeleteReleaseRequest) => 
    api.delete(RELEASE_ENDPOINTS.DELETE(id), { data: payload }),

  // 添加单个骨架到放行单
  addSkeletonToRelease: (releaseId: string, payload: AddMembershipRequest) => 
    api.post<ReleaseDetailResponse>(
      RELEASE_ENDPOINTS.ADD_SKELETON(releaseId),
      payload
    ),

  // 批量添加骨架到放行单
  batchAddSkeletonsToRelease: (releaseId: string, payload: BatchAddMembershipRequest) => 
    api.post<ReleaseDetailResponse>(
      RELEASE_ENDPOINTS.BATCH_ADD_SKELETONS(releaseId),
      payload
    ),

  // 从放行单中移除骨架
  removeSkeletonFromRelease: (releaseId: string, skeletonNumber: string) => 
    api.delete(RELEASE_ENDPOINTS.REMOVE_SKELETON(releaseId, skeletonNumber)),
}; 