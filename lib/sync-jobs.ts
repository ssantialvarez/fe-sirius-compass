"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Connection } from "@/lib/types";

export type SyncJobStatus = "queued" | "running" | "completed" | "failed";

export interface SyncTicketSnapshot {
  at: number;
  data: unknown;
}

export interface SyncJob {
  ticket: string;
  connectionId: number;
  connectionType?: string;
  status: SyncJobStatus;
  createdAt: number;
  updatedAt: number;
  snapshots: SyncTicketSnapshot[];
  lastError?: string;
}

interface SyncJobsState {
  jobsByConnectionId: Record<number, SyncJob | undefined>;
  queue: string[]; // tickets, FIFO

  enqueueTicket: (job: SyncJob) => void;
  startConnectionSync: (connection: Connection) => Promise<{ ticket: string } | null>;
  clearJob: (connectionId: number) => void;
}

const MAX_SNAPSHOTS = 50;
const DEFAULT_POLL_MS = 2000;
const IDLE_POLL_MS = 1000;

function extractTicket(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const anyPayload = payload as Record<string, unknown>;

  const ticket = anyPayload.ticket;
  if (typeof ticket === "string" && ticket.length > 0) return ticket;

  const jobId = anyPayload.job_id;
  if (typeof jobId === "string" && jobId.length > 0) return jobId;

  const id = anyPayload.id;
  if (typeof id === "string" && id.length > 0) return id;

  return null;
}

function normalizeTicketState(payload: unknown): "pending" | "completed" | "failed" {
  if (!payload || typeof payload !== "object") return "pending";
  const anyPayload = payload as Record<string, unknown>;

  if (anyPayload.error) return "failed";
  if (anyPayload.done === true) return "completed";
  if (anyPayload.success === true) return "completed";

  const status = anyPayload.status ?? anyPayload.state;
  if (typeof status === "string") {
    const value = status.toLowerCase();
    if (["completed", "complete", "done", "success", "succeeded", "finished"].includes(value)) {
      return "completed";
    }
    if (["failed", "error", "errored", "cancelled", "canceled"].includes(value)) {
      return "failed";
    }
  }

  return "pending";
}

export const useSyncJobsStore = create<SyncJobsState>()(
  persist(
    (set, get) => ({
      jobsByConnectionId: {},
      queue: [],

      enqueueTicket: (job) => {
        set((state) => {
          const existing = state.jobsByConnectionId[job.connectionId];
          // Don't enqueue duplicate running job for same connection.
          if (existing && (existing.status === "queued" || existing.status === "running")) {
            return state;
          }

          return {
            jobsByConnectionId: {
              ...state.jobsByConnectionId,
              [job.connectionId]: job,
            },
            queue: [...state.queue, job.ticket],
          };
        });
      },

      startConnectionSync: async (connection) => {
        const state = get();
        const existing = state.jobsByConnectionId[connection.id];
        if (existing && (existing.status === "queued" || existing.status === "running")) {
          return { ticket: existing.ticket };
        }

        const url = new URL(`/api/connections/${connection.id}/sync`, window.location.origin);
        if (connection.type) url.searchParams.set("type", connection.type);

        const res = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return null;

        const ticket = extractTicket(data);
        if (!ticket) return null;

        get().enqueueTicket({
          ticket,
          connectionId: connection.id,
          connectionType: connection.type,
          status: "queued",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          snapshots: [{ at: Date.now(), data }],
        });

        ensureSyncJobsWorker();

        return { ticket };
      },

      clearJob: (connectionId) => {
        set((state) => {
          const next = { ...state.jobsByConnectionId };
          const ticket = next[connectionId]?.ticket;
          delete next[connectionId];
          return {
            jobsByConnectionId: next,
            queue: ticket ? state.queue.filter((t) => t !== ticket) : state.queue,
          };
        });
      },
    }),
    {
      name: "sirius-sync-jobs",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        jobsByConnectionId: state.jobsByConnectionId,
        queue: state.queue,
      }),
    }
  )
);

let workerActive = false;
let workerTimer: number | null = null;

function scheduleNext(ms: number) {
  if (workerTimer) window.clearTimeout(workerTimer);
  workerTimer = window.setTimeout(() => {
    void runWorkerLoop();
  }, ms);
}

function findJobByTicket(state: ReturnType<typeof useSyncJobsStore.getState>, ticket: string): SyncJob | null {
  const jobs = Object.values(state.jobsByConnectionId);
  for (const job of jobs) {
    if (job?.ticket === ticket) return job;
  }
  return null;
}

async function pollTicket(job: SyncJob): Promise<{ terminal: boolean; status: SyncJobStatus; payload: unknown; error?: string }> {
  const url = new URL(`/api/connections/sync/${encodeURIComponent(job.ticket)}`, window.location.origin);
  if (job.connectionType) url.searchParams.set("type", job.connectionType);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { terminal: false, status: "running", payload: data, error: `HTTP ${res.status}` };
    }

    const state = normalizeTicketState(data);
    if (state === "completed") return { terminal: true, status: "completed", payload: data };
    if (state === "failed") return { terminal: true, status: "failed", payload: data };

    return { terminal: false, status: "running", payload: data };
  } catch (e) {
    return { terminal: false, status: "running", payload: {}, error: String(e) };
  }
}

async function runWorkerLoop() {
  const storeState = useSyncJobsStore.getState();

  if (storeState.queue.length === 0) {
    workerActive = false;
    scheduleNext(IDLE_POLL_MS);
    return;
  }

  const ticket = storeState.queue[0];
  const job = findJobByTicket(storeState, ticket);

  if (!job) {
    useSyncJobsStore.setState((state) => ({ queue: state.queue.slice(1) }));
    scheduleNext(0);
    return;
  }

  // Mark as running
  if (job.status === "queued") {
    useSyncJobsStore.setState((state) => ({
      jobsByConnectionId: {
        ...state.jobsByConnectionId,
        [job.connectionId]: {
          ...job,
          status: "running",
          updatedAt: Date.now(),
        },
      },
    }));
  }

  const result = await pollTicket(job);

  useSyncJobsStore.setState((state) => {
    const current = state.jobsByConnectionId[job.connectionId];
    if (!current || current.ticket !== job.ticket) return state;

    const snapshots = [...current.snapshots, { at: Date.now(), data: result.payload }].slice(-MAX_SNAPSHOTS);

    return {
      jobsByConnectionId: {
        ...state.jobsByConnectionId,
        [job.connectionId]: {
          ...current,
          status: result.status,
          updatedAt: Date.now(),
          snapshots,
          lastError: result.error ?? current.lastError,
        },
      },
    };
  });

  if (result.terminal) {
    useSyncJobsStore.setState((state) => ({ queue: state.queue.slice(1) }));
    scheduleNext(0);
    return;
  }

  scheduleNext(DEFAULT_POLL_MS);
}

export function ensureSyncJobsWorker() {
  if (workerActive) return;
  workerActive = true;
  scheduleNext(0);
}
