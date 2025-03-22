"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";
import { MdCreateNewFolder, MdSearch, MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useCreateOrder, useSearchOrders } from "@/hooks/useOrder";
import { Modal } from "./common/Modal";
import { useDebounce } from "use-debounce";
import { OrderCard } from "./OrderCard";
import React from "react";

const ITEMS_PER_PAGE = 6; // 每页显示6个卡片

export const CreateOrderForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [orderName, setOrderName] = useState<string>("");
  const [orderBatch, setOrderBatch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 使用 use-debounce 库
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const { mutate: createMutate, isPending: isCreating } = useCreateOrder();
  const { data: searchResults, isLoading: isSearching } = useSearchOrders(debouncedSearchQuery);

  // 重置页码当搜索查询改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // 计算分页数据
  const totalPages = searchResults ? Math.ceil(searchResults.length / ITEMS_PER_PAGE) : 0;
  const currentResults = searchResults?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName || !orderBatch.trim()) return;

    const cleanOrderBatch = orderBatch
      .trim()
      .replace(/[#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');

    createMutate(
      { 
        order_name: orderName.trim(), 
        order_batch: cleanOrderBatch 
      },
      {
        onSuccess: () => {
          toast.success("Order created", {
            description: "New order has been added successfully",
            className: "bg-blue-100 border-blue-200 text-blue-900",
          });
          setOrderName("");
          setOrderBatch("");
          setIsModalOpen(false);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("Creation failed", {
            description: error.message || "Please check your input and try again",
            className: "bg-red-100 border-red-200 text-red-900",
          });
        },
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-4 md:p-6 border border-blue-100 space-y-6">
      {/* Search and Create Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-3">
            Search Orders
          </h2>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order name or batch"
              className="rounded-xl border-blue-200 focus:ring-2 focus:ring-blue-200/50 h-12 text-sm md:text-base pl-10 pr-10"
            />
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
              >
                <MdClose className="w-4 h-4 text-blue-500 hover:text-blue-700" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-12 px-6 md:px-8 flex gap-2 items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
          >
            <MdCreateNewFolder className="w-5 h-5" />
            <span className="text-sm md:text-base">Create Order</span>
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner className="text-blue-600" />
        </div>
      ) : currentResults && currentResults.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentResults.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center py-4 px-2">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, searchResults?.length || 0)} of{" "}
                {searchResults?.length || 0} orders
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
      ) : searchQuery && (
        <div className="mt-4 text-center text-blue-500">
          No orders found matching your search
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Order"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="orderName" className="block text-sm font-semibold text-blue-900">
              Order Name
            </label>
            <div className="relative">
              <Input
                id="orderName"
                type="text"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder="Enter order name"
                className="rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-200/50 h-12 text-sm pl-4 transition-all duration-200"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-3">
            <label htmlFor="orderBatch" className="block text-sm font-semibold text-blue-900">
              Order Batch
            </label>
            <div className="relative">
              <Input
                id="orderBatch"
                type="text"
                value={orderBatch}
                onChange={(e) => setOrderBatch(e.target.value)}
                placeholder="Enter order batch"
                className="rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-200/50 h-12 text-sm pl-4 transition-all duration-200"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-white border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-200 text-blue-700 h-12 px-6 font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-12 px-8 flex gap-2 items-center justify-center font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner className="text-white" />
                  <span className="text-sm">Creating...</span>
                </>
              ) : (
                <>
                  <MdCreateNewFolder className="w-5 h-5" />
                  <span className="text-sm">Create</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
