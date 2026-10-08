"use client"

import { useState, useEffect, useCallback } from "react"

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped"

export interface TaskLogNote {
  id: string
  timestamp: string
  text: string
  author?: string
}

export interface ExecutableTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  category?: string
  priority?: "low" | "medium" | "high"
  dueDate?: string
  completedAt?: string
  notes: TaskLogNote[]
}

export interface ProjectPhase {
  id: string
  title: string
  description?: string
  category?: string
  status: "pending" | "active" | "completed"
  startDate?: string
  endDate?: string
  tasks: ExecutableTask[]
}

export interface Project {
  id: string
  title: string
  description: string
  category: string
  icon?: string
  startDate?: string
  endDate?: string
  phases: ProjectPhase[]
  createdAt: string
  updatedAt: string
}

export const SDE_INTERVIEW_PREP_TEMPLATE: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  title: "SDE Technical Interview Master Prep",
  description: "Comprehensive multi-category study plan covering DS & Algo, OS, DBMS, System Design, and Behavioral interview topics.",
  category: "Interview Prep",
  icon: "Code2",
  startDate: "Oct 12, 2026",
  endDate: "Oct 24, 2026",
  phases: [
    {
      id: "phase-dsa",
      title: "Data Structures & Algorithms Mastery",
      description: "Core algorithms, problem solving patterns, space/time complexity analysis.",
      category: "DS & Algo",
      status: "active",
      startDate: "Oct 12, 2026",
      endDate: "Oct 15, 2026",
      tasks: [
        {
          id: "task-dsa-1",
          title: "Arrays & Hashing: Two Sum, Group Anagrams, Top K Frequent",
          description: "Master hash map lookups and prefix sums",
          status: "completed",
          category: "DS & Algo",
          priority: "high",
          completedAt: "Oct 12, 2026",
          notes: [
            {
              id: "note-1",
              timestamp: "Oct 12 at 09:15 AM",
              text: "Solved LeetCode 1, 49, and 347. Prefix sum concept reviewed."
            }
          ]
        },
        {
          id: "task-dsa-2",
          title: "Two Pointers & Sliding Window: Trapping Rain Water, Min Window Substring",
          description: "Variable vs fixed size sliding window patterns",
          status: "completed",
          category: "DS & Algo",
          priority: "high",
          completedAt: "Oct 12, 2026",
          notes: [
            {
              id: "note-2",
              timestamp: "Oct 12 at 11:30 AM",
              text: "Sliding window contract shrink logic mastered."
            }
          ]
        },
        {
          id: "task-dsa-3",
          title: "Trees & Binary Search Trees: BFS, DFS, LCA, Level Order",
          description: "Recursion trees, tree traversals, and balance checks",
          status: "in_progress",
          category: "DS & Algo",
          priority: "high",
          notes: [
            {
              id: "note-3",
              timestamp: "Oct 13 at 08:45 AM",
              text: "Practiced Lowest Common Ancestor. Need to review iterative post-order traversal."
            }
          ]
        },
        {
          id: "task-dsa-4",
          title: "Dynamic Programming: 0/1 Knapsack, Coin Change, LIS",
          description: "Top-down memoization vs bottom-up tabulation",
          status: "pending",
          category: "DS & Algo",
          priority: "high",
          notes: []
        },
        {
          id: "task-dsa-5",
          title: "Graphs: Topological Sort, Dijkstra, Union-Find",
          description: "Detecting cycles, shortest paths, connected components",
          status: "pending",
          category: "DS & Algo",
          priority: "medium",
          notes: []
        }
      ]
    },
    {
      id: "phase-cs-core",
      title: "Core Computer Science Fundamentals",
      description: "Operating Systems, Database Management Systems, and Computer Networks.",
      category: "CS Fundamentals",
      status: "active",
      startDate: "Oct 15, 2026",
      endDate: "Oct 18, 2026",
      tasks: [
        {
          id: "task-cs-1",
          title: "Operating Systems: Process vs Thread, Virtual Memory, Deadlocks",
          description: "Synchronization primitives, mutexes, semaphores, paging",
          status: "completed",
          category: "OS",
          priority: "high",
          completedAt: "Oct 13, 2026",
          notes: [
            {
              id: "note-4",
              timestamp: "Oct 13 at 02:00 PM",
              text: "Reviewed 4 Coffman conditions for deadlock prevention."
            }
          ]
        },
        {
          id: "task-cs-2",
          title: "DBMS: ACID Properties, Indexing (B+ Trees), Transactions & Isolation Levels",
          description: "WAL logs, optimistic vs pessimistic locking, normal forms",
          status: "in_progress",
          category: "DBMS",
          priority: "high",
          notes: []
        },
        {
          id: "task-cs-3",
          title: "Networking: TCP/IP 3-Way Handshake, HTTP/1 vs HTTP/2 vs HTTP/3, TLS/SSL",
          description: "Socket programming, DNS lookups, TCP congestion control",
          status: "pending",
          category: "Networks",
          priority: "medium",
          notes: []
        }
      ]
    },
    {
      id: "phase-system-design",
      title: "System Design & Architecture",
      description: "High-level architectural patterns, distributed systems, trade-offs.",
      category: "System Design",
      status: "pending",
      startDate: "Oct 18, 2026",
      endDate: "Oct 21, 2026",
      tasks: [
        {
          id: "task-sd-1",
          title: "Design a URL Shortener (TinyURL) & Rate Limiter",
          description: "Base62 encoding, Redis caching, Token Bucket / Leaky Bucket algorithms",
          status: "pending",
          category: "System Design",
          priority: "high",
          notes: []
        },
        {
          id: "task-sd-2",
          title: "Design a Distributed Messenger (WhatsApp / Slack)",
          description: "WebSockets, Push Notifications, Message Queue (Kafka/RabbitMQ), DB Partitioning",
          status: "pending",
          category: "System Design",
          priority: "high",
          notes: []
        },
        {
          id: "task-sd-3",
          title: "Database Sharding, Consistent Hashing & CAP Theorem",
          description: "Replication strategies, leaderless vs primary-replica, event driven design",
          status: "pending",
          category: "System Design",
          priority: "medium",
          notes: []
        }
      ]
    },
    {
      id: "phase-behavioral",
      title: "Behavioral & Leadership Stories",
      description: "STAR method responses for past engineering experiences and challenges.",
      category: "Behavioral",
      status: "pending",
      startDate: "Oct 21, 2026",
      endDate: "Oct 24, 2026",
      tasks: [
        {
          id: "task-beh-1",
          title: "Prepare STAR Stories for Technical Conflicts & Deadlines",
          description: "Structure 4 stories highlighting ownership, trade-offs, and lessons learned",
          status: "pending",
          category: "Behavioral",
          priority: "medium",
          notes: []
        }
      ]
    }
  ]
}

