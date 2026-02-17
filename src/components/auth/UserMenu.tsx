"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export default function UserMenu() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => void signOut()}
      className="rounded-full px-4 py-1.5 text-sm font-medium text-brand-gray transition-colors hover:bg-brand-cream hover:text-brand-black cursor-pointer"
    >
      Sign Out
    </button>
  );
}
