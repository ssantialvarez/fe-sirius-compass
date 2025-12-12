import { NextResponse } from 'next/server';

// should return projects ordered by last time used
export async function GET() {
  const projects = [
    { id: '1', name: 'Saturn' },
    { id: '2', name: 'Jupiter' },
    { id: '3', name: 'Mars' },
  ];

  return NextResponse.json(projects);
}