export const SOFTWARE_MVP_TEMPLATE: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  title: "Next.js Web Application MVP",
  description: "End-to-end development roadmap covering architecture setup, UI components, backend APIs, and deployment.",
  category: "Software Project",
  icon: "Rocket",
  startDate: "Oct 01, 2026",
  endDate: "Nov 15, 2026",
  phases: [
    {
      id: "phase-arch",
      title: "Architecture & Foundation Setup",
      description: "Repository initialization, component library setup, and routing structure.",
      category: "Frontend",
      status: "completed",
      startDate: "Oct 01, 2026",
      endDate: "Oct 05, 2026",
      tasks: [
        {
          id: "mvp-task-1",
          title: "Monorepo Setup with Turborepo & pnpm workspace",
          description: "Configure shared packages and apps/web structure",
          status: "completed",
          category: "Infra",
          priority: "high",
          completedAt: "Oct 02, 2026",
          notes: [
            {
              id: "note-mvp-1",
              timestamp: "Oct 02 at 04:00 PM",
              text: "Configured pnpm workspaces and turborepo build pipelines."
            }
          ]
        },
        {
          id: "mvp-task-2",
          title: "Design System & Tailwind Config",
          description: "Design tokens, color schemes, and dark mode support",
          status: "completed",
          category: "UI",
          priority: "high",
          completedAt: "Oct 04, 2026",
          notes: []
        }
      ]
    },
    {
      id: "phase-feat",
      title: "Feature Development & Integration",
      description: "Building core interactive modules and server integration.",
      category: "Fullstack",
      status: "active",
      startDate: "Oct 05, 2026",
      endDate: "Oct 30, 2026",
      tasks: [
        {
          id: "mvp-task-3",
          title: "Implement Projects Workspace Dashboard",
          description: "Interactive timeline, category badges, and task execution engine",
          status: "in_progress",
          category: "Frontend",
          priority: "high",
          notes: []
        },
        {
          id: "mvp-task-4",
          title: "Authentication & User Permissions Integration",
          description: "Secure auth flow and user profile state management",
          status: "pending",
          category: "Backend",
          priority: "medium",
          notes: []
        }
      ]
    }
  ]
}

export const INITIAL_PROJECTS: Project[] = [
  {
    ...SDE_INTERVIEW_PREP_TEMPLATE,
    id: "sde-prep-master",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    ...SOFTWARE_MVP_TEMPLATE,
    id: "project-alpha",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const STORAGE_KEY = "weavit_projects_v2"

// Helper functions for analytics
export function calculateProjectProgress(project: Project): {
  percentage: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
} {
  let totalTasks = 0
  let completedTasks = 0
  let inProgressTasks = 0
  let pendingTasks = 0

  project.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      totalTasks++
      if (task.status === "completed") completedTasks++
      else if (task.status === "in_progress") inProgressTasks++
      else pendingTasks++
    })
  })

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  return { percentage, totalTasks, completedTasks, inProgressTasks, pendingTasks }
}

