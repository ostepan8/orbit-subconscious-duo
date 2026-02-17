"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import UserMenu from "@/components/auth/UserMenu";
import Image from "next/image";

function DashboardContent() {
  const reports = useQuery(api.reports.getMyReports);
  const createBlankReport = useMutation(api.seed.createBlankReport);
  const deleteReport = useMutation(api.reports.deleteReport);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"reports"> | null>(null);

  async function handleCreateReport() {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const result = await createBlankReport({ title: newTitle.trim() });
      router.push(`/report/${result.externalId}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="border-b border-brand-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/Subconscious_Logo.png"
              alt="Subconscious"
              width={160}
              height={32}
              priority
            />
            <span className="text-sm font-medium text-brand-gray">
              &times; Orbit
            </span>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">My Ventures</h1>
            <p className="mt-1 text-sm text-brand-gray">
              Your Disciplined Entrepreneurship workbooks
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-all hover:bg-brand-orange/90 cursor-pointer"
          >
            + New Venture
          </button>
        </div>

        {/* Loading */}
        {reports === undefined && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {reports && reports.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-brand-black/10 p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/10">
              <svg
                className="h-8 w-8 text-brand-orange"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-brand-black">
              No ventures yet
            </p>
            <p className="mt-2 text-sm text-brand-gray">
              Create your first startup idea to get started with the 24-step DE
              framework
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-all hover:bg-brand-orange/90 cursor-pointer"
            >
              Create Your First Venture
            </button>
          </div>
        )}

        {/* Report cards grid */}
        {reports && reports.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => router.push(`/report/${report.externalId}`)}
                className="group relative cursor-pointer rounded-2xl border border-brand-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(report._id);
                  }}
                  className="absolute top-3 right-3 rounded-lg p-1.5 text-brand-gray/0 transition-all group-hover:text-brand-gray/40 hover:!text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-brand-black line-clamp-2 group-hover:text-brand-orange transition-colors pr-8">
                  {report.title}
                </h3>
                <p className="mt-2 text-sm text-brand-gray line-clamp-3">
                  {report.summary}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-brand-gray">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <span className="text-xs font-medium text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
                    Open &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-brand-black">
              Delete venture?
            </h2>
            <p className="mt-1 text-sm text-brand-gray">
              This will permanently delete the venture and all its data including steps, citations, recommendations, and chat history.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-full px-5 py-2 text-sm font-medium text-brand-gray hover:bg-brand-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteReport({ reportId: deletingId });
                  setDeletingId(null);
                }}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/20 hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-brand-black">
              New Venture
            </h2>
            <p className="mt-1 text-sm text-brand-gray">
              Give your startup idea a name to get started
            </p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Autonomous Delivery Drones"
              className="mt-4 w-full rounded-xl border border-brand-black/10 px-4 py-3 text-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) handleCreateReport();
              }}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle("");
                }}
                className="rounded-full px-5 py-2 text-sm font-medium text-brand-gray hover:bg-brand-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                disabled={!newTitle.trim() || isCreating}
                className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-orange/20 disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
