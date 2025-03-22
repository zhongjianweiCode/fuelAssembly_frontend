"use client";

import { CreateOrderForm } from "@/components/CreateOrderForm";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { OrdersForm } from "@/components/OrdersForm";
import { useAllOrders } from "@/hooks/useOrder";

export default function Page() {
  const { data, isLoading, isError, error } = useAllOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message={error?.message || "Failed to load data"} />;
  }

  return (
    <section className="p-4 md:p-6 w-full space-y-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Orders Management</h1>
        <CreateOrderForm />
      </div>
      {data && data.length > 0 ? (
        <OrdersForm data={data} />
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 text-center">
          <p className="text-lg text-blue-600">No orders found</p>
          <p className="text-sm mt-2 text-blue-500/80">
            Create your first order using the form above
          </p>
        </div>
      )}
    </section>
  );
}
