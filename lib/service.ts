import { ChatMessage, ChatThread, Connection, CreateConnectionPayload, Project, Report } from "@/lib/types";

export class HttpService {
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

  static async getChatThreads(userId?: string): Promise<ChatThread[]> {
    try {
      const url = new URL('/api/chat/threads', window.location.origin);
      if (userId) url.searchParams.set('user_id', userId);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch chat threads');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat threads:', error);
      return [];
    }
  }

  static async getChatMessages(threadId: string, limit = 100): Promise<ChatMessage[]> {
    try {
      const url = new URL(`/api/chat/threads/${threadId}/messages`, window.location.origin);
      url.searchParams.set('limit', String(limit));
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch chat messages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
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
}
