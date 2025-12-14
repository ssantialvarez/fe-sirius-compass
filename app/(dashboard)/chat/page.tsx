'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { Send, Calendar, Users, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { HttpService } from '@/lib/service';
import { useProjectStore } from '@/lib/store';
import type { ChatThread, Connection } from '@/lib/types';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

function createThreadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `thread_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatRelative(isoDate: string) {
  const dt = new Date(isoDate);
  const diffMs = Date.now() - dt.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

async function loadProjectPrimaryRepo(projectName: string): Promise<string | null> {
  const url = new URL('/api/connections', window.location.origin);
  url.searchParams.set('project_name', projectName);
  const response = await fetch(url.toString());
  if (!response.ok) return null;
  const connections = (await response.json()) as Connection[];
  const repo = connections.find((c) => c.type === 'Repository');
  return repo?.name ?? null;
}

export default function AnalysisChat() {
  const [input, setInput] = useState('');
  const [scope, setScope] = useState('project');
  const [timeRange, setTimeRange] = useState('sprint');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryRepoName, setPrimaryRepoName] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { user } = useUser();
  const { currentProject } = useProjectStore();

  const projectName = currentProject?.name ?? '';
  const userId = user?.sub;

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find((t) => t.thread_id === selectedThreadId) ?? null;
  }, [selectedThreadId, threads]);

  const quickActions = [
    { label: 'Velocity trend', icon: TrendingUp },
    { label: 'Blocked work', icon: Clock },
    { label: 'Developer insights', icon: Users },
  ];

  const refreshThreads = async () => {
    const data = await HttpService.getChatThreads(userId);
    setThreads(data);
    if (!selectedThreadId && data.length > 0) {
      setSelectedThreadId(data[0].thread_id);
    }
  };

  const refreshMessages = async (threadId: string) => {
    const data = await HttpService.getChatMessages(threadId);
    const uiMessages: UiMessage[] = data
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        id: String(m.id),
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
    setMessages(uiMessages);
  };

  useEffect(() => {
    refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }
    refreshMessages(selectedThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);

  useEffect(() => {
    if (!projectName) {
      setPrimaryRepoName('');
      return;
    }

    loadProjectPrimaryRepo(projectName)
      .then((repo) => setPrimaryRepoName(repo ?? ''))
      .catch(() => setPrimaryRepoName(''));
  }, [projectName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    const id = createThreadId();
    setSelectedThreadId(id);
    setMessages([]);

    const nowIso = new Date().toISOString();
    setThreads((prev) => [{ thread_id: id, title: 'New conversation', updated_at: nowIso }, ...prev]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const threadId = selectedThreadId ?? createThreadId();
    if (!selectedThreadId) {
      setSelectedThreadId(threadId);
      const nowIso = new Date().toISOString();
      setThreads((prev) => [{ thread_id: threadId, title: 'New conversation', updated_at: nowIso }, ...prev]);
    }

    setInput('');
    setError(null);

    const userMessage: UiMessage = {
      id: `local_user_${Date.now()}`,
      role: 'user',
      content: text,
    };
    const assistantId = `local_assistant_${Date.now()}`;
    const assistantMessage: UiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const resolvedRepoName = primaryRepoName || projectName || 'unknown';

    try {
      setIsStreaming(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: threadId,
          message: text,
          repo_name: resolvedRepoName,
          project_name: projectName || undefined,
          user_id: userId || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `Request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        while (true) {
          const sep = buffer.indexOf('\n\n');
          if (sep === -1) break;

          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          const dataLines = rawEvent
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trim());

          if (dataLines.length === 0) continue;

          const eventPayload = JSON.parse(dataLines.join('\n')) as {
            type: string;
            value?: string;
            message?: string;
          };

          if (eventPayload.type === 'token' && eventPayload.value) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + eventPayload.value } : m,
              ),
            );
          }

          if (eventPayload.type === 'error') {
            throw new Error(eventPayload.message || 'Streaming error');
          }

          if (eventPayload.type === 'done') {
            break;
          }
        }
      }

      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
      await refreshThreads();
    } catch (e) {
      setError(String(e));
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left sidebar - Conversations */}
      <div className="w-64 bg-card border border-border rounded-xl p-4">
        <div className="mb-4">
          <h3 className="text-foreground mb-2">Conversations</h3>
          <button
            onClick={handleNewConversation}
            className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm"
          >
            New conversation
          </button>
        </div>
        <div className="space-y-2">
          {threads.map((thread, index) => (
            <button
              key={thread.thread_id}
              onClick={() => setSelectedThreadId(thread.thread_id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                thread.thread_id === selectedThreadId || (!selectedThreadId && index === 0)
                  ? 'bg-primary/20 border border-primary/30'
                  : 'hover:bg-accent'
              }`}
            >
              <p className="text-sm text-foreground mb-1 line-clamp-2">
                {thread.title}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelative(thread.updated_at)}</p>
            </button>
          ))}

          {threads.length === 0 && (
            <div className="text-sm text-muted-foreground px-3 py-2">
              No conversations yet.
            </div>
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
                {selectedThread?.title ?? 'New conversation'}
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-4'
                    : 'space-y-4'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-6 py-4">
                    <p className="text-foreground whitespace-pre-line">
                      {message.content}
                    </p>
                    {message.isStreaming && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        Generating...
                      </div>
                    )}
                  </div>
                )}

                {message.role === 'user' && (
                  <p className="whitespace-pre-line">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
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
              disabled={isStreaming}
              className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
