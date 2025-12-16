'use client';

import { ConnectionsTable } from '@/components/connections/connections-table';
import { HttpService } from '@/lib/service';
import { useEffect, useState } from 'react';
import { Connection } from '@/lib/types';
import { AddConnectionDialog } from '@/components/connections/add-connection-dialog';
import { SyncJobsWatcher } from '@/components/connections/sync-jobs-watcher';

export default function Connections() {

  const [activeConnections, setConnections] = useState([] as Connection[]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const data = await HttpService.getConnections();
      setConnections(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();

    const handleRefresh = () => fetchConnections();
    window.addEventListener('connection-updated', handleRefresh);
    return () => window.removeEventListener('connection-updated', handleRefresh);
  }, []);

  return (
    <div className="space-y-8 p-8">
      <SyncJobsWatcher />
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
        <ConnectionsTable data={activeConnections} isLoading={isLoading} />
      </div>
    </div>
  );
}
