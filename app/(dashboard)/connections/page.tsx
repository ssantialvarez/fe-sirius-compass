import { Database, GitBranch, Trello, Workflow, Plus, Settings, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-success)]/20 text-[var(--color-success)] text-xs">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case 'syncing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-warning)]/20 text-[var(--color-warning)] text-xs">
            <Loader size={12} className="animate-spin" />
            Syncing
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-danger)]/20 text-[var(--color-danger)] text-xs">
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
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Your Integrations</h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl">
            Connect code repositories and task boards so Sirius Compass can compute metrics and insights.
            All connections are secure and encrypted.
          </p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
          <Plus size={18} className="mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Integration cards grid */}
      <div>
        <h3 className="text-[var(--color-text-primary)] mb-4 text-xl font-semibold">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationTypes.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === 'connected';

            return (
              <Card
                key={integration.id}
                className={`bg-[var(--color-surface)] border transition-all ${
                  isConnected
                    ? 'border-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-background-secondary)] border border-[var(--color-border)] flex items-center justify-center">
                    <Icon size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      isConnected
                        ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                        : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </span>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  <div>
                    <CardTitle className="text-[var(--color-text-primary)] text-lg">
                      {integration.name}
                    </CardTitle>
                    <CardDescription className="text-[var(--color-text-secondary)] mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    Data: {integration.dataTypes}
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className={`w-full ${
                      isConnected
                        ? 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'
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
        <h3 className="text-[var(--color-text-primary)] mb-4 text-xl font-semibold">Active Connections</h3>
        <Card className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50">
                    <th className="text-left px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Linked Project
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Last Sync
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {activeConnections.map((connection) => (
                    <tr
                      key={connection.id}
                      className="hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] text-sm border border-[var(--color-border)]">
                          {connection.type === 'Repository' ? (
                            <GitBranch size={14} />
                          ) : (
                            <Trello size={14} />
                          )}
                          {connection.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                        {connection.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                        {connection.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(connection.status)}</td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        {connection.lastSync}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <RefreshCw size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
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
