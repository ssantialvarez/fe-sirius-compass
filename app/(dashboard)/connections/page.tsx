'use client';
import { Database, GitBranch, Trello } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionsTable } from '@/components/connections/connections-table';
import { HttpService } from '@/lib/service';
import { useEffect, useState } from 'react';
import { Connection } from '@/lib/types';
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
  const [activeConnections, setConnections] = useState([] as Connection[]);

  const fetchConnections = async () => {
    const data = await HttpService.getConnections();
    setConnections(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConnections();

    const handleRefresh = () => fetchConnections();
    window.addEventListener('connection-updated', handleRefresh);
    return () => window.removeEventListener('connection-updated', handleRefresh);
  }, []);

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
        <AddConnectionDialog
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          onConnectionCreated={fetchConnections}
        />
      </div>

      {/* Active connections table */}
      <div>
        <h3 className="text-foreground mb-4 text-xl font-semibold">Active Connections</h3>
        <ConnectionsTable data={activeConnections} />
      </div>
    </div>
  );
}
