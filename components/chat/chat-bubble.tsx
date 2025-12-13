import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        message.type === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-3xl",
          message.type === "user"
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-4"
            : "space-y-4"
        )}
      >
        {message.type === "ai" && (
          <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-6 py-4">
            <p className="text-foreground whitespace-pre-line">
              {message.content}
            </p>
          </div>
        )}

        {message.type === "user" && (
          <p className="whitespace-pre-line">{message.content}</p>
        )}

        {/* Chart logic commented out as requested
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
        */}
      </div>
    </div>
  );
}
