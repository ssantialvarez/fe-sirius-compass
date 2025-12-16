"use client"

import { Connection } from "@/lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/app/(dashboard)/connections/columns"

interface ConnectionsTableProps {
  data: Connection[]
}

export function ConnectionsTable({ data }: ConnectionsTableProps) {
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
