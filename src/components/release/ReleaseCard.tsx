import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { ReleaseDetailResponse, ReleaseMembership } from "@/types/release";
import { format } from "date-fns";
import { DeleteSkeletonModal } from "./DeleteSkeletonModal";

interface ReleaseCardProps {
  release: ReleaseDetailResponse;
  onAddSkeletons: (releaseId: string) => void;
  onBatchAddSkeletons: (releaseId: string) => void;
  onEdit: (release: ReleaseDetailResponse) => void;
  onDelete: (release: ReleaseDetailResponse) => void;
  onDeleteSkeleton: (releaseId: string, skeletonNumber: string) => void;
  isDeletingSkeletonId?: string;
}

export const ReleaseCard = ({
  release,
  onAddSkeletons,
  onBatchAddSkeletons,
  onEdit,
  onDelete,
  onDeleteSkeleton,
  isDeletingSkeletonId,
}: ReleaseCardProps) => {
  const [isDeleteSkeletonModalOpen, setIsDeleteSkeletonModalOpen] = useState(false);
  const [selectedSkeleton, setSelectedSkeleton] = useState<ReleaseMembership | null>(null);

  const handleDeleteSkeleton = (membership: ReleaseMembership) => {
    setSelectedSkeleton(membership);
    setIsDeleteSkeletonModalOpen(true);
  };

  const handleConfirmDeleteSkeleton = () => {
    if (!selectedSkeleton) return;
    onDeleteSkeleton(release.id, selectedSkeleton.skeleton);
    setIsDeleteSkeletonModalOpen(false);
  };

  useEffect(() => {
    if (!isDeletingSkeletonId && selectedSkeleton?.id === isDeletingSkeletonId) {
      setIsDeleteSkeletonModalOpen(false);
      setSelectedSkeleton(null);
    }
  }, [isDeletingSkeletonId, selectedSkeleton]);

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              {release.release_number}
            </h3>
            <p className="text-sm text-blue-500">
              Created: {format(new Date(release.created_at), "MMM d, yyyy HH:mm")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(release)}
              className="h-10 w-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600"
            >
              <MdEdit className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => onDelete(release)}
              className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
            >
              <MdDelete className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Skeletons Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">
              Skeletons ({release.memberships.length})
            </h4>
            <div className="flex gap-2">
              <Button
                onClick={() => onAddSkeletons(release.id)}
                className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm flex items-center gap-1"
              >
                <MdAdd className="w-4 h-4" />
                Add
              </Button>
              <Button
                onClick={() => onBatchAddSkeletons(release.id)}
                className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm"
              >
                Batch Add
              </Button>
            </div>
          </div>

          {release.memberships.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {release.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="group relative bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm hover:bg-blue-50 transition-colors duration-200"
                >
                  <Button
                    onClick={() => handleDeleteSkeleton(membership)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-100/0 hover:bg-red-100 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                  <p className="font-medium text-blue-900">{membership.skeleton}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {format(new Date(membership.added_at), "MMM d, yyyy")}
                  </p>
                  {isDeletingSkeletonId === membership.id && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100">
              No skeletons added yet
            </div>
          )}
        </div>
      </div>

      <DeleteSkeletonModal
        isOpen={isDeleteSkeletonModalOpen}
        onClose={() => {
          setIsDeleteSkeletonModalOpen(false);
          setSelectedSkeleton(null);
        }}
        onConfirm={handleConfirmDeleteSkeleton}
        isLoading={isDeletingSkeletonId === selectedSkeleton?.id}
        releaseNumber={release.release_number}
        skeletonNumber={selectedSkeleton?.skeleton || ""}
      />
    </div>
  );
}; 