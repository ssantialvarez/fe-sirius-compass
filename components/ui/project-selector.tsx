import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useEffect, useState } from "react";
import { HttpService } from "@/lib/service";
import { useProjectStore } from "@/lib/store";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export const ProjectSelector = () => {
  const { currentProject, projects, setProjects, setCurrentProject } = useProjectStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const refreshProjects = useCallback(async () => {
    const data = await HttpService.getProjects();
    setProjects(data);
    if (data.length > 0 && !currentProject) {
      setCurrentProject(data[0]);
    }
  }, [currentProject, setCurrentProject, setProjects]);

  useEffect(() => {
    refreshProjects();

    const handleRefresh = () => void refreshProjects();
    window.addEventListener('project-updated', handleRefresh);
    return () => window.removeEventListener('project-updated', handleRefresh);
  }, [refreshProjects]);

  return (
    <>
      <Select
        value={currentProject?.id ?? ""}
        onValueChange={(value) => {
          if (value === "__create__") {
            setIsCreateOpen(true);
            return;
          }

          const selected = projects.find(p => p.id === value);
          if (selected) setCurrentProject(selected);
        }}
      >
        <SelectTrigger className="min-w-[180px] text-[14px] bg-transparent text-gray-400 font-medium border-none focus:ring-0 focus:ring-offset-0">
          <span className="text-[--var-primary] mr-2">Project:</span>
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent className="bg-background text-gray-400 border-white/10">
          {projects.length > 0 ? (
            projects.map((p) => (
              <SelectItem
                key={p.id}
                value={p.id}
                className="hover:bg-white/5 hover:text-[--var-primary] focus:bg-white/5 focus:text-[--var-primary] cursor-pointer"
              >
                {p.name}
              </SelectItem>
            ))
          ) : (
            <>
              <SelectItem disabled value="__none__">
                No projects
              </SelectItem>
            </>
          )}
          <SelectItem
            value="__create__"
            className="hover:bg-white/5 hover:text-[--var-primary] focus:bg-white/5 focus:text-[--var-primary] cursor-pointer"
          >
            + Create project
          </SelectItem>
        </SelectContent>
      </Select>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(project) => {
          setProjects([...projects.filter((p) => p.id !== project.id), project]);
          setCurrentProject(project);
        }}
      />
    </>
  );
};