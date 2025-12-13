"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Connection } from "@/lib/types"
import { GitBranch, Trello, RefreshCw, Settings, CheckCircle, Loader, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "type",
    header: () => <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</div>,
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
    header: () => <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</div>,
    cell: ({ row }) => {
      return <div className="text-sm font-medium text-foreground">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "project",
    header: () => <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Linked Project</div>,
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("project")}</div>
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>,
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
    header: () => <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Sync</div>,
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("lastSync")}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
            <RefreshCw size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
            <Settings size={16} />
          </Button>
        </div>
      )
    },
  },
]