export function calculateCategoryStats(project: Project): Array<{
  category: string
  total: number
  completed: number
  percentage: number
}> {
  const map: Record<string, { total: number; completed: number }> = {}

  project.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      const cat = task.category || phase.category || "General"
      if (!map[cat]) map[cat] = { total: 0, completed: 0 }
      map[cat].total++
      if (task.status === "completed") map[cat].completed++
    })
  })

  return Object.entries(map).map(([category, stats]) => ({
    category,
    total: stats.total,
    completed: stats.completed,
    percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }))
}

export function useProjectsStore() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse projects from localStorage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync to localStorage
  const saveProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects))
    } catch (e) {
      console.error("Failed to save projects to localStorage", e)
    }
  }, [])

  // CRUD actions
  const getProject = useCallback(
    (id: string): Project | undefined => {
      return projects.find((p) => p.id === id)
    },
    [projects]
  )

  const addProject = useCallback(
    (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Project => {
      const newId = `project-${Date.now()}`
      const newProject: Project = {
        ...projectData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const updated = [newProject, ...projects]
      saveProjects(updated)
      return newProject
    },
    [projects, saveProjects]
  )

  const updateProject = useCallback(
    (id: string, updater: Partial<Project> | ((prev: Project) => Project)) => {
      const updated = projects.map((p) => {
        if (p.id !== id) return p
        const next = typeof updater === "function" ? updater(p) : { ...p, ...updater }
        return { ...next, updatedAt: new Date().toISOString() }
      })
      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const deleteProject = useCallback(
    (id: string) => {
      const updated = projects.filter((p) => p.id !== id)
      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const toggleTaskStatus = useCallback(
    (projectId: string, phaseId: string, taskId: string, noteText?: string) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p

        const nextPhases = p.phases.map((phase) => {
          if (phase.id !== phaseId) return phase

          const nextTasks = phase.tasks.map((task) => {
            if (task.id !== taskId) return task

            const nextStatus: TaskStatus = task.status === "completed" ? "pending" : "completed"
            const updatedNotes = [...(task.notes || [])]

            if (noteText && noteText.trim().length > 0) {
              updatedNotes.unshift({
                id: `note-${Date.now()}`,
                timestamp: new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }),
                text: noteText.trim()
              })
            }

            return {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
              notes: updatedNotes
            }
          })

          // Calculate phase status
          const allDone = nextTasks.length > 0 && nextTasks.every((t) => t.status === "completed")
          const anyStarted = nextTasks.some((t) => t.status === "completed" || t.status === "in_progress")
          const phaseStatus: "completed" | "active" | "pending" = allDone
            ? "completed"
            : anyStarted
            ? "active"
            : "pending"

          return { ...phase, tasks: nextTasks, status: phaseStatus }
        })

        return { ...p, phases: nextPhases, updatedAt: new Date().toISOString() }
      })

      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const addTaskNote = useCallback(
    (projectId: string, phaseId: string, taskId: string, text: string) => {
      if (!text || text.trim().length === 0) return

      const updated = projects.map((p) => {
        if (p.id !== projectId) return p

        const nextPhases = p.phases.map((phase) => {
          if (phase.id !== phaseId) return phase

          const nextTasks = phase.tasks.map((task) => {
            if (task.id !== taskId) return task

            const newNote: TaskLogNote = {
              id: `note-${Date.now()}`,
              timestamp: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }),
              text: text.trim()
            }

            return {
              ...task,
              notes: [newNote, ...(task.notes || [])]
            }
          })

          return { ...phase, tasks: nextTasks }
        })

        return { ...p, phases: nextPhases, updatedAt: new Date().toISOString() }
      })

      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const addTaskToPhase = useCallback(
    (
      projectId: string,
      phaseId: string,
      taskData: { title: string; description?: string; category?: string; priority?: "low" | "medium" | "high" }
    ) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p

        const nextPhases = p.phases.map((phase) => {
          if (phase.id !== phaseId) return phase

          const newTask: ExecutableTask = {
            id: `task-${Date.now()}`,
            title: taskData.title,
            description: taskData.description,
            category: taskData.category || phase.category || "General",
            priority: taskData.priority || "medium",
            status: "pending",
            notes: []
          }

          return { ...phase, tasks: [...phase.tasks, newTask] }
        })

        return { ...p, phases: nextPhases, updatedAt: new Date().toISOString() }
      })

      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const addPhaseToProject = useCallback(
    (
      projectId: string,
      phaseData: { title: string; description?: string; category?: string }
    ) => {
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p

        const newPhase: ProjectPhase = {
          id: `phase-${Date.now()}`,
          title: phaseData.title,
          description: phaseData.description,
          category: phaseData.category || "General",
          status: "pending",
          tasks: []
        }

        return { ...p, phases: [...p.phases, newPhase], updatedAt: new Date().toISOString() }
      })

      saveProjects(updated)
    },
    [projects, saveProjects]
  )

  const resetToDefault = useCallback(() => {
    saveProjects(INITIAL_PROJECTS)
  }, [saveProjects])

  return {
    projects,
    isLoaded,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    toggleTaskStatus,
    addTaskNote,
    addTaskToPhase,
    addPhaseToProject,
    resetToDefault
  }
}
