import { create } from 'zustand';
import { Project } from '@/lib/types';

interface ProjectState {
  currentProject: Project | undefined;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: undefined,
  projects: [],
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
}));
