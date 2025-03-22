export interface ReleaseItem {
    id: string;
    release_name: string;
    release_batch: string;
    created_at: string;
    updated_at: string;
}

// 基础类型
export interface ReleaseMembership {
    id: string;
    skeleton: string;  // skeleton number (e.g., "GRH123456")
    added_at: string;
}

export interface SkeletonRelease {
    id: string;
    release_number: string;
    created_at: string;
    updated_at: string;
    memberships: ReleaseMembership[];
}

// API 请求类型
export interface CreateReleaseRequest {
    release_number: string;  // Format: XX-XX-XX/YYY (e.g., "23-01-01/001")
    skeleton_numbers: string[];  // Array of skeleton numbers (e.g., ["GRH123456"])
}

export interface UpdateReleaseRequest {
    release_number?: string;  // Format: XX-XX-XX/YYY (optional)
}

export interface AddMembershipRequest {
    skeleton_number: string;  // Format: GRH\d{6} (e.g., "GRH123456")
}

export interface BatchAddMembershipRequest {
    skeleton_numbers: string[];  // Array of skeleton numbers
}

export interface DeleteReleaseRequest {
    confirm: boolean;
}

// API 响应类型
export interface ReleaseResponse {
    id: string;
    release_number: string;
    created_at: string;
    updated_at: string;
}

export interface ReleaseDetailResponse extends ReleaseResponse {
    memberships: Array<{
        id: string;
        skeleton: string;
        added_at: string;
    }>;
}

// API 路径参数类型
export interface ReleaseParams {
    release_id: string;
}

export interface ReleaseMembershipParams extends ReleaseParams {
    skeleton_number: string;
}

// API 响应列表类型
export type ReleaseListResponse = ReleaseResponse[];

// 辅助类型
export type ReleaseNumberFormat = `${number}${number}-${number}${number}-${number}${number}/${number}${number}${number}`;  // XX-XX-XX/YYY
export type SkeletonNumberFormat = `GRH${number}${number}${number}${number}${number}${number}`;  // GRH\d{6}

// 验证工具
export const isValidReleaseNumber = (value: string): boolean => {
    return /^\d{2}-\d{2}-\d{2}\/\d+$/.test(value);
};

export const isValidSkeletonNumber = (value: string): boolean => {
    return /^GRH\d{6}$/.test(value);
};

// API 端点映射
export const RELEASE_ENDPOINTS = {
    LIST: '/api/releases/',
    DETAIL: (id: string) => `/api/releases/${id}/`,
    CREATE: '/api/releases/',
    UPDATE: (id: string) => `/api/releases/${id}/`,
    DELETE: (id: string) => `/api/releases/${id}/`,
    ADD_SKELETON: (id: string) => `/api/releases/${id}/skeletons/`,
    BATCH_ADD_SKELETONS: (id: string) => `/api/batch_releases/${id}/`,
    REMOVE_SKELETON: (id: string, skNumber: string) => `/api/releases/${id}/skeletons/${skNumber}/`,
} as const;