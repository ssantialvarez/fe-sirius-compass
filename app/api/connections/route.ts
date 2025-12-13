import { connect } from 'http2';
import { NextResponse } from 'next/server';

// should return active connections
export async function GET() {
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

  return NextResponse.json(activeConnections);
}
