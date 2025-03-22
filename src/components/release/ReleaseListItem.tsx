import { ReleaseDetailResponse } from "@/types/release";
import { format } from "date-fns";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { ReleaseActions } from "./ReleaseActions";
import { ReleaseSkeletonList } from "./ReleaseSkeletonList";

interface ReleaseListItemProps {
  release: ReleaseDetailResponse;
  isExpanded: boolean;
  onToggleExpand: (releaseId: string) => void;
  onAddSkeletons: (releaseId: string) => void;
  onBatchAddSkeletons: (releaseId: string) => void;
  onEdit: (release: ReleaseDetailResponse) => void;
  onDelete: (release: ReleaseDetailResponse) => void;
}

export const ReleaseListItem = ({
  release,
  isExpanded,
  onToggleExpand,
  onAddSkeletons,
  onBatchAddSkeletons,
  onEdit,
  onDelete,
}: ReleaseListItemProps) => {
  return (
    <>
      <tr className="hover:bg-blue-50/50 transition-colors">
        <td className="px-4 py-4">
          <button
            onClick={() => onToggleExpand(release.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? (
              <MdExpandLess className="w-5 h-5" />
            ) : (
              <MdExpandMore className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {release.release_number}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {format(new Date(release.created_at), "yyyy-MM-dd")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {release.memberships.length} skeletons
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
          <ReleaseActions
            release={release}
            onAddSkeletons={onAddSkeletons}
            onBatchAddSkeletons={onBatchAddSkeletons}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="bg-blue-50/30">
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Skeleton List</h4>
              <ReleaseSkeletonList memberships={release.memberships} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}; 