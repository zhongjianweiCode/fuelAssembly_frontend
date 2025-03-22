import { useState } from "react";
import { ReleaseDetailResponse } from "@/types/release";
import { ReleaseCard } from "./ReleaseCard";
import { Button } from "../ui/button";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import React from "react";

interface ReleaseListProps {
  releases: ReleaseDetailResponse[];
  onAddSkeletons: (releaseId: string) => void;
  onBatchAddSkeletons: (releaseId: string) => void;
  onEdit: (release: ReleaseDetailResponse) => void;
  onDelete: (release: ReleaseDetailResponse) => void;
  onDeleteSkeleton: (releaseId: string, skeletonNumber: string) => void;
  isDeletingSkeletonId?: string;
  filteredReleases?: ReleaseDetailResponse[];
}

const ITEMS_PER_PAGE = 2; // 每页显示3个卡片

export const ReleaseList = ({
  releases,
  onAddSkeletons,
  onBatchAddSkeletons,
  onEdit,
  onDelete,
  onDeleteSkeleton,
  isDeletingSkeletonId,
  filteredReleases,
}: ReleaseListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const displayReleases = filteredReleases || releases;

  // 计算总页数
  const totalPages = Math.ceil(displayReleases.length / ITEMS_PER_PAGE);

  // 获取当前页的放行单
  const currentReleases = displayReleases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (displayReleases.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100">
        <p className="text-gray-500">No releases found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {currentReleases.map((release) => (
          <ReleaseCard
            key={release.id}
            release={release}
            onAddSkeletons={onAddSkeletons}
            onBatchAddSkeletons={onBatchAddSkeletons}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeleteSkeleton={onDeleteSkeleton}
            isDeletingSkeletonId={isDeletingSkeletonId}
          />
        ))}
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-4 px-2">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, displayReleases.length)} of{" "}
            {displayReleases.length} releases
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2 rounded-lg border-blue-200"
            >
              <MdChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // 显示第一页、最后一页，和当前页附近的页码
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 p-0 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-blue-200 text-gray-600"
                      }`}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-2 rounded-lg border-blue-200"
            >
              <MdChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 