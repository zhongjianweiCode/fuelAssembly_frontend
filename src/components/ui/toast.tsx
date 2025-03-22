// components/ui/toast.tsx
'use client';

import { Toaster, toast as hotToast } from 'sonner';

// Toast 容器组件（放在布局文件中）
export const ToastProvider = () => {
  return <Toaster 
    position="top-right"
    toastOptions={{
      classNames: {
        toast: 'bg-white border border-gray-200 shadow-lg',
        title: 'text-sm font-medium',
        description: 'text-sm text-gray-500',
        success: '!bg-green-50 !border-green-200',
        error: '!bg-red-50 !border-red-200',
      }
    }}
  />;
};

// 封装 toast 方法
export const toast = {
  success: (message: string) => hotToast.success(message),
  error: (message: string) => hotToast.error(message),
  info: (message: string) => hotToast.info(message),
  warning: (message: string) => hotToast.warning(message),
  loading: (message: string) => hotToast.loading(message),
  dismiss: (id?: string) => hotToast.dismiss(id),
};