"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HttpService } from "@/lib/service"
import type { Project } from "@/lib/types"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (project: Project) => void
}

export function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trimmedName = useMemo(() => name.trim(), [name])
  const canSubmit = trimmedName.length > 0 && !isSubmitting

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("")
      setIsSubmitting(false)
    }
    onOpenChange(nextOpen)
  }

  const handleCreate = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    const created = await HttpService.createProject({ name: trimmedName })
    setIsSubmitting(false)

    if (!created) {
      toast.error("Error while creating project")
      return
    }

    toast.success("Project created")
    onOpenChange(false)

    // Let other parts of the app refresh their project lists.
    window.dispatchEvent(new Event("project-updated"))

    onCreated?.(created)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="project-name">Name</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sirius Compass"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate()
            }}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreate()} disabled={!canSubmit}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
