import { NextResponse } from 'next/server';
import { Message } from '@/lib/types';

const messagesMap: Record<string, Message[]> = {
  '1': [
    {
      id: 1,
      type: 'user',
      content: 'Can we analyze the retro from Sprint 34?',
    },
    {
      id: 2,
      type: 'ai',
      content: 'Sure. Based on the retro notes, the main positive was the high velocity, but there were concerns about test coverage.',
    },
    {
      id: 3,
      type: 'user',
      content: 'What were the action items?',
    },
    {
      id: 4,
      type: 'ai',
      content: '1. Increase unit test coverage to 80%.\n2. Refactor the authentication module.\n3. Schedule a knowledge sharing session on the new API.',
    }
  ],
  '2': [
    {
      id: 1,
      type: 'user',
      content: 'How is Squad Alpha performing this sprint?',
    },
    {
      id: 2,
      type: 'ai',
      content:
        'Squad Alpha is performing well this sprint. Here\'s a summary of their key metrics:',
      hasChart: true,
      chartData: [
        { day: 'Mon', velocity: 8 },
        { day: 'Tue', velocity: 12 },
        { day: 'Wed', velocity: 15 },
        { day: 'Thu', velocity: 18 },
        { day: 'Fri', velocity: 22 },
      ],
    },
    {
      id: 3,
      type: 'ai',
      content:
        '**Key insights:**\n\n• **Velocity**: 22 story points completed so far (on track for 45-point sprint goal)\n• **Cycle time**: Average of 2.8 days (12% improvement vs last sprint)\n• **Blockers**: Only 1 blocked item, resolved within 1 day\n• **Code reviews**: Average review time is 3.2 hours (excellent)\n\nThe team is maintaining consistent delivery pace and collaboration is strong.',
    },
    {
      id: 4,
      type: 'user',
      content: 'What about code review latency across all squads?',
    },
    {
      id: 5,
      type: 'ai',
      content:
        'Code review latency varies across squads. Here\'s the breakdown:\n\n• **Squad Alpha**: 3.2 hours (excellent)\n• **Squad Beta**: 5.8 hours (acceptable)\n• **Squad Gamma**: 9.4 hours (needs attention)\n\n**Recommendation**: Squad Gamma may benefit from reviewing their PR process or adding more reviewers to distribute the load.',
    },
  ],
  '3': [
    {
      id: 1,
      type: 'user',
      content: 'I need to prepare a coaching session for Chen.',
    },
    {
      id: 2,
      type: 'ai',
      content: 'Chen has shown great progress in frontend tasks but seems to struggle with database queries. His PRs related to SQL often have multiple rounds of feedback.',
    },
    {
      id: 3,
      type: 'user',
      content: 'Can you give me some examples?',
    },
    {
      id: 4,
      type: 'ai',
      content: 'In PR #452 and #458, there were comments about N+1 query issues. I suggest focusing on query optimization and ORM best practices.',
    }
  ],
  '4': [
    {
      id: 1,
      type: 'user',
      content: 'Show me the velocity trends for Q4.',
    },
    {
      id: 2,
      type: 'ai',
      content: 'Velocity has been steadily increasing throughout Q4. We started with an average of 35 points per sprint and are now averaging 42.',
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const { id } = await params;
  const messages = messagesMap[id] || [];
  
  return NextResponse.json(messages);
}
