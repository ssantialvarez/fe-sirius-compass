'use client';
import { User, Briefcase, Save, Users, UserPlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@auth0/nextjs-auth0';
import { Project, ProjectGuestDTO, ProjectGuestRole } from '@/lib/types';
import { HttpService } from '@/lib/service';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Settings() {
  const [projects, setProjects] = useState([] as Project[]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [manageGuestsProjectId, setManageGuestsProjectId] = useState('');
  const [projectGuests, setProjectGuests] = useState([] as ProjectGuestDTO[]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectGuestRole>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ guestId: string; email?: string } | null>(
    null
  );

  const { user } = useUser();
  // TODO: por ahora fetchea de auth0 pero deberia fetchear de nuestra propia bd
  const [profile, setProfile] = useState({
    name: user?.name,
    email: user?.email,
    role: 'Project Manager',
  });
  const fetchProjectsAndSettings = async () => {
    setIsLoading(true);
    try {
      const [projectsData, settings] = await Promise.all([
        HttpService.getProjects(),
        HttpService.getUserSettings(),
      ]);

      setProjects(projectsData);

      setWorkspace((prev) => {
        const merged = {
          ...prev,
          ...(typeof settings.defaultTimeRange === 'string'
            ? { defaultTimeRange: settings.defaultTimeRange }
            : {}),
          ...(typeof settings.defaultProjectId === 'string' || settings.defaultProjectId === null
            ? { defaultProjectId: settings.defaultProjectId ?? '' }
            : {}),
        };

        if (projectsData.length === 0) {
          return { ...merged, defaultProjectId: '' };
        }

        const hasValidSelection =
          !!merged.defaultProjectId && projectsData.some((p) => p.id === merged.defaultProjectId);

        return {
          ...merged,
          defaultProjectId: hasValidSelection ? merged.defaultProjectId : projectsData[0].id,
        };
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjectsAndSettings();

    const handleRefresh = () => fetchProjectsAndSettings();
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

  const fetchProjectGuests = async (projectId: string) => {
    if (!projectId) {
      setProjectGuests([]);
      return;
    }
    setIsLoadingGuests(true);
    try {
      const guests = await HttpService.getProjectGuests(projectId);
      setProjectGuests(guests);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  useEffect(() => {
    // Keep guests management project in sync with current selection.
    if (!manageGuestsProjectId && workspace.defaultProjectId) {
      setManageGuestsProjectId(workspace.defaultProjectId);
    }
  }, [manageGuestsProjectId, workspace.defaultProjectId]);

  useEffect(() => {
    void fetchProjectGuests(manageGuestsProjectId);
  }, [manageGuestsProjectId]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const ok = await HttpService.saveUserSettings({
      defaultProjectId: workspace.defaultProjectId ? workspace.defaultProjectId : null,
      defaultTimeRange: workspace.defaultTimeRange,
    });
    setIsSavingSettings(false);

    if (!ok) {
      toast.error('Failed to save settings')
      return;
    }

    toast.success('Settings saved')
  }

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

          <Button className="gap-2 mt-2" onClick={() => void handleSaveSettings()} disabled={isSavingSettings}>
            <Save size={16} />
            {isSavingSettings ? 'Saving…' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Project Guests */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Users size={20} className="text-primary" />
          <CardTitle className="text-foreground text-lg">Project Guests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Manage guests for</Label>
            {!isLoading && projects.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                No projects yet. Create one to invite guests.
              </div>
            ) : (
              <Select
                value={manageGuestsProjectId}
                onValueChange={(value) => setManageGuestsProjectId(value)}
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
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-muted-foreground">Invite by email</Label>
              <Input
                type="email"
                placeholder="guest@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={!manageGuestsProjectId || isInviting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as ProjectGuestRole)}
                disabled={!manageGuestsProjectId || isInviting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="gap-2"
              disabled={!manageGuestsProjectId || !inviteEmail.trim() || isInviting}
              onClick={async () => {
                if (!manageGuestsProjectId) return;
                const email = inviteEmail.trim();
                if (!email) return;

                setIsInviting(true);
                try {
                  const res = await HttpService.inviteProjectGuest({
                    project_id: manageGuestsProjectId,
                    email,
                    role: inviteRole,
                  });

                  if (!res) {
                    toast.error('Failed to invite guest');
                    return;
                  }

                  toast.success('Guest invited');
                  setInviteEmail('');
                  await fetchProjectGuests(manageGuestsProjectId);
                } finally {
                  setIsInviting(false);
                }
              }}
            >
              <UserPlus size={16} />
              {isInviting ? 'Inviting…' : 'Invite / Update role'}
            </Button>

            <Button
              variant="outline"
              disabled={!manageGuestsProjectId || isLoadingGuests}
              onClick={() => void fetchProjectGuests(manageGuestsProjectId)}
            >
              Refresh
            </Button>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingGuests ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Loading guests…
                    </TableCell>
                  </TableRow>
                ) : projectGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No guests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectGuests.map((pg) => {
                    const email = pg.guest?.email ?? pg.guest_email ?? pg.email;
                    return (
                      <TableRow key={pg.guest_id}>
                        <TableCell>{email ?? pg.guest_id}</TableCell>
                        <TableCell className="capitalize">{pg.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setRemoveTarget({ guestId: pg.guest_id, email });
                              setRemoveModalOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setRemoveTarget(null);
        }}
        title="Remove guest"
        description={
          removeTarget?.email
            ? `This will remove ${removeTarget.email} from the selected project.`
            : 'This will remove the guest from the selected project.'
        }
        onConfirm={async () => {
          if (!removeTarget?.guestId || !manageGuestsProjectId) return;

          const ok = await HttpService.removeProjectGuest(manageGuestsProjectId, removeTarget.guestId);
          if (!ok) {
            toast.error('Failed to remove guest (are you the owner?)');
            return;
          }

          toast.success('Guest removed');
          setRemoveModalOpen(false);
          setRemoveTarget(null);
          await fetchProjectGuests(manageGuestsProjectId);
        }}
      />

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(project) => {
          setProjects((prev) => [...prev, project]);
          setWorkspace((prev) => ({ ...prev, defaultProjectId: project.id }));
          setManageGuestsProjectId(project.id);
        }}
      />
    </div>
  );
}