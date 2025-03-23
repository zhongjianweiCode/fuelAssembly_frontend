"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only check authentication after loading completes
    if (!loading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login from", pathname);
      // 存储当前路径，以便登录后返回
      localStorage.setItem('prevPath', pathname || '/dashboard');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-500">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show minimal loading until redirect happens
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-500">Redirecting to login...</div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
} 