"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// List of paths that are accessible without authentication
const publicPaths = ['/', '/login', '/register', '/password-reset'];
// Special paths that are part of dashboard but don't require auth
const publicDashboardPaths = ['/dashboard/skeleton'];

interface RouteGuardProps {
  children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the current path is public (either in publicPaths or publicDashboardPaths)
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path)) || 
                        publicDashboardPaths.some(path => pathname === path);

    // Authorization check function
    const authCheck = () => {
      // Always authorize public paths
      if (isPublicPath) {
        setAuthorized(true);
        return;
      }
      
      // For protected paths, check auth status
      if (!isAuthenticated && !loading) {
        console.log("Not authenticated, redirecting from", pathname);
        // Store the current path for redirection after login
        localStorage.setItem('prevPath', pathname || '/dashboard');
        router.push('/login');
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    };

    // Check authentication when the component mounts or when auth status/path changes
    authCheck();
  }, [isAuthenticated, loading, pathname, router]);

  // Show loading spinner while checking auth on protected routes
  if (loading && !publicPaths.some(path => pathname?.startsWith(path)) && 
      !publicDashboardPaths.some(path => pathname === path)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-500">Loading...</div>
      </div>
    );
  }

  // If authorized, render children
  return authorized ? <>{children}</> : null;
} 