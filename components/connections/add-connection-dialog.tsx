"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { GitBranch, Trello, ArrowRight, Plus, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddConnectionDialog({ className }: { className?: string }) {
  const [step, setStep] = useState<"choice" | "form">("choice")
  const [selected, setSelected] = useState<"repository" | "board" | null>(null)
  const [value, setValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const resetState = () => {
    setStep("choice")
    setSelected(null)
    setValue("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Small delay to reset after closing animation
      setTimeout(resetState, 300)
    }
  }

  const handleChoice = (type: "repository" | "board") => {
    setSelected(type)
    setStep("form")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Adding connection", { type: selected, value })
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
                  <Label htmlFor="connection-url">
                    {selected === "repository" ? "Repository URL" : "Board URL"}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      {selected === "repository" ? <GitBranch size={16} /> : <Trello size={16} />}
                    </div>
                    <Input
                      id="connection-url"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={selected === "repository" ? "https://github.com/org/repo" : "https://trello.com/b/..."}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selected === "repository" 
                      ? "We'll need read access to analyze code metrics." 
                      : "We'll sync tickets and sprint data."}
                  </p>
                </div>

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
                    <Button type="submit" disabled={!value}>
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
