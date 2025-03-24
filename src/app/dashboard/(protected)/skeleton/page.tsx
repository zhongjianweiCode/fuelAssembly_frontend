"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SkeletonFormMUI } from "@/components/SkeletonFormMUI";
import { useAllOrders } from "@/hooks/useOrder";

export default function Page() {
  const {
    data: orderData,
    isLoading,
    isError,
    error,
  } = useAllOrders();  


  if (isLoading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message={error?.message || "Failed to load data"} />;
  }
  return (
    <div className="p-2 sm:p-4 w-full space-y-4 sm:space-y-8">
      <div className="space-y-3 sm:space-y-6">
        <h1 className="text-xl sm:text-3xl font-bold text-blue-600">
          Skeletons Management
        </h1>
      </div>
      <div className="bg-white w-full rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
        <SkeletonFormMUI orders={orderData || []} />
      </div>
    </div>
  );
}
