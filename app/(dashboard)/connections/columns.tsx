"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Connection } from "@/lib/types"
import { GitBranch, Trello, RefreshCw, Settings, Sparkles, CheckCircle, Loader, XCircle } from "lucide-react"
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs w-fit cursor-help">
                    <XCircle size={12} />
                    Error
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.last_error || "Unknown error occurred"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

import { Trash2 } from "lucide-react"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { toast } from "sonner"

// ... imports

function ConnectionActions({ connection }: { connection: Connection }) {
  const { user } = useUser()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const isConnectionSyncing = connection.status === "syncing"

  const handleSync = async () => {
    if (isConnectionSyncing) {
      toast.info("Sync already in progress")
      return
    }
    setIsSyncing(true)
    try {
      const run = await HttpService.startSync({
        project_name: connection.project,
        repo_name: connection.type === "Repository" ? connection.name : undefined,
        providers: connection.type === "Repository" ? ["github"] : ["linear"],
        full_history: false,
        max_commits: 300,
        max_prs: 200,
        max_tickets: 200,
      })

      if (run?.id) {
        toast.success(`Sync started (run: ${run.id})`)
        window.dispatchEvent(new Event('connection-updated'))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAnalyze = async () => {
    if (connection.type !== "Repository") return
    if (isConnectionSyncing) {
      toast.info("Sync in progress. Please wait until it finishes to run analysis.")
      return
    }
    setIsAnalyzing(true)
    const ok = await HttpService.analyzeRepository({
      repo_url: `https://github.com/${connection.name}`,
      developer_name: "Team",
      lookback_days: 90,
      project_name: connection.project,
      user_id: user?.sub,
    })
    setIsAnalyzing(false)
    if (ok) {
      toast.success("Analysis started")
    } else {
      toast.error("Failed to start analysis")
    }
  }

  const handleDelete = async () => {
    const type = connection.type === "Repository" ? "Repository" : "Board"
    const success = await HttpService.deleteConnection(connection.id, type)
    if (success) {
      toast.success("Connection deleted")
      // Trigger refresh in parent
      window.dispatchEvent(new Event('connection-updated'))
    } else {
      toast.error("Failed to delete connection")
    }
    setIsDeleteOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleSync}
          disabled={isSyncing || isConnectionSyncing}
          title="Sync data"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleAnalyze}
          disabled={isAnalyzing || connection.type !== "Repository" || isConnectionSyncing}
          title={
            connection.type !== "Repository"
              ? "Not supported"
              : isConnectionSyncing
                ? "Sync in progress"
                : "Run analysis"
          }
        >
          <Sparkles size={16} className={isAnalyzing ? "animate-pulse" : ""} />
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-destructive"
          onClick={() => setIsDeleteOpen(true)}
          title="Delete connection"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Connection"
        description={`Are you sure you want to delete the connection "${connection.name}"? This will stop data synchronization.`}
      />
    </>
  )
}
