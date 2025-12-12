'use client';

import { useState } from 'react';
import { Send, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalysisChat() {
  const [input, setInput] = useState('');
  const [scope, setScope] = useState('project');
  const [timeRange, setTimeRange] = useState('sprint');

  const conversations = [
    { id: 1, title: 'Sprint 34 – Retro analysis', time: '2 hours ago' },
    { id: 2, title: 'Squad Alpha – Performance', time: '1 day ago' },
    { id: 3, title: 'Dev coaching – Chen', time: '3 days ago' },
    { id: 4, title: 'Velocity trends Q4', time: '1 week ago' },
  ];

  const chatMessages = [
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
  ];

  const quickActions = [
    { label: 'Velocity trend', icon: TrendingUp },
    { label: 'Blocked work', icon: Clock },
    { label: 'Developer insights', icon: Users },
  ];

  const handleSend = () => {
    if (input.trim()) {
      setInput('');
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left sidebar - Conversations */}
      <div className="w-64 bg-card border border-border rounded-xl p-4">
        <div className="mb-4">
          <h3 className="text-foreground mb-2">Conversations</h3>
          <button className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm">
            New conversation
          </button>
        </div>
        <div className="space-y-2">
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                index === 0
                  ? 'bg-primary/20 border border-primary/30'
                  : 'hover:bg-accent'
              }`}
            >
              <p className="text-sm text-foreground mb-1 line-clamp-2">
                {conv.title}
              </p>
              <p className="text-xs text-muted-foreground">{conv.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Chat header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-foreground">
                Squad Alpha – Performance
              </h3>
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                AI Assistant
              </span>
            </div>
          </div>

          {/* Scope and time selectors */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="bg-muted text-foreground px-3 py-1.5 rounded-lg border border-border text-sm cursor-pointer"
              >
                <option value="project">Project</option>
                <option value="squad">Squad / Team</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-muted text-foreground px-3 py-1.5 rounded-lg border border-border text-sm cursor-pointer"
              >
                <option value="sprint">This sprint</option>
                <option value="4weeks">Last 4 weeks</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-4'
                    : 'space-y-4'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-6 py-4">
                    <p className="text-foreground whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                )}

                {message.type === 'user' && (
                  <p className="whitespace-pre-line">{message.content}</p>
                )}

                {message.hasChart && message.chartData && (
                  <div className="bg-muted border border-border rounded-xl p-6">
                    <h4 className="text-foreground mb-4">
                      Sprint Velocity Progress
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={message.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="day"
                          stroke="var(--muted-foreground)"
                          tick={{ fill: 'var(--muted-foreground)' }}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          tick={{ fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--foreground)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="velocity"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-6">
          <div className="mb-3 flex gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-accent text-muted-foreground rounded-lg transition-colors text-sm border border-border"
                >
                  <Icon size={14} />
                  {action.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about teams, sprints, repos, or developers…"
              className="flex-1 bg-muted text-foreground px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}