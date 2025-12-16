import {
  ChatMessage,
  ChatThread,
  Connection,
  CreateConnectionPayload,
  InviteGuestRequest,
  ProjectGuestDTO,
  Project,
  Report,
  SaveUserSettingsPayload,
  SyncRequestPayload,
  SyncRun,
  UserSettings,
} from "@/lib/types";

export class HttpService {
  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private static readonly allowedTimeRanges = new Set(["7d", "30d", "90d", "180d", "365d", "all"]);

  private static normalizeTimeRange(value: string): string {
    const trimmed = value.trim();
    if (this.allowedTimeRanges.has(trimmed)) return trimmed;

    // Back-compat with older UI labels.
    const legacyMap: Record<string, string> = {
      "Last 4 weeks": "30d",
      "Last 8 weeks": "90d",
      "Last quarter": "90d",
      "This sprint": "7d",
    };
    if (trimmed in legacyMap) return legacyMap[trimmed]!;

    return "30d";
  }

  private static async readErrorMessage(response: Response): Promise<string> {
    const text = await response.text().catch(() => "");
    if (text) return text;
    return `Request failed (${response.status})`;
  }

  static async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async inviteProjectGuest(payload: InviteGuestRequest): Promise<ProjectGuestDTO | null> {
    try {
      const response = await fetch('/api/projects/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response));
      }

      return (await response.json().catch(() => null)) as ProjectGuestDTO | null;
    } catch (error) {
      console.error('Error inviting project guest:', error);
      return null;
    }
  }

  static async getProjectGuests(projectId: string): Promise<ProjectGuestDTO[]> {
    if (!projectId) return [];

    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/guests`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response));
      }
      return (await response.json().catch(() => [])) as ProjectGuestDTO[];
    } catch (error) {
      console.error('Error fetching project guests:', error);
      return [];
    }
  }

  static async removeProjectGuest(projectId: string, guestId: string): Promise<boolean> {
    if (!projectId || !guestId) return false;
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/guests/${encodeURIComponent(guestId)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response));
      }
      return true;
    } catch (error) {
      console.error('Error removing project guest:', error);
      return false;
    }
  }

  static async createProject(payload: { name: string }): Promise<Project | null> {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to create project');
      }
      return (await response.json()) as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  static async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await fetch("/api/user-settings", { cache: "no-store" });
      if (!response.ok) {
        return {};
      }
      const raw = (await response.json().catch(() => ({}))) as unknown;
      if (!this.isRecord(raw)) return {};

      // Accept either camelCase or snake_case from backend.
      const defaultProjectId =
        (typeof raw.defaultProjectId === "string" ? raw.defaultProjectId : undefined) ??
        (typeof raw.default_project_id === "string" ? raw.default_project_id : undefined) ??
        null;

      const defaultTimeRangeRaw =
        (typeof raw.defaultTimeRange === "string" ? raw.defaultTimeRange : undefined) ??
        (typeof raw.default_time_range === "string" ? raw.default_time_range : undefined);

      const defaultTimeRange =
        typeof defaultTimeRangeRaw === "string" ? this.normalizeTimeRange(defaultTimeRangeRaw) : undefined;

      return {
        defaultProjectId,
        ...(defaultTimeRange ? { defaultTimeRange } : {}),
      };
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return {};
    }
  }

  static async saveUserSettings(payload: SaveUserSettingsPayload): Promise<boolean> {
    try {
      // Send snake_case to match typical Python backends.
      const body = {
        default_project_id: payload.defaultProjectId,
        default_time_range: this.normalizeTimeRange(payload.defaultTimeRange),
      };

      const response = await fetch("/api/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch (error) {
      console.error("Error saving user settings:", error);
      return false;
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
