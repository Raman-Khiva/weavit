import { GitBranch, Folder, Eye, CheckSquare, Info } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "Viewed Weavit Repo",
    time: "2 hours ago",
    icon: <GitBranch className="size-4 text-muted-foreground" />,
  },
  {
    id: 2,
    title: "Checked 'Dashboard Redesign' project",
    time: "4 hours ago",
    icon: <Folder className="size-4 text-muted-foreground" />,
  },
  {
    id: 3,
    title: "Completed 'Authentication' task",
    time: "Yesterday",
    icon: <CheckSquare className="size-4 text-muted-foreground" />,
  },
  {
    id: 4,
    title: "Viewed 'Design System' document",
    time: "Yesterday",
    icon: <Eye className="size-4 text-muted-foreground" />,
  }
]

export const RecentActivity = () => {
  return (
    <main className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
          <div className="group relative flex items-center justify-center">
            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-popover border border-border px-2.5 py-1 text-[10px] text-popover-foreground shadow-xl whitespace-nowrap">
              Audit log of repository updates, file edits, and workflow events
            </div>
          </div>
        </div>
        <a
          href="/workspace/activity"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </a>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 mt-2">
        <ul className="flex flex-col gap-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex flex-row items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3 transition-colors hover:bg-background/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/6">
                {activity.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{activity.title}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
