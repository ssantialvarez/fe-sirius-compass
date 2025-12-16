"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ensureSyncJobsWorker, useSyncJobsStore } from "@/lib/sync-jobs";

export function SyncJobsWatcher() {
  const jobsByConnectionId = useSyncJobsStore((s) => s.jobsByConnectionId);
  const prevStatusesRef = useRef<Record<number, string>>({});

  useEffect(() => {
    ensureSyncJobsWorker();
  }, []);

  useEffect(() => {
    const prev = prevStatusesRef.current;

    for (const [key, job] of Object.entries(jobsByConnectionId)) {
      const connectionId = Number(key);
      if (!job) continue;

      const prevStatus = prev[connectionId];
      if (prevStatus !== job.status) {
        if (job.status === "completed") {
          toast.success("Sync completed");
          window.dispatchEvent(new Event("connection-updated"));
        }
        if (job.status === "failed") {
          toast.error("Sync failed");
          window.dispatchEvent(new Event("connection-updated"));
        }
      }

      prev[connectionId] = job.status;
    }

    prevStatusesRef.current = prev;
  }, [jobsByConnectionId]);

  return null;
}
