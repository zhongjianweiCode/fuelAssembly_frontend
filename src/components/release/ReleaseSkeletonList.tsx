import { ReleaseMembership } from "@/types/release";
import { format } from "date-fns";

interface ReleaseSkeletonListProps {
  memberships: ReleaseMembership[];
}

export const ReleaseSkeletonList = ({ memberships }: ReleaseSkeletonListProps) => {
  if (memberships.length === 0) {
    return <div className="text-sm text-gray-500">No skeletons added yet</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {memberships.map((membership) => (
        <div
          key={membership.id}
          className="px-3 py-2 bg-white rounded-lg border border-blue-100 text-sm"
        >
          <div className="font-medium text-blue-900">{membership.skeleton}</div>
          <div className="text-xs text-gray-500">
            Added: {format(new Date(membership.added_at), "yyyy-MM-dd HH:mm")}
          </div>
        </div>
      ))}
    </div>
  );
}; 