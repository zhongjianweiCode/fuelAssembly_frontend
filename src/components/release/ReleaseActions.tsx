import { Button } from "../ui/button";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { ReleaseDetailResponse } from "@/types/release";

interface ReleaseActionsProps {
  release: ReleaseDetailResponse;
  onAddSkeletons: (releaseId: string) => void;
  onBatchAddSkeletons: (releaseId: string) => void;
  onEdit: (release: ReleaseDetailResponse) => void;
  onDelete: (release: ReleaseDetailResponse) => void;
}

export const ReleaseActions = ({
  release,
  onAddSkeletons,
  onBatchAddSkeletons,
  onEdit,
  onDelete,
}: ReleaseActionsProps) => {
  return (
    <div className="flex justify-end items-center gap-2">
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-blue-100">
        <Button
          onClick={() => onAddSkeletons(release.id)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <MdAdd className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-blue-100" />
        <Button
          onClick={() => onBatchAddSkeletons(release.id)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <MdAdd className="w-4 h-4" />
          <span className="ml-1 text-xs">Batch</span>
        </Button>
      </div>
      <Button
        onClick={() => onEdit(release)}
        variant="ghost"
        size="sm"
        className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
      >
        <MdEdit className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => onDelete(release)}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <MdDelete className="w-4 h-4" />
      </Button>
    </div>
  );
}; 