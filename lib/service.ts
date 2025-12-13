import { Connection, Project, Conversation, Message } from "@/lib/types";

export class HttpService {
  static async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await response.json();
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  }

  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getChatMessages(chatId: number): Promise<Message[]> {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }
}
