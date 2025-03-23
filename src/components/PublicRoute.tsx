"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-500">Loading...</div>
      </div>
    );
  }

  // No auth check needed for public routes - just render the children
  return <>{children}</>;
} 