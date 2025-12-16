"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Connection } from "@/lib/types"
import { GitBranch, Trello, RefreshCw, Sparkles, CheckCircle, Loader, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HttpService } from "@/lib/service"
import { useUser } from "@auth0/nextjs-auth0"
import { useSyncJobsStore } from "@/lib/sync-jobs"

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

function ConnectionStatusCell({ connection }: { connection: Connection }) {
  const job = useSyncJobsStore((s) => s.jobsByConnectionId[connection.id])
  const status = job && (job.status === "queued" || job.status === "running") ? "syncing" : connection.status

  switch (status) {
    case 'active':
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-1/20 text-chart-1 text-xs w-fit">
          <CheckCircle size={12} />
          Active
        </span>
      )
    case 'syncing':
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded bg-chart-4/20 text-chart-4 text-xs w-fit">
          <Loader size={12} className="animate-spin" />
          Syncing
        </span>
      )
    case 'error':
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs w-fit">
          <XCircle size={12} />
          Error
        </span>
      )
    default:
      return null
  }
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
      return <ConnectionStatusCell connection={row.original} />
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
  const job = useSyncJobsStore((s) => s.jobsByConnectionId[connection.id])
  const startConnectionSync = useSyncJobsStore((s) => s.startConnectionSync)
  const [isRunning, setIsRunning] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isSyncing = job ? job.status === "queued" || job.status === "running" : false

  const handleSync = async () => {
    const res = await startConnectionSync(connection)
    if (!res) {
      toast.error("Failed to start sync")
      return
    }
    toast.message("Sync started")
    // The worker will poll in background and refresh on completion.
  }

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

  const handleDelete = async () => {
    const type = connection.type === "Repository" || connection.type === "Board" ? connection.type : null
    if (!type) {
      toast.error("Unsupported connection type")
      setIsDeleteOpen(false)
      return
    }

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
          disabled={isSyncing}
          title={isSyncing ? "Sync in progress" : "Sync connection"}
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground"
          onClick={handleAnalyze}
          disabled={isRunning || connection.type !== "Repository"}
          title={connection.type === "Repository" ? "Run analysis" : "Not supported"}
        >
          <Sparkles size={16} className={isRunning ? "animate-pulse" : ""} />
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

