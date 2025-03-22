import { format } from "date-fns";
import { MdAccessTime, MdNumbers, MdLabel } from "react-icons/md";

interface OrderCardProps {
  order: {
    id: string;
    order_name: string;
    order_batch: string;
    created_at: string;
  };
}

export const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        {/* Order Name */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MdLabel className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-orange-600 font-medium">Order Name</div>
            <div className="text-lg font-semibold text-gray-900">{order.order_name}</div>
          </div>
        </div>

        {/* Order Batch */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MdNumbers className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-orange-600 font-medium">Batch Number</div>
            <div className="text-lg font-semibold text-gray-900">{order.order_batch}</div>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MdAccessTime className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-orange-600 font-medium">Created At</div>
            <div className="text-base text-gray-600">
              {format(new Date(order.created_at), "yyyy-MM-dd HH:mm")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 