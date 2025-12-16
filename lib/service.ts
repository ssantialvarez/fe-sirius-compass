import {
  ChatMessage,
  ChatThread,
  Connection,
  CreateConnectionPayload,
  Project,
  Report,
  SyncRequestPayload,
  SyncRun,
} from "@/lib/types";

export class HttpService {
  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  static async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async getConnections(): Promise<Connection[]> {
    try {
      const response = await fetch('/api/connections');
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  }

  static async createConnection(payload: CreateConnectionPayload): Promise<Connection | null> {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to create connection');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating connection:', error);
      return null;
    }
  }

  static async getChatThreads(): Promise<ChatThread[]> {
    const url = new URL('/api/chat/threads', window.location.origin);
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to fetch chat threads (${response.status})`);
    }
    return await response.json();
  }

  static async getChatMessages(threadId: string, limit = 100): Promise<ChatMessage[]> {
    if (!threadId || threadId === 'undefined') return [];
    const url = new URL(`/api/chat/threads/${threadId}/messages`, window.location.origin);
    url.searchParams.set('limit', String(limit));
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to fetch chat messages (${response.status})`);
    }
    return await response.json();
  }

  static async deleteChatThread(threadId: string): Promise<number> {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: 'DELETE',
      });
      return response.status;
    } catch (error) {
      console.error('Error deleting chat thread:', error);
      return 500;
    }
  }

  static async renameChatThread(threadId: string, title: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to rename thread (${response.status})`);
      }

      return true;
    } catch (error) {
      console.error('Error renaming chat thread:', error);
      return false;
    }
  }

  static async getReports(projectName?: string, limit = 50): Promise<Report[]> {
    try {
      const url = new URL('/api/reports', window.location.origin);
      if (projectName) url.searchParams.set('project_name', projectName);
      url.searchParams.set('limit', String(limit));
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  static async analyzeRepository(payload: {
    repo_url: string;
    developer_name?: string;
    lookback_days?: number;
    project_name?: string;
    linear_team_key?: string;
    user_id?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Analyze request failed');
      }
      return true;
    } catch (error) {
      console.error('Error analyzing repository:', error);
      return false;
    }
  }
  static async deleteConnection(id: number | string, type: 'Repository' | 'Board'): Promise<boolean> {
    try {
      const response = await fetch(`/api/connections/${id}?type=${type}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete connection');
      }
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      return false;
    }
  }

  static async deleteReport(id: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  static async startSync(payload: SyncRequestPayload): Promise<SyncRun | null> {
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        const message = HttpService.isRecord(data)
          ? String(data.error ?? data.message ?? `Failed to start sync (${response.status})`)
          : `Failed to start sync (${response.status})`;
        throw new Error(message);
      }
      return data as SyncRun;
    } catch (error) {
      console.error("Error starting sync:", error);
      throw error;
    }
  }

  static async getSyncRun(runId: number): Promise<SyncRun | null> {
    try {
      const response = await fetch(`/api/sync/runs/${runId}`, { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        const message = HttpService.isRecord(data)
          ? String(data.error ?? data.message ?? `Failed to fetch sync run (${response.status})`)
          : `Failed to fetch sync run (${response.status})`;
        throw new Error(message);
      }
      return data as SyncRun;
    } catch (error) {
      console.error("Error fetching sync run:", error);
      return null;
    }
  }
}
