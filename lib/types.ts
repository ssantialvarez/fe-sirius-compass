export interface Project {
  id: string;
  name: string;
}

export interface Connection {
  id: number;
  type: string;
  name: string;
  project: string;
  status: string;
  lastSync: string;
  last_error?: string;
}

export interface ChatThread {
  thread_id: string;
  title: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  role: "system" | "user" | "assistant" | "tool" | string;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface Report {
  id: number;
  week: string;
  project: string;
  repository: string;
  status: "healthy" | "watch" | "at-risk" | string;
  summary: string;
  risk_details?: string;
  created_at: string;
}

export interface CreateConnectionPayload {
  type: "repository" | "board" | "linear";
  project_name: string;
  repo_url?: string;
  github_token?: string;
  linear_api_key?: string;
  linear_team_key?: string;
  user_id?: string;
}

export interface SyncRequestPayload {
  project_name: string;
  repo_name?: string | null;
  providers?: string[];
  full_history?: boolean;
  max_commits?: number | null;
  max_prs?: number | null;
  max_tickets?: number | null;
}

export interface SyncRun {
  id: number;
  status: "queued" | "running" | "completed" | "failed" | string;
  provider: string;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  progress_current: number;
  progress_total?: number | null;
  message?: string | null;
  details?: Record<string, unknown>;
}
