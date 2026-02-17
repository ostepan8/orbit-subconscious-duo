"use client";

import Image from "next/image";
import Link from "next/link";
import UserMenu from "@/components/auth/UserMenu";

export default function ReportHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-brand-black/5 bg-white px-6">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/Subconscious_Logo.png"
          alt="Subconscious"
          width={130}
          height={26}
          priority
        />
        <span className="text-xs font-medium text-brand-gray">&times; Orbit</span>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-brand-gray transition-colors hover:bg-brand-cream hover:text-brand-black"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          My Ventures
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
