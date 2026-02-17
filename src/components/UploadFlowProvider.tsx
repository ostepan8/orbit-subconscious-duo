"use client";

import { createContext, useContext, useState, useCallback } from "react";
import UploadModal from "@/components/upload/UploadModal";

interface UploadContextValue {
  openUpload: (reportId?: string) => void;
}

const UploadContext = createContext<UploadContextValue>({
  openUpload: () => {},
});

export function useUploadContext() {
  return useContext(UploadContext);
}

export default function UploadFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetReportId, setTargetReportId] = useState<string | undefined>();

  const openUpload = useCallback((reportId?: string) => {
    setTargetReportId(reportId);
    setIsOpen(true);
  }, []);

  const closeUpload = useCallback(() => {
    setIsOpen(false);
    setTargetReportId(undefined);
  }, []);

  return (
    <UploadContext.Provider value={{ openUpload }}>
      {children}
      <UploadModal isOpen={isOpen} onClose={closeUpload} reportId={targetReportId} />
    </UploadContext.Provider>
  );
}
