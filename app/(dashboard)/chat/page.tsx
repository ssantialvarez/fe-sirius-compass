'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { Send, Users, TrendingUp, Clock, Loader2, Trash2 } from 'lucide-react';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { toast } from 'sonner';
import { HttpService } from '@/lib/service';
import { useProjectStore } from '@/lib/store';
import type { ChatThread, Connection, SyncRequestPayload, SyncRun } from '@/lib/types';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  createdAt?: string;
};

function createThreadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `thread_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTimestamp(isoDate?: string) {
  if (!isoDate) return '';
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return isoDate;
  return dt.toLocaleString();
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

function safeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: Array<{
    type: 'link' | 'bold' | 'code';
    regex: RegExp;
  }> = [
      { type: 'link', regex: /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/ },
      { type: 'bold', regex: /\*\*([^*]+)\*\*/ },
      { type: 'code', regex: /`([^`]+)`/ },
    ];

  while (remaining.length > 0) {
    let best:
      | { type: 'link' | 'bold' | 'code'; match: RegExpMatchArray; index: number }
      | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (!match || match.index === undefined) continue;
      if (!best || match.index < best.index) {
        best = { type: pattern.type, match, index: match.index };
      }
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    if (best.index > 0) {
      nodes.push(remaining.slice(0, best.index));
    }

    if (best.type === 'bold') {
      nodes.push(<strong key={`b_${key++}`}>{best.match[1]}</strong>);
    } else if (best.type === 'code') {
      nodes.push(
        <code
          key={`c_${key++}`}
          className="px-1 py-0.5 rounded bg-background/60 border border-border font-mono text-sm"
        >
          {best.match[1]}
        </code>,
      );
    } else if (best.type === 'link') {
      const href = safeHttpUrl(best.match[2]);
      if (href) {
        nodes.push(
          <a
            key={`l_${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary"
          >
            {best.match[1]}
          </a>,
        );
      } else {
        nodes.push(best.match[0]);
      }
    }

    remaining = remaining.slice(best.index + best.match[0].length);
  }

  return nodes;
}

function MarkdownText({ content }: { content: string }) {
  const segments = content.split('```');
  const blocks: ReactNode[] = [];

  segments.forEach((segment, index) => {
    const isCode = index % 2 === 1;
    if (isCode) {
      const firstNewline = segment.indexOf('\n');
      const code = firstNewline === -1 ? segment : segment.slice(firstNewline + 1);
      blocks.push(
        <pre
          key={`code_${index}`}
          className="overflow-x-auto rounded-lg border border-border bg-background/40 p-4 text-sm"
        >
          <code className="font-mono whitespace-pre">{code.trimEnd()}</code>
        </pre>,
      );
      return;
    }

    const lines = segment.split('\n');
    let listBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length === 0) return;
      blocks.push(
        <ul key={`ul_${index}_${blocks.length}`} className="list-disc pl-6 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={`li_${index}_${i}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (listMatch) {
        listBuffer.push(listMatch[1]);
        continue;
      }

      flushList();

      if (!line.trim()) {
        blocks.push(<div key={`sp_${index}_${blocks.length}`} className="h-2" />);
        continue;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const className =
          level === 1
            ? 'text-lg font-semibold'
            : level === 2
              ? 'text-base font-semibold'
              : 'text-sm font-semibold';

        blocks.push(
          <div key={`h_${index}_${blocks.length}`} className={className}>
            {renderInlineMarkdown(text)}
          </div>,
        );
        continue;
      }

      blocks.push(
        <p key={`p_${index}_${blocks.length}`} className="whitespace-pre-wrap">
          {renderInlineMarkdown(line)}
        </p>,
      );
    }

    flushList();
  });

  return <div className="space-y-2">{blocks}</div>;
}

const SYNC_REQUEST_RE = /<sync_request>([\s\S]*?)<\/sync_request>/i;
const SYNC_RUN_RE = /<sync_run>([\s\S]*?)<\/sync_run>/i;

function parseSyncBlocks(content: string): {
  text: string;
  syncRequest?: SyncRequestPayload;
  syncRunId?: number;
} {
  let syncRequest: SyncRequestPayload | undefined;
  let syncRunId: number | undefined;

  const reqMatch = content.match(SYNC_REQUEST_RE);
  if (reqMatch?.[1]) {
    try {
      syncRequest = JSON.parse(reqMatch[1]) as SyncRequestPayload;
    } catch {
      // ignore invalid JSON
    }
  }

  const runMatch = content.match(SYNC_RUN_RE);
  if (runMatch?.[1]) {
    try {
      const payload = JSON.parse(runMatch[1]) as { run_id?: number; runId?: number; id?: number };
      const id = payload.run_id ?? payload.runId ?? payload.id;
      if (typeof id === 'number') syncRunId = id;
    } catch {
      // ignore invalid JSON
    }
  }

  const text = content
    .replace(SYNC_REQUEST_RE, '')
    .replace(SYNC_RUN_RE, '')
    .trim();

  return { text, syncRequest, syncRunId };
}

export default function AnalysisChat() {
  const [input, setInput] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryRepoName, setPrimaryRepoName] = useState<string>('');
  const [activeSyncRunId, setActiveSyncRunId] = useState<number | null>(null);
  const [syncRun, setSyncRun] = useState<SyncRun | null>(null);
  const [isStartingSync, setIsStartingSync] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRequestRef = useRef(0);
  const selectedThreadIdRef = useRef<string | null>(null);
  const syncStatusRef = useRef<string | null>(null);

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
    try {
      const data = await HttpService.getChatThreads();
      setThreads(data);
      setSelectedThreadId((current) => {
        if (current && current !== 'undefined') return current;
        return data[0]?.thread_id ?? null;
      });
    } catch (e) {
      setError(String(e));
      setThreads([]);
    }
  };

  const refreshMessages = async (threadId: string) => {
    if (!threadId || threadId === 'undefined') {
      setMessages([]);
      return;
    }

    const requestId = ++messagesRequestRef.current;
    setIsLoadingMessages(true);

    try {
      const data = await HttpService.getChatMessages(threadId);
      if (messagesRequestRef.current !== requestId) return;

      const uiMessages: UiMessage[] = data
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          id: String(m.id),
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          createdAt: m.created_at,
        }));
      setMessages(uiMessages);
    } catch (e) {
      if (messagesRequestRef.current !== requestId) return;
      const msg = String(e);
      // Ignore 404 (new thread not saved yet)
      if (msg.includes('404') || msg.includes('not found')) {
        setMessages([]);
        setError(null);
      } else {
        setError(msg);
        setMessages([]);
      }
    } finally {
      if (messagesRequestRef.current === requestId) {
        setIsLoadingMessages(false);
      }
    }
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
    if (selectedThreadId === 'undefined') {
      setMessages([]);
      return;
    }
    refreshMessages(selectedThreadId);
  }, [selectedThreadId]);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
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

  useEffect(() => {
    // Auto-detect sync run IDs embedded in assistant messages.
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role !== 'assistant') continue;
      const parsed = parseSyncBlocks(messages[i].content);
      if (parsed.syncRunId) {
        setActiveSyncRunId(parsed.syncRunId);
        break;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!activeSyncRunId) {
      setSyncRun(null);
      syncStatusRef.current = null;
      return;
    }

    let cancelled = false;
    const tick = async () => {
      const run = await HttpService.getSyncRun(activeSyncRunId);
      if (cancelled || !run) return;
      setSyncRun(run);

      if (syncStatusRef.current !== run.status) {
        syncStatusRef.current = run.status;
        if (run.status === 'completed') toast.success('Sync completed');
        if (run.status === 'failed') toast.error('Sync failed');
      }
    };

    tick();
    const handle = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
    };
  }, [activeSyncRunId]);

  const handleStartSync = async (payload: SyncRequestPayload) => {
    setIsStartingSync(true);
    const run = await HttpService.startSync(payload);
    setIsStartingSync(false);

    if (!run?.id) {
      toast.error('Failed to start sync');
      return;
    }
    setActiveSyncRunId(run.id);
    toast.success(`Sync started (run: ${run.id})`);
  };

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

    const nowIso = new Date().toISOString();
    const userMessage: UiMessage = {
      id: `local_user_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: nowIso,
    };
    const assistantId = `local_assistant_${Date.now()}`;
    const assistantMessage: UiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: nowIso,
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
      if (selectedThreadIdRef.current === threadId) {
        await refreshMessages(threadId);
      }
    } catch (e) {
      setError(String(e));
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
    } finally {
      setIsStreaming(false);
    }
  };



  const handleDeleteThread = async () => {
    if (!threadToDelete) return;

    const status = await HttpService.deleteChatThread(threadToDelete.thread_id);

    // Treat 2xx and 404 (Not Found) as success
    if ((status >= 200 && status < 300) || status === 404) {
      setThreads((prev) => prev.filter((t) => t.thread_id !== threadToDelete.thread_id));
      if (selectedThreadId === threadToDelete.thread_id) {
        setSelectedThreadId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } else {
      toast.error(`Failed to delete conversation (Status: ${status})`);
    }
    setThreadToDelete(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6 p-6">
      {/* Left sidebar - Conversations */}
      <div className="w-64 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 flex-none border-b border-border/50">
          <h3 className="text-foreground mb-2">Conversations</h3>
          <button
            onClick={handleNewConversation}
            className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm"
          >
            New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {threads.map((thread, index) => (
            <div
              key={thread.thread_id}
              className={`group w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${thread.thread_id === selectedThreadId || (!selectedThreadId && index === 0)
                ? 'bg-primary/20 border border-primary/30'
                : 'hover:bg-accent'
                }`}
            >
              <button
                className="flex-1 text-left min-w-0 mr-2"
                onClick={() => setSelectedThreadId(thread.thread_id)}
              >
                <p className="text-sm text-foreground mb-1 line-clamp-2">
                  {thread.title}
                </p>
                <p className="text-xs text-muted-foreground">{formatRelative(thread.updated_at)}</p>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setThreadToDelete(thread);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-all"
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
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
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-foreground">
              {selectedThread?.title ?? 'New conversation'}
            </h3>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
              AI Assistant
            </span>
          </div>
        </div>

        {syncRun && syncRun.status !== 'completed' && (
          <div className="border-b border-border/50 px-6 py-3 bg-muted/30">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-foreground">Sync in progress</div>
                <div className="text-xs text-muted-foreground truncate">
                  {syncRun.message || `Run ${syncRun.id} (${syncRun.status})`}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {syncRun.progress_total
                  ? `${Math.min(
                      100,
                      Math.round((syncRun.progress_current / syncRun.progress_total) * 100),
                    )}%`
                  : '…'}
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded bg-border overflow-hidden">
              <div
                className="h-2 bg-primary transition-all"
                style={{
                  width: syncRun.progress_total
                    ? `${Math.min(100, (syncRun.progress_current / syncRun.progress_total) * 100)}%`
                    : '35%',
                }}
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingMessages && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Loading messages...
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2'
                  : 'space-y-4'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div
                    className="bg-muted border border-border rounded-2xl rounded-tl-sm px-3 py-2"
                    title={formatTimestamp(message.createdAt)}
                  >
                    <div className="text-foreground">
                      {(() => {
                        const parsed = parseSyncBlocks(message.content);
                        return (
                          <>
                            <MarkdownText content={parsed.text} />
                            {parsed.syncRequest && (
                              <div className="mt-4 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartSync(parsed.syncRequest!)}
                                  disabled={isStartingSync}
                                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60"
                                >
                                  {isStartingSync ? 'Starting sync…' : 'Sync now'}
                                </button>
                                <div className="text-xs text-muted-foreground">
                                  Runs in background. You can keep chatting.
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {message.isStreaming && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        Generating...
                      </div>
                    )}
                  </div>
                )}

                {message.role === 'user' && (
                  <p className="whitespace-pre-line" title={formatTimestamp(message.createdAt)}>
                    {message.content}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border p-2">

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about teams, sprints, repos, or developers…"
              className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming}
              className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
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

      <DeleteConfirmationModal
        isOpen={!!threadToDelete}
        onClose={() => setThreadToDelete(null)}
        onConfirm={handleDeleteThread}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
}
