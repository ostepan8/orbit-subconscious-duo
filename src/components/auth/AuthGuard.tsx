"use client";

import { useConvexAuth } from "convex/react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="mt-3 text-sm text-brand-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Middleware should have redirected unauthenticated users already,
  // but show a fallback just in case
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="mt-3 text-sm text-brand-gray">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
