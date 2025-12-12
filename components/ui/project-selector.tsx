import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { HttpService } from "@/lib/service";

export const ProjectSelector = () => {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await HttpService.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setProject(data[0]);
      }
    };
    fetchProjects();
  }, []);

  return (
    <Select
      value={project?.id}
      onValueChange={(value) => {
        const selected = projects.find(p => p.id === value);
        if (selected) setProject(selected);
      }}
    >
      <SelectTrigger className="min-w-[180px] bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0">
        <span className="text-gray-400 mr-2">Project:</span>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent className="bg-[#1c1f26] text-gray-400 border-white/10">
        {projects.length > 0 ? (
          projects.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
              className="hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white cursor-pointer"
            >
              {p.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="loading">
            <Skeleton className="h-4 w-32" />
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};