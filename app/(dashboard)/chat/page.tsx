'use client';

import { useState, useEffect } from 'react';
import { Send, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { Message, Conversation } from '@/lib/types';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { HttpService } from '@/lib/service';

export default function AnalysisChat() {
  const [input, setInput] = useState('');
  const [scope, setScope] = useState('project');
  const [timeRange, setTimeRange] = useState('sprint');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingConversations(true);
      const data = await HttpService.getConversations();
      setConversations(data);
      setIsLoadingConversations(false);
      
      if (data.length > 0) {
        handleConversationClick(data[0].id);
      }
    };
    loadConversations();
  }, []);

  const handleConversationClick = async (id: number) => {
    setActiveConversationId(id);
    setIsLoadingMessages(true);
    const data = await HttpService.getChatMessages(id);
    setMessages(data);
    setIsLoadingMessages(false);
  };

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

  const activeConversation = conversations.find(c => c.id === activeConversationId);

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
          {isLoadingConversations ? (
            <div className="text-sm text-muted-foreground p-2">Loading...</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-accent'
                }`}
              >
                <p className="text-sm text-foreground mb-1 line-clamp-2">
                  {conv.title}
                </p>
                <p className="text-xs text-muted-foreground">{conv.time}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Chat header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-foreground">
                {activeConversation ? activeConversation.title : 'Select a conversation'}
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
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading messages...
            </div>
          ) : (
            messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))
          )}
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