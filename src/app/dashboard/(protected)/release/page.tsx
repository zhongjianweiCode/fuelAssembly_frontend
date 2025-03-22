'use client';

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ReleaseList } from "@/components/release/ReleaseList";
import { AddSkeletonModal } from "@/components/release/AddSkeletonModal";
import { BatchAddSkeletonsModal } from "@/components/release/BatchAddSkeletonsModal";
import { CreateReleaseModal } from "@/components/release/CreateReleaseModal";
import { EditReleaseModal } from "@/components/release/EditReleaseModal";
import { DeleteReleaseModal } from "@/components/release/DeleteReleaseModal";
import { ReleaseHeader } from "@/components/release/ReleaseHeader";
import {
  useAllReleases,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
  useAddSkeletonToRelease,
  useBatchAddSkeletonsToRelease,
  useRemoveSkeletonFromRelease,
} from "@/hooks/useRelease";
import { ReleaseDetailResponse } from "@/types/release";

interface ApiError {
  response?: {
    data?: {
      detail?: Array<{
        ctx?: {
          error?: string;
        };
        msg?: string;
      }> | string;
    };
  };
  message: string;
}

export default function ReleasePage() {
  // 获取放行单列表 - 启用自动重新获取和缓存失效
  const { data: releases = [] } = useAllReleases();

  // 状态管理
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkeletonModalOpen, setIsAddSkeletonModalOpen] = useState(false);
  const [isBatchAddModalOpen, setIsBatchAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDetailResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingSkeletonId, setDeletingSkeletonId] = useState<string>("");

  // 搜索过滤
  const filteredReleases = useMemo(() => {
    if (!searchQuery.trim()) return releases;
    
    const query = searchQuery.toLowerCase().trim();
    return releases.filter((release) => {
      // 搜索放行单号
      if (release.release_number.toLowerCase().includes(query)) return true;
      
      // 搜索骨架编号
      return release.memberships.some((membership) =>
        membership.skeleton.toLowerCase().includes(query)
      );
    });
  }, [releases, searchQuery]);

  // Mutations
  const createMutation = useCreateRelease();
  const updateMutation = useUpdateRelease();
  const deleteMutation = useDeleteRelease();
  const addSkeletonMutation = useAddSkeletonToRelease();
  const batchAddMutation = useBatchAddSkeletonsToRelease();
  const removeSkeletonMutation = useRemoveSkeletonFromRelease();

  // 处理函数
  const handleCreateSubmit = async (releaseNumber: string) => {
    try {
      await createMutation.mutateAsync({
        release_number: releaseNumber,
        skeleton_numbers: []
      });
      toast.success("New skeleton release created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Create error:', error);
      toast.error("Failed to create release");
    }
  };

  const handleUpdateSubmit = async (releaseNumber: string) => {
    if (!selectedRelease) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedRelease.id,
        payload: { release_number: releaseNumber }
      });
      toast.success("Release updated successfully");
      setIsEditModalOpen(false);
      setSelectedRelease(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Failed to update release");
    }
  };

  const handleDelete = (release: ReleaseDetailResponse) => {
    setSelectedRelease(release);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRelease) return;
    try {
      await deleteMutation.mutateAsync({
        id: selectedRelease.id,
        payload: { confirm: true }
      });
      toast.success("Release deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedRelease(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete release");
    }
  };

  const handleAddSkeleton = async (skeletonNumber: string) => {
    if (!selectedRelease) return;
    
    try {
      await addSkeletonMutation.mutateAsync({
        releaseId: selectedRelease.id,
        payload: { skeleton_number: skeletonNumber },
      });
      toast.success("Skeleton added successfully");
      setIsAddSkeletonModalOpen(false);
      setSelectedRelease(null);
    } catch (error) {
      const apiError = error as ApiError;
      let errorMessage = "Failed to add skeleton";
      
      if (apiError.response?.data?.detail) {
        if (Array.isArray(apiError.response.data.detail)) {
          const detail = apiError.response.data.detail[0];
          errorMessage = detail.ctx?.error || detail.msg || errorMessage;
        } else {
          errorMessage = apiError.response.data.detail;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleBatchAddSkeletons = async (skeletonNumbers: string[]) => {
    if (!selectedRelease) return;
    try {
      await batchAddMutation.mutateAsync({
        releaseId: selectedRelease.id,
        payload: { skeleton_numbers: skeletonNumbers }
      });
      toast.success(`${skeletonNumbers.length} skeletons added successfully`);
      setIsBatchAddModalOpen(false);
      setSelectedRelease(null);
    } catch (error) {
      console.error('Batch add error:', error);
      toast.error("Failed to add skeletons");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteSkeleton = async (releaseId: string, skeletonNumber: string) => {
    const release = releases.find((r) => r.id === releaseId);
    if (!release) return;

    const membership = release.memberships.find((m) => m.skeleton === skeletonNumber);
    if (!membership) return;

    setDeletingSkeletonId(membership.id);
    try {
      await removeSkeletonMutation.mutateAsync({ releaseId, skeletonNumber });
      toast.success(`Skeleton ${skeletonNumber} removed successfully`);
      setDeletingSkeletonId("");
    } catch (error) {
      console.error('Remove skeleton error:', error);
      toast.error("Failed to remove skeleton");
      setDeletingSkeletonId("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ReleaseHeader 
        onCreateClick={() => setIsCreateModalOpen(true)} 
        onSearch={handleSearch}
      />

      <ReleaseList
        releases={releases}
        filteredReleases={filteredReleases}
        onAddSkeletons={(releaseId) => {
          const release = releases.find((r) => r.id === releaseId);
          if (release) {
            setSelectedRelease(release);
            setIsAddSkeletonModalOpen(true);
          }
        }}
        onBatchAddSkeletons={(releaseId) => {
          const release = releases.find((r) => r.id === releaseId);
          if (release) {
            setSelectedRelease(release);
            setIsBatchAddModalOpen(true);
          }
        }}
        onEdit={(release) => {
          setSelectedRelease(release);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDelete}
        onDeleteSkeleton={handleDeleteSkeleton}
        isDeletingSkeletonId={deletingSkeletonId}
      />

      <CreateReleaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
      />

      <EditReleaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRelease(null);
        }}
        onSubmit={handleUpdateSubmit}
        isLoading={updateMutation.isPending}
        release={selectedRelease}
      />

      <AddSkeletonModal
        isOpen={isAddSkeletonModalOpen}
        onClose={() => {
          setIsAddSkeletonModalOpen(false);
          setSelectedRelease(null);
        }}
        onSubmit={handleAddSkeleton}
        isLoading={addSkeletonMutation.isPending}
        title={`Add Skeleton to Release: ${selectedRelease?.release_number}`}
      />

      <BatchAddSkeletonsModal
        isOpen={isBatchAddModalOpen}
        onClose={() => {
          setIsBatchAddModalOpen(false);
          setSelectedRelease(null);
        }}
        onSubmit={handleBatchAddSkeletons}
        isLoading={batchAddMutation.isPending}
      />

      <DeleteReleaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRelease(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        release={selectedRelease}
      />
    </div>
  );
}