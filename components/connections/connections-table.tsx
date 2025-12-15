"use client"

import { Connection } from "@/lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/app/(dashboard)/connections/columns"
import { Skeleton } from "@/components/ui/skeleton"

interface ConnectionsTableProps {
  data: Connection[]
  isLoading?: boolean
}

export function ConnectionsTable({ data, isLoading }: ConnectionsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <div className="p-3 border-b border-border ">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[120px]" /> {/* Headers mimic */}
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-[120px]" /> {/* Type */}
            <Skeleton className="h-4 w-[200px]" /> {/* Name */}
            <Skeleton className="h-4 w-[150px]" /> {/* Project */}
            <Skeleton className="h-5 w-[80px]" />  {/* Status */}
            <Skeleton className="h-4 w-[120px]" /> {/* Last Sync */}
            <div className="flex gap-5">
              <Skeleton className="h-5 w-5 rounded-md" /> {/* Actions */}
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No connections found."
      />
    </div>
  )
}
