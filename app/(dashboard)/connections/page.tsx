'use client';

import { ConnectionsTable } from '@/components/connections/connections-table';
import { HttpService } from '@/lib/service';
import { useEffect, useState } from 'react';
import { Connection } from '@/lib/types';
import { AddConnectionDialog } from '@/components/connections/add-connection-dialog';
import { Skeleton } from "@/components/ui/skeleton"

export default function Connections() {

  const [activeConnections, setConnections] = useState([] as Connection[]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await HttpService.getConnections();
      setConnections(data);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();

    const handleRefresh = () => fetchConnections(true);
    window.addEventListener('connection-updated', handleRefresh);

    // Polling logic: check every 3 seconds if any connection is syncing ("smart" polling)
    const interval = setInterval(() => {
      setConnections(current => {
        const isSyncing = current.some(c => c.status === 'syncing');
        if (isSyncing) {
          fetchConnections(true); // Silent fetch only if needed
        }
        return current;
      });
    }, 3000);

    return () => {
      window.removeEventListener('connection-updated', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="rounded-md border border-border">
          <div className="p-3 border-b border-border ">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[120px]" /> {/* Headers mimic */}
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-[120px]" /> {/* Type */}
              <Skeleton className="h-4 w-[200px]" /> {/* Name */}
              <Skeleton className="h-4 w-[150px]" /> {/* Project */}
              <Skeleton className="h-5 w-[80px]" />  {/* Status */}
              <Skeleton className="h-4 w-[120px]" /> {/* Last Sync */}
              <div className="flex gap-5">
                <Skeleton className="h-5 w-5 rounded-md" /> {/* Actions */}
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-5 w-5 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ) : (
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
              onConnectionCreated={() => fetchConnections(true)}
            />
          </div>

          {/* Active connections table */}
          <div>
            <h3 className="text-foreground mb-4 text-xl font-semibold">Active Connections</h3>
            <ConnectionsTable data={activeConnections} />
          </div>
        </div>
      )}
    </>
  );
}
