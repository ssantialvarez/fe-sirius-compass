import { NextResponse } from 'next/server';
import { Conversation } from '@/lib/types';

const conversations: Conversation[] = [
  { id: 1, title: 'Sprint 34 – Retro analysis', time: '2 hours ago' },
  { id: 2, title: 'Squad Alpha – Performance', time: '1 day ago' },
  { id: 3, title: 'Dev coaching – Chen', time: '3 days ago' },
  { id: 4, title: 'Velocity trends Q4', time: '1 week ago' },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(conversations);
}
