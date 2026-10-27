// import { AlertCircle, CheckCircle2, Circle, Flame, Layers } from "lucide-react";
// import { cn } from "@workspace/ui/lib/utils"; // shadcn helper (clsx + tailwind-merge)

// /**
//  * Three stages, each drives: edge bar, background tint, right-side icon.
//  *  - "pending" → due today, not started
//  *  - "overdue" → missed days, needs attention (shows gap)
//  *  - "done"    → completed today
//  */
// const STATUS = {
//     pending: {
//         bar: "bg-sky-400",
//         tint: "from-sky-400/[0.07]",
//         icon: Circle,
//         iconClass: "text-neutral-500 group-hover:text-sky-300",
//         label: "Mark as done",
//     },
//     overdue: {
//         bar: "bg-amber-400",
//         tint: "from-amber-400/[0.09]",
//         icon: AlertCircle,
//         iconClass: "text-amber-400",
//         label: "Overdue, mark as done",
//     },
//     done: {
//         bar: "bg-emerald-400",
//         tint: "from-emerald-400/[0.08]",
//         icon: CheckCircle2,
//         iconClass: "text-emerald-400",
//         label: "Completed, undo",
//     },
// };

// /**
//  * @param {object}   props
//  * @param {string}   props.title      Today's task, e.g. "Solve 2 LeetCode mediums"
//  * @param {string}   props.habit      Habit it belongs to, e.g. "DSA practice"
//  * @param {"pending"|"overdue"|"done"} [props.status="pending"]
//  * @param {string}   [props.logo]     Tool logo URL (LeetCode, GitHub, Notion…)
//  * @param {string}   [props.toolName] Used as alt text for the logo
//  * @param {import("lucide-react").LucideIcon} [props.icon] Fallback when no tool (default: Layers)
//  * @param {number}   [props.streak]   Current streak in days
//  * @param {number}   [props.gapDays]  Days missed, shown when overdue
//  * @param {() => void} [props.onToggle]
//  */
// export default function TaskCard({
//     title,
//     habit,
//     status = "pending",
//     logo,
//     toolName = "",
//     icon: FallbackIcon = Layers,
//     streak,
//     gapDays,
//     onToggle,
//     className,
// }) {
//     const s = STATUS[status];
//     const StatusIcon = s.icon;
//     const done = status === "done";

//     return (
//         <div
//             className={cn(
//                 "group relative flex items-center gap-3.5 overflow-hidden rounded-xl",
//                 "border border-neutral-800 bg-neutral-950 p-3.5 pl-4",
//                 "transition-colors hover:border-neutral-700",
//                 className
//             )}
//         >
//             {/* status tint, fades out to the right */}
//             <div
//                 aria-hidden
//                 className={cn(
//                     "pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent to-60%",
//                     s.tint
//                 )}
//             />
//             {/* status edge bar, like a toast */}
//             <span
//                 aria-hidden
//                 className={cn("absolute inset-y-3 left-0 w-[3px] rounded-r-full", s.bar)}
//             />

//             {/* logo tile */}
//             <div
//                 className={cn(
//                     "relative grid size-11 shrink-0 place-items-center rounded-xl",
//                     "bg-gradient-to-b from-white/[0.09] to-white/[0.02]",
//                     "ring-1 ring-inset ring-white/10",
//                     "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_16px_-6px_rgba(0,0,0,0.8)]",
//                     done && "opacity-60"
//                 )}
//             >
//                 {logo ? (
//                     <img
//                         src={logo}
//                         alt={toolName}
//                         className="size-5 object-contain"
//                         draggable={false}
//                     />
//                 ) : (
//                     <FallbackIcon className="size-5 text-neutral-300" strokeWidth={1.75} />
//                 )}
//             </div>

//             {/* text */}
//             <div className="relative min-w-0 flex-1">
//                 <p
//                     className={cn(
//                         "truncate text-[15px] font-semibold leading-tight text-white",
//                         done && "text-neutral-500 line-through decoration-neutral-600"
//                     )}
//                 >
//                     {title}
//                 </p>
//                 <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
//                     <span className="truncate">{habit}</span>
//                     {status === "overdue" && gapDays > 0 && (
//                         <span className="shrink-0 text-amber-400">
//                             {gapDays}d gap
//                         </span>
//                     )}
//                     {streak > 0 && status !== "overdue" && (
//                         <span className="inline-flex shrink-0 items-center gap-0.5 text-neutral-500">
//                             <Flame className="size-3 text-orange-400" />
//                             {streak}d
//                         </span>
//                     )}
//                 </div>
//             </div>

//             {/* status indicator / toggle */}
//             <button
//                 type="button"
//                 onClick={onToggle}
//                 aria-label={s.label}
//                 className="relative grid size-9 shrink-0 place-items-center rounded-full outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30"
//             >
//                 <StatusIcon className={cn("size-6 transition-colors", s.iconClass)} strokeWidth={1.75} />
//             </button>
//         </div>
//     );
// }

