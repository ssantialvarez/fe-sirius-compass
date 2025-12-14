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
    fetchConnections();
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
        <ConnectionsTable data={activeConnections} />
      </div>
    </div>
  );
}
