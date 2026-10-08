"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import {
  SDE_INTERVIEW_PREP_TEMPLATE,
  SOFTWARE_MVP_TEMPLATE,
  Project,
} from "@workspace/ui/lib/projects-store"
import { Code2, Rocket, Plus, Layers, Sparkles, Check } from "lucide-react"

interface CreateProjectDialogProps {
  onAddProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void
  trigger?: React.ReactNode
}

export function CreateProjectDialog({ onAddProject, trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<"sde" | "mvp" | "custom">("sde")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("General Plan")

  const handleCreate = () => {
    if (selectedTemplate === "sde") {
      onAddProject(SDE_INTERVIEW_PREP_TEMPLATE)
    } else if (selectedTemplate === "mvp") {
      onAddProject(SOFTWARE_MVP_TEMPLATE)
    } else {
      if (!title.trim()) return
      onAddProject({
        title: title.trim(),
        description: description.trim() || "Custom multi-phase plan and execution roadmap.",
        category: category.trim() || "Custom Plan",
        icon: "Layers",
        startDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        phases: [
          {
            id: `phase-${Date.now()}-1`,
            title: "Phase 1: Getting Started",
            description: "Initial foundational steps and executable tasks.",
            category: category.trim() || "General",
            status: "active",
            tasks: [
              {
                id: `task-${Date.now()}-1`,
                title: "Define core objectives and milestone tasks",
                description: "List key deliverables and completion criteria",
                status: "pending",
                category: category.trim() || "General",
                priority: "high",
                notes: []
              }
            ]
          }
        ]
      })
    }

    setOpen(false)
    setTitle("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2 font-medium">
            <Plus className="size-4" />
            <span>Create New Plan</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />
            <DialogTitle className="text-xl font-bold">Create Roadmap or Plan</DialogTitle>
          </div>
          <DialogDescription>
            Select a structured template or build a custom multi-phase plan for SDE interviews, software projects, or personal goals.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Template
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* SDE Template */}
            <div
              onClick={() => setSelectedTemplate("sde")}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all hover:border-primary/50 ${
                selectedTemplate === "sde"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card"
              }`}
            >
              {selectedTemplate === "sde" && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <Code2 className="mb-2 size-6 text-indigo-500" />
              <div className="font-semibold text-sm">SDE Interview Prep</div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Nested topics for DS & Algo, OS, DBMS, System Design.
              </p>
              <Badge className="mt-2 text-[9px]" variant="secondary">
                Popular
              </Badge>
            </div>

            {/* MVP Template */}
            <div
              onClick={() => setSelectedTemplate("mvp")}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all hover:border-primary/50 ${
                selectedTemplate === "mvp"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card"
              }`}
            >
              {selectedTemplate === "mvp" && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <Rocket className="mb-2 size-6 text-emerald-500" />
              <div className="font-semibold text-sm">Software MVP</div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Architecture setup, frontend components, and backend APIs.
              </p>
              <Badge className="mt-2 text-[9px]" variant="secondary">
                Software
              </Badge>
            </div>

            {/* Custom Template */}
            <div
              onClick={() => setSelectedTemplate("custom")}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all hover:border-primary/50 ${
                selectedTemplate === "custom"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card"
              }`}
            >
              {selectedTemplate === "custom" && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <Layers className="mb-2 size-6 text-amber-500" />
              <div className="font-semibold text-sm">Custom Plan</div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Blank slate to create custom categories & phases.
              </p>
              <Badge className="mt-2 text-[9px]" variant="outline">
                Custom
              </Badge>
            </div>
          </div>

          {selectedTemplate === "custom" && (
            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Plan Title</label>
                <Input
                  placeholder="e.g. AWS Solutions Architect Exam Prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <Input
                  placeholder="e.g. Certification / Learning"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <Textarea
                  placeholder="Short overview of what this roadmap aims to accomplish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 h-20"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={selectedTemplate === "custom" && !title.trim()}>
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
