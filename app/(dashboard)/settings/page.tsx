'use client';
import { User, Bell, Briefcase, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@auth0/nextjs-auth0';
import { Project } from '@/lib/types';
import { HttpService } from '@/lib/service';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

export default function Settings() {
  const [projects, setProjects] = useState([] as Project[]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useUser();
  // TODO: por ahora fetchea de auth0 pero deberia fetchear de nuestra propia bd
  const [profile, setProfile] = useState({
    name: user?.name,
    email: user?.email,
    role: 'Project Manager',
  });
  const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await HttpService.getProjects();
        setProjects(data);

        // Default: if no selection (or selection no longer exists), pick the first project.
        if (data.length > 0) {
          setWorkspace((prev) => {
            const stillExists = prev.defaultProjectId && data.some((p) => p.id === prev.defaultProjectId);
            return {
              ...prev,
              defaultProjectId: stillExists ? prev.defaultProjectId : data[0].id,
            };
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProjects();
  
      const handleRefresh = () => fetchProjects();
      window.addEventListener('project-updated', handleRefresh);
      return () => window.removeEventListener('project-updated', handleRefresh);
    }, []);
  
  
  /*
  const [notifications, setNotifications] = useState({
    weeklyReports: true,
    blockedAlerts: true,
    velocityAlerts: false,
    performanceInsights: true,
  });
  */
  const [workspace, setWorkspace] = useState({
    defaultProjectId: '',
    defaultTimeRange: 'Last 4 weeks',
  });

  return (
    <div className="max-w-4xl space-y-8 p-8">
      {/* Profile Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <User size={20} className="text-primary" />
          <CardTitle className="text-foreground text-lg">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Full Name</Label>
              <Input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Role</Label>
            <Select 
              value={profile.role} 
              onValueChange={(value) => setProfile({ ...profile, role: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Engineering Manager">Engineering Manager</SelectItem>
                <SelectItem value="Tech Lead">Tech Lead</SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="gap-2 mt-2">
            <Save size={16} />
            Save Profile
          </Button>
        </CardContent>
      </Card>
      
      {/* Notification Preferences */}
      {/*
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Bell size={20} className="text-primary" />
          <CardTitle className="text-foreground text-lg">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-foreground font-medium mb-1">Weekly Reports Email</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary reports every Monday
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) =>
                  setNotifications({ ...notifications, weeklyReports: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-foreground font-medium mb-1">Blocked Work Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when tasks are blocked for more than 24 hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.blockedAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, blockedAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-foreground font-medium mb-1">Velocity Alerts</p>
              <p className="text-sm text-muted-foreground">
                Alert when velocity changes by more than 20%
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.velocityAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, velocityAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-foreground font-medium mb-1">Performance Insights</p>
              <p className="text-sm text-muted-foreground">
                Receive AI-generated insights and recommendations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.performanceInsights}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    performanceInsights: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <Button className="gap-2 mt-2">
            <Save size={16} />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
      */}
      {/* Workspace Settings */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Briefcase size={20} className="text-primary" />
          <CardTitle className="text-foreground text-lg">Workspace Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Default Project
            </Label>
            {!isLoading && projects.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                No projects yet. Create one to get started.
                <div className="mt-3">
                  <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                    Create project
                  </Button>
                </div>
              </div>
            ) : (
              <Select
                value={workspace.defaultProjectId}
                onValueChange={(value) => {
                  if (value === '__create__') {
                    setIsCreateOpen(true);
                    return;
                  }
                  setWorkspace({ ...workspace, defaultProjectId: value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem disabled value="__loading__">Loading…</SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                  <SelectItem value="__create__">+ Create project</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Default Time Range
            </Label>
            <Select 
              value={workspace.defaultTimeRange} 
              onValueChange={(value) => setWorkspace({ ...workspace, defaultTimeRange: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 4 weeks">Last 4 weeks</SelectItem>
                <SelectItem value="Last 8 weeks">Last 8 weeks</SelectItem>
                <SelectItem value="Last quarter">Last quarter</SelectItem>
                <SelectItem value="This sprint">This sprint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="gap-2 mt-2">
            <Save size={16} />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(project) => {
          setProjects((prev) => [...prev, project]);
          setWorkspace((prev) => ({ ...prev, defaultProjectId: project.id }));
        }}
      />
    </div>
  );
}