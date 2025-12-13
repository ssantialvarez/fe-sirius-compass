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
}