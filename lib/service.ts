import { Project } from "@/lib/types";

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
}
