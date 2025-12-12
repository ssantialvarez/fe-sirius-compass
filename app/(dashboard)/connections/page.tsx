import { Database, GitBranch, Trello, Plus, Settings, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddConnectionDialog } from '@/components/connections/add-connection-dialog';

export default function Connections() {
  const integrationTypes = [
    {
      id: 'repository',
      name: 'Repository Service',
      description: 'Connect code repositories (GitHub, GitLab, etc.)',
      icon: GitBranch,
      dataTypes: 'Commits, PRs, reviews, branches',
      status: 'connected',
    },
    {
      id: 'board',
      name: 'Task Board Service',
      description: 'Connect project management tools (Jira, Trello, etc.)',
      icon: Trello,
      dataTypes: 'Tickets, statuses, story points, sprints',
      status: 'connected',
    },
    {
      id: 'other',
      name: 'Other Services',
      description: 'Additional data sources and integrations',
      icon: Database,
      dataTypes: 'Custom data sources',
      status: 'not-connected',
    },
  ];

  const activeConnections = [
    {
      id: 1,
      type: 'Repository',
      name: 'main-backend-api',
      project: 'Project Alpha',
      status: 'active',
      lastSync: '2 minutes ago',
    },
    {
      id: 2,
      type: 'Repository',
      name: 'frontend-web-app',
      project: 'Project Alpha',
      status: 'active',
      lastSync: '5 minutes ago',
    },
    {
      id: 3,
      type: 'Board',
      name: 'Alpha Sprint Board',
      project: 'Project Alpha',
      status: 'syncing',
      lastSync: 'Syncing now',
    },
    {
      id: 4,
      type: 'Repository',
      name: 'mobile-app-ios',
      project: 'Project Beta',
      status: 'error',
      lastSync: '2 hours ago',
    },
    {
      id: 5,
      type: 'Board',
      name: 'Beta Kanban',
      project: 'Project Beta',
      status: 'active',
      lastSync: '8 minutes ago',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-1/20 text-chart-1 text-xs">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case 'syncing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-4/20 text-chart-4 text-xs">
            <Loader size={12} className="animate-spin" />
            Syncing
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs">
            <XCircle size={12} />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your Integrations</h2>
          <p className="text-muted-foreground max-w-2xl">
            Connect code repositories and task boards so Sirius Compass can compute metrics and insights.
            All connections are secure and encrypted.
          </p>
        </div>
        <AddConnectionDialog className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          
        </AddConnectionDialog>
      </div>

      {/* Integration cards grid */}
      <div>
        <h3 className="text-foreground mb-4 text-xl font-semibold">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationTypes.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === 'connected';

            return (
              <Card
                key={integration.id}
                className={`bg-card border transition-all ${
                  isConnected
                    ? 'border-primary/30'
                    : 'border-border hover:border-sidebar-border'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      isConnected
                        ? 'bg-chart-1/20 text-chart-1'
                        : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  <div>
                    <CardTitle className="text-foreground text-lg">
                      {integration.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Data: {integration.dataTypes}
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className={`w-full cursor-pointer duration-300 ${
                      isConnected
                        ? 'bg-accent hover:bg-muted hover:text-foreground text-foreground border border-border'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    variant={isConnected ? "outline" : "default"}
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active connections table */}
      <div>
        <h3 className="text-foreground mb-4 text-xl font-semibold">Active Connections</h3>
        <Card className="bg-card border border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Linked Project
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Sync
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeConnections.map((connection) => (
                    <tr
                      key={connection.id}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-foreground text-sm border border-border">
                          {connection.type === 'Repository' ? (
                            <GitBranch size={14} />
                          ) : (
                            <Trello size={14} />
                          )}
                          {connection.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {connection.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {connection.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(connection.status)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {connection.lastSync}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
                            <RefreshCw size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Settings size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
