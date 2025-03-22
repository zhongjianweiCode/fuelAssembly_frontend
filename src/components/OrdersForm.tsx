import { OrderItem } from "@/types/order";
import { format, isValid } from "date-fns";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { EditOrdersDialog } from "./EditOrdersDialog";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { useState } from "react";
import { Button } from "./ui/button";
import React from "react";
import { PackageSearch, Barcode, Clock } from "lucide-react";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error, dateString);
    return 'Invalid date';
  }
};

const ITEMS_PER_PAGE = 6; // 每页显示6个卡片

export function OrdersForm({ data }: { data: OrderItem[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  // 计算总页数
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // 获取当前页的订单
  const currentOrders = data
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-blue-50/50 rounded-2xl border border-blue-100">
        <p className="text-blue-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentOrders.map((order) => (
          <div 
            key={order.id} 
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Order Info Section */}
              <div className="space-y-4">
                {/* Order Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center">
                    <PackageSearch className="w-5 h-5 text-blue-600 stroke-[1.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500">Order Name</div>
                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{order.order_name}</div>
                  </div>
                </div>

                {/* Order Batch */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center">
                    <Barcode className="w-5 h-5 text-blue-600 stroke-[1.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500">Batch Number</div>
                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{order.order_batch}</div>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 stroke-[1.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500">Created At</div>
                    <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{formatDate(order.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                <EditOrdersDialog data={order} />
                <DeleteAlertDialog id={order.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-4 px-2 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of{" "}
            {data.length} orders
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2 rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
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
                          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      } transition-colors`}
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
              className="h-8 px-2 rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <MdChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
