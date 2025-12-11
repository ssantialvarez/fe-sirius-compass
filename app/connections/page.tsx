import { Database, GitBranch, Trello, Workflow, Plus, Settings, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';

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
      id: 'cicd',
      name: 'CI/CD Service',
      description: 'Connect continuous integration pipelines',
      icon: Workflow,
      dataTypes: 'Builds, deployments, test results',
      status: 'not-connected',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[var(--color-text-secondary)] max-w-2xl">
            Connect code repositories and task boards so Sirius Compass can compute metrics and insights.
            All connections are secure and encrypted.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors">
          <Plus size={18} />
          Add Connection
        </button>
      </div>

      {/* Integration cards grid */}
      <div>
        <h3 className="text-[var(--color-text-primary)] mb-4">Available Integrations</h3>
        <div className="grid grid-cols-2 gap-6">
          {integrationTypes.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === 'connected';

            return (
              <div
                key={integration.id}
                className={`bg-[var(--color-surface)] border rounded-xl p-6 hover:border-[var(--color-border-hover)] transition-all ${
                  isConnected
                    ? 'border-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
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
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-[var(--color-text-primary)] mb-1">
                      {integration.name}
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {integration.description}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)]">
                    Data: {integration.dataTypes}
                  </p>

                  <button
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      isConnected
                        ? 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'
                    }`}
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active connections table */}
      <div>
        <h3 className="text-[var(--color-text-primary)] mb-4">Active Connections</h3>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Linked Project
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Last Sync
                  </th>
                  <th className="text-right px-6 py-4 text-sm text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeConnections.map((connection) => (
                  <tr
                    key={connection.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] text-sm">
                        {connection.type === 'Repository' ? (
                          <GitBranch size={14} />
                        ) : (
                          <Trello size={14} />
                        )}
                        {connection.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">
                      {connection.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {connection.project}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(connection.status)}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] text-sm">
                      {connection.lastSync}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                          <RefreshCw size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