// /* Usage
// <TaskCard
//   title="Solve 2 mediums"
//   habit="DSA practice"
//   logo="/logos/leetcode.svg"
//   toolName="LeetCode"
//   status="overdue"
//   gapDays={3}
// />
// <TaskCard title="Review open PRs" habit="Code review" logo="/logos/github.svg" toolName="GitHub" streak={36} />
// <TaskCard title="Ship one small commit" habit="Build in public" icon={Rocket} status="done" streak={9} />
// <TaskCard title="Ship one small commit" habit="Build in public" icon={Rocket} status="done" streak={9} />
// */


import { AlertCircle, CheckCircle2, Circle, Flame, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils"; // shadcn helper (clsx + tailwind-merge)

type TaskCardStatus = "pending" | "overdue" | "done"

interface TaskCardProps {
    title: string
    habit: string
    status?: TaskCardStatus
    logo?: string
    toolName?: string
    icon?: LucideIcon
    streak?: number
    gapDays?: number
    onToggle?: () => void
    className?: string
}

/**
 * Three stages, each drives the right-side icon.
 *  - "pending" → due today, not started
 *  - "overdue" → missed days, needs attention (shows gap)
 *  - "done"    → completed today
 */
const STATUS = {
    pending: {
        icon: Circle,
        iconClass: "text-neutral-500 group-hover:text-sky-300",
        label: "Mark as done",
    },
    overdue: {
        icon: AlertCircle,
        iconClass: "text-amber-400",
        label: "Overdue, mark as done",
    },
    done: {
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
        label: "Completed, undo",
    },
};

/**
 * @param {object}   props
 * @param {string}   props.title      Today's task, e.g. "Solve 2 LeetCode mediums"
 * @param {string}   props.habit      Habit it belongs to, e.g. "DSA practice"
 * @param {"pending"|"overdue"|"done"} [props.status="pending"]
 * @param {string}   [props.logo]     Tool logo URL (LeetCode, GitHub, Notion…)
 * @param {string}   [props.toolName] Used as alt text for the logo
 * @param {import("lucide-react").LucideIcon} [props.icon] Fallback when no tool (default: Layers)
 * @param {number}   [props.streak]   Current streak in days
 * @param {number}   [props.gapDays]  Days missed, shown when overdue
 * @param {() => void} [props.onToggle]
 */
export default function TaskCard({
    title,
    habit,
    status = "pending",
    logo,
    toolName = "",
    icon: FallbackIcon = Layers,
    streak,
    gapDays,
    onToggle,
    className,
}: TaskCardProps) {
    const s = STATUS[status];
    const StatusIcon = s.icon;
    const done = status === "done";

    return (
        <div
            className={cn(
                "group relative flex items-center gap-2 rounded-sm",
                "border border-white/10 bg-white/[0.035] px-2 py-1.5",
                "transition-colors hover:border-white/20",
                className
            )}
        >
            {/* logo tile */}
            <div
                className={cn(
                    "relative grid size-8 shrink-0 place-items-center rounded-sm",
                    "ring-1 ring-inset ring-white/10",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_16px_-6px_rgba(0,0,0,0.8)]",
                    done && "opacity-60"
                )}
            >
                {logo ? (
                    <img
                        src={logo}
                        alt={toolName}
                        className="size-5 object-contain"
                        draggable={false}
                    />
                ) : (
                    <FallbackIcon className="size-5 text-neutral-300" strokeWidth={1.75} />
                )}
            </div>

            {/* text */}
            <div className="relative min-w-0 flex-1">
                <p
                    className={cn(
                        "truncate text-[15px] font-semibold leading-tight text-white",
                        done && "text-neutral-500 line-through decoration-neutral-600"
                    )}
                >
                    {title}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-400">
                    <span className="truncate">{habit}</span>
                    {status === "overdue" && (gapDays ?? 0) > 0 && (
                        <span className="shrink-0 text-amber-400">
                            {gapDays}d gap
                        </span>
                    )}
                    {(streak ?? 0) > 0 && status !== "overdue" && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 text-neutral-500">
                            <Flame className="size-3.5 text-orange-400" />
                            {streak}d
                        </span>
                    )}
                </div>
            </div>

            {/* status indicator / toggle */}
            <button
                type="button"
                onClick={onToggle}
                aria-label={s.label}
                className="relative grid size-7 shrink-0 place-items-center rounded-full outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30"
            >
                <StatusIcon className={cn("size-5 transition-colors", s.iconClass)} strokeWidth={1.75} />
            </button>
        </div>
    );
}

/* Usage
<TaskCard
  title="Solve 2 mediums"
  habit="DSA practice"
  logo="/logos/leetcode.svg"
  toolName="LeetCode"
  status="overdue"
  gapDays={3}
/>
<TaskCard title="Review open PRs" habit="Code review" logo="/logos/github.svg" toolName="GitHub" streak={36} />
<TaskCard title="Ship one small commit" habit="Build in public" icon={Rocket} status="done" streak={9} />
*/