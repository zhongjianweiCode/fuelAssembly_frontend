"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // router.replace("/login");
      const redirectUrl = encodeURIComponent(pathName);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [user, loading, router, pathName]);

  // 显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>loading...</div>
      </div>
    );
  }
  // 如果没有登录，不渲染任何内容（等待重定向）
  if (!user) {
    return null;
  }

  // 已登录，渲染受保护的内容
  return <>{children}</>;
}
