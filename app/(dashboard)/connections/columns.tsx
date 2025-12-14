"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Connection } from "@/lib/types"
import { GitBranch, Trello, RefreshCw, Settings, CheckCircle, Loader, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HttpService } from "@/lib/service"
import { useUser } from "@auth0/nextjs-auth0"

interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <div className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wider", className)}>
      {children}
    </div>
  )
}

export const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "type",
    header: () => <TableHeader>Type</TableHeader>,
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-foreground text-sm border border-border">
          {type === 'Repository' ? (
            <GitBranch size={14} />
          ) : (
            <Trello size={14} />
          )}
          {type}
        </span>
      )
    },
  },
  {
    accessorKey: "name",
    header: () => <TableHeader>Name</TableHeader>,
    cell: ({ row }) => {
      return <div className="text-sm font-medium text-foreground">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "project",
    header: () => <TableHeader>Linked Project</TableHeader>,
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("project")}</div>
    },
  },
  {
    accessorKey: "status",
    header: () => <TableHeader>Status</TableHeader>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      switch (status) {
        case 'active':
          return (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-1/20 text-chart-1 text-xs w-fit">
              <CheckCircle size={12} />
              Active
            </span>
          );
        case 'syncing':
          return (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-4/20 text-chart-4 text-xs w-fit">
              <Loader size={12} className="animate-spin" />
              Syncing
            </span>
          );
        case 'error':
          return (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs w-fit">
              <XCircle size={12} />
              Error
            </span>
          );
        default:
          return null;
      }
    },
  },
  {
    accessorKey: "lastSync",
    header: () => <TableHeader>Last Sync</TableHeader>,
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("lastSync")}</div>
    },
  },
  {
    id: "actions",
    header: () => <TableHeader className="text-right">Actions</TableHeader>,
    cell: ({ row }) => {
      return <ConnectionActions connection={row.original} />
    },
  },
]

function ConnectionActions({ connection }: { connection: Connection }) {
  const { user } = useUser()
  const [isRunning, setIsRunning] = useState(false)

  const handleAnalyze = async () => {
    if (connection.type !== "Repository") return
    setIsRunning(true)
    await HttpService.analyzeRepository({
      repo_url: `https://github.com/${connection.name}`,
      developer_name: "Team",
      lookback_days: 90,
      project_name: connection.project,
      user_id: user?.sub,
    })
    setIsRunning(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
        onClick={handleAnalyze}
        disabled={isRunning || connection.type !== "Repository"}
        title={connection.type === "Repository" ? "Run analysis" : "Not supported"}
      >
        <RefreshCw size={16} className={isRunning ? "animate-spin" : ""} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
        disabled
        title="Settings (coming soon)"
      >
        <Settings size={16} />
      </Button>
    </div>
  )
}
