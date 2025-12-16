"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useUser } from "@auth0/nextjs-auth0"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { GitBranch, Trello, ArrowRight, Plus, ArrowLeft } from "lucide-react"
import { HttpService } from "@/lib/service"
import { useProjectStore } from "@/lib/store"

export function AddConnectionDialog({
  className,
  onConnectionCreated,
}: {
  className?: string
  onConnectionCreated?: () => void
}) {
  const [step, setStep] = useState<"choice" | "form">("choice")
  const [selected, setSelected] = useState<"repository" | "board" | null>(null)
  const [projectName, setProjectName] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const [linearApiKey, setLinearApiKey] = useState("")
  const [linearTeamKey, setLinearTeamKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { currentProject, setProjects, setCurrentProject } = useProjectStore()
  const { user } = useUser()

  const resetState = () => {
    setStep("choice")
    setSelected(null)
    setProjectName("")
    setRepoUrl("")
    setGithubToken("")
    setLinearApiKey("")
    setLinearTeamKey("")
    setIsSaving(false)
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Small delay to reset after closing animation
      setTimeout(resetState, 300)
    } else {
      setProjectName(currentProject?.name ?? "")
    }
  }

  const handleChoice = (type: "repository" | "board") => {
    setSelected(type)
    setStep("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)
    const resolvedProjectName = projectName.trim()
    if (!resolvedProjectName) {
      setError("Project name is required.")
      return
    }

    if (selected === "repository") {
      if (!repoUrl.trim()) {
        setError("Repository URL is required.")
        return
      }
    }

    if (selected === "board") {
      if (!repoUrl.trim()) {
        setError("Linear URL is required.")
        return
      }
      if (!linearApiKey.trim()) {
        setError("Linear API key is required.")
        return
      }
      if (!linearTeamKey.trim()) {
        setError("Linear team key is required (e.g., TRI).")
        return
      }
    }

    setIsSaving(true)
    const created = await HttpService.createConnection({
      type: selected === "repository" ? "repository" : "linear",
      project_name: resolvedProjectName,
      repo_url: repoUrl.trim(),
      github_token: selected === "repository" && githubToken.trim() ? githubToken.trim() : undefined,
      linear_api_key: selected === "board" ? linearApiKey.trim() : undefined,
      linear_team_key: selected === "board" ? linearTeamKey.trim() : undefined,
      user_id: user?.sub,
    })
    setIsSaving(false)

    if (!created) {
      setError("Failed to create connection. Check backend logs for details.")
      return
    }

    const projects = await HttpService.getProjects()
    setProjects(projects)
    const matched = projects.find((p) => p.name === resolvedProjectName)
    if (matched) setCurrentProject(matched)

    onConnectionCreated?.()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Plus size={16} />
          Add Connection
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === "choice" ? "Add New Connection" : `Connect ${selected === "repository" ? "Repository" : "Board"}`}
          </DialogTitle>
          <DialogDescription>
            {step === "choice" 
              ? "Select the type of service you want to integrate with Sirius Compass." 
              : "Enter the details below to establish the connection."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 min-h-[200px]">
          <AnimatePresence mode="wait">
            {step === "choice" ? (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <IntegrationCard
                  icon={GitBranch}
                  title="Repository"
                  description="GitHub, GitLab, Bitbucket"
                  onClick={() => handleChoice("repository")}
                />
                <IntegrationCard
                  icon={Trello}
                  title="Task Board"
                  description="Jira, Trello, Linear"
                  onClick={() => handleChoice("board")}
                />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <Label htmlFor="connection-project">Project Name</Label>
                  <Input
                    id="connection-project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Tricker"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="connection-url">
                    {selected === "repository" ? "Repository URL" : "Linear URL"}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      {selected === "repository" ? <GitBranch size={16} /> : <Trello size={16} />}
                    </div>
                    <Input
                      id="connection-url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder={selected === "repository" ? "https://github.com/org/repo" : "https://linear.app/..."}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selected === "repository" 
                      ? "We'll need read access to analyze code metrics." 
                      : "We'll sync tickets and sprint data from Linear."}
                  </p>
                </div>

                {selected === "repository" && (
                  <div className="space-y-3">
                    <Label htmlFor="github-token">GitHub Token (optional)</Label>
                    <Input
                      id="github-token"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_..."
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Stored encrypted in the backend. If omitted, the backend will use its server configuration.
                    </p>
                  </div>
                )}

                {selected === "board" && (
                  <>
                    <div className="space-y-3">
                      <Label htmlFor="linear-api-key">Linear API Key</Label>
                      <Input
                        id="linear-api-key"
                        value={linearApiKey}
                        onChange={(e) => setLinearApiKey(e.target.value)}
                        placeholder="lin_api_..."
                        type="password"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="linear-team-key">Linear Team Key</Label>
                      <Input
                        id="linear-team-key"
                        value={linearTeamKey}
                        onChange={(e) => setLinearTeamKey(e.target.value)}
                        placeholder="e.g., TRI"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used to scope issues to the correct team for this project.
                      </p>
                    </div>
                  </>
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setStep("choice")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      Connect
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function IntegrationCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string, 
  onClick: () => void 
}) {
  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer border-muted hover:border-primary/50 transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="p-5 flex flex-col gap-3 h-full">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="absolute top-4 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">
          <ArrowRight size={18} />
        </div>
      </div>
    </Card>
  )
}
