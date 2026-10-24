"use client"

import Link from "next/link"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  FolderKanban,
  Gauge,
  Layers3,
  Minus,
  Target,
  Zap,
} from "lucide-react"

const capabilityCards = [
  {
    number: "01",
    icon: FolderKanban,
    title: "Multi-phase roadmaps",
    description: "Structure engineering goals and interview prep into phases, executable subtasks, category stats, and timestamped notes.",
    size: "lg:col-span-7",
  },
  {
    number: "02",
    icon: Gauge,
    title: "Productivity HUD",
    description: "See focus velocity, system metrics, vector bars, and your day at a glance.",
    size: "lg:col-span-5",
  },
  {
    number: "03",
    icon: Flame,
    title: "Habit & deadline loop",
    description: "Keep streaks alive, spot upcoming dates, and move prioritized tasks forward.",
    size: "lg:col-span-5",
  },
  {
    number: "04",
    icon: FileText,
    title: "Notes that stay with the work",
    description: "Capture decisions and progress in context, right where execution happens.",
    size: "lg:col-span-7",
  },
]

const modules = [
  {
    number: "01",
    title: "Roadmaps Engine",
    subtitle: "Multi-phase goal & sprint execution",
    description: "Structure complex objectives into categorized phases, executable tasks, and live note logs.",
    detail: "Break down multi-week goals like interview prep or software MVPs into structured phases. Add timestamped notes while you work, without losing context.",
    cta: "Explore roadmaps",
    href: "/workspace/projects",
    icon: FolderKanban,
    mockTitle: "SDE Technical Interview Prep",
    rows: ["Arrays & Hashing · completed", "Sliding Window · completed", "Trees & BST · in progress"],
  },
  {
    number: "02",
    title: "Habit Loop",
    subtitle: "Daily streak & habit management",
    description: "Build consistency with daily habit trackers, category tags, and streak counters.",
    detail: "Track best streaks, use instant completion toggles, and keep prioritized todos close to the daily routines that support them.",
    cta: "Manage habits",
    href: "/workspace/habits",
    icon: Zap,
    mockTitle: "Daily Focus Routine",
    rows: ["LeetCode challenge · 14 day streak", "System design review · 8 day streak", "Code refactoring · up next"],
  },
  {
    number: "03",
    title: "Deadline HUD",
    subtitle: "Mini calendar & count badges",
    description: "Keep due dates visible with daily counts, priority cues, and useful context.",
    detail: "Know what is due today and what is coming next. Calendar tooltips hold the details without crowding your main view.",
    cta: "View deadlines",
    href: "/workspace/deadlines",
    icon: CalendarDays,
    mockTitle: "Upcoming Milestones",
    rows: ["OS Virtual Memory Assignment · today", "Prototype Review · tomorrow", "Portfolio launch · next week"],
  },
  {
    number: "04",
    title: "Focus Velocity",
    subtitle: "Vector metrics & focus tracking",
    description: "Make your focus time and daily execution pace easier to understand.",
    detail: "Bring work sessions, habit completion, and task execution together in a clear view of how the day is moving.",
    cta: "View overview",
    href: "/overview",
    icon: BarChart3,
    mockTitle: "Productivity Score",
    rows: ["Focus time · 4.5 hrs", "Task velocity · 94%", "Habit rate · 100%"],
  },
]

const workflowSteps = [
  { number: "01", title: "Define & structure", text: "Build multi-phase roadmaps with task categories, priorities, and deadlines.", icon: Layers3 },
  { number: "02", title: "Execute & repeat", text: "Run daily habit loops, track tasks, and log notes without context switching.", icon: Target },
  { number: "03", title: "Measure & adjust", text: "Review focus velocity, status gauges, and your activity over time.", icon: BarChart3 },
]

const comparisons = [
  ["Multi-phase roadmaps", "Structured plans with note logs", "Flat notes and spreadsheets"],
  ["Habit & streak logic", "Automatic streak tracking", "Manual calendar cross-offs"],
  ["Developer API", "Typed API and OpenAPI spec", "No connected workflow"],
  ["Focus velocity", "75-bar vector meter", "No focus measurement"],
  ["Instant local feedback", "Sub-1ms UI state response", "Page loads and cloud waits"],
]

const faqs = [
  ["Is Weavit fully client-side and fast?", "Weavit uses an instant client-side state engine for responsive UI updates without waiting on cloud loading states."],
  ["Can I customize roadmaps for interview prep or projects?", "Yes. Create custom roadmaps with phases, categories, executable tasks, priorities, and detailed note logs."],
  ["How is the Productivity Score calculated?", "The score brings together focus velocity, habit streak completion, and task execution in a single view."],
  ["Does Weavit support dark and light themes?", "Yes. The workspace supports both dark and light themes."],
]

export default function MonochromeLandingPage() {
  return (
    <main id="top" className="overflow-hidden bg-[#f2f2f0] text-[#171717] selection:bg-[#171717] selection:text-white">
      <header className="relative z-20 mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/landingpage/mono" className="flex items-center gap-2.5" aria-label="Weavit monochrome home">
          <img src="/logo-weavit.png" alt="" className="h-9 w-auto rounded-md grayscale" />
          <span className="text-lg font-bold tracking-tight">weavit<span className="text-black/35">.</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-medium text-black/55 md:flex" aria-label="Main navigation">
          <Link href="#capabilities" className="hover:text-black">Capabilities</Link>
          <Link href="#modules" className="hover:text-black">Modules</Link>
          <Link href="#workflow" className="hover:text-black">Workflow</Link>
          <Link href="#questions" className="hover:text-black">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/landingpage" className="hidden text-xs font-semibold text-black/55 hover:text-black sm:inline-flex">Asymm</Link>
          <Link href="/landingpage/blue" className="hidden text-xs font-semibold text-black/55 hover:text-black sm:inline-flex">Blue edition</Link>
          <Link href="/workspace" className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03] sm:px-5">Open workspace <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100svh-76px)] max-w-[1600px] items-center gap-12 px-5 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-16 lg:pb-28">
        <div className="relative z-10 pb-4 lg:pb-12">
          <p className="mb-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 sm:text-xs"><span className="h-px w-8 bg-black/50" />The high-density workspace for execution</p>
          <h1 className="max-w-[920px] text-[clamp(4rem,11.3vw,10.5rem)] font-black leading-[0.79] tracking-[-0.09em]">Structure<br />the chaos<span className="text-black/25">.</span><br /><span className="ml-[8vw] inline-block font-serif font-normal italic tracking-[-0.075em]">Ship the work.</span></h1>
          <div className="mt-10 grid max-w-[770px] gap-8 sm:grid-cols-[1fr_auto] sm:items-end lg:ml-[8vw]">
            <p className="max-w-md text-sm leading-7 text-black/60 sm:text-base sm:leading-8">Multi-phase roadmaps, daily habit loops, deadlines, and focus velocity—all in one workspace built for developer execution.</p>
            <Link href="/dashboard" className="group inline-flex w-fit items-center gap-3 border-b border-black/25 pb-2 text-sm font-bold transition-colors hover:border-black">Explore the workspace <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span></Link>
          </div>
          <div className="mt-14 flex items-center gap-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 lg:ml-[8vw]"><span>Roadmaps</span><span className="h-px w-8 bg-black/20" /><span>Habits</span><span className="h-px w-8 bg-black/20" /><span>Focus</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto lg:mr-[-3vw] lg:mt-12">
          <div className="absolute -right-16 top-2 hidden h-[82%] w-[72%] border border-black/10 lg:block" />
          <div className="relative border border-black/10 bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.12)] sm:p-6 lg:-rotate-2">
            <div className="flex items-center justify-between border-b border-black/10 pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-black/40">Today · Tuesday</p><p className="mt-1 text-lg font-bold tracking-tight">Execution overview</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><ArrowUpRight className="h-4 w-4" /></span></div>
            <div className="mt-5 grid grid-cols-3 gap-2"><div className="bg-[#171717] p-3 text-white"><p className="text-[9px] uppercase tracking-wider text-white/45">Focus</p><p className="mt-3 text-2xl font-black">4.5<span className="ml-1 text-xs font-medium text-white/45">hrs</span></p></div><div className="bg-[#e8e8e6] p-3"><p className="text-[9px] uppercase tracking-wider text-black/45">Tasks</p><p className="mt-3 text-2xl font-black">08<span className="ml-1 text-xs font-medium text-black/45">done</span></p></div><div className="bg-[#f2f2f0] p-3"><p className="text-[9px] uppercase tracking-wider text-black/45">Streak</p><p className="mt-3 text-2xl font-black">14<span className="ml-1 text-xs font-medium text-black/45">days</span></p></div></div>
            <div className="mt-5 border border-black/10 p-4"><div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-wider text-black/40">Current roadmap</p><p className="mt-1 text-sm font-bold">Technical interview prep</p></div><span className="text-xs font-mono text-black/45">62%</span></div><div className="h-1.5 bg-black/10"><div className="h-full w-[62%] bg-black" /></div><div className="mt-4 space-y-2.5">{["Arrays & Hashing", "Sliding Window", "Trees & Graphs"].map((row, i) => <div key={row} className="flex items-center gap-2.5 text-xs"><span className={`grid h-4 w-4 place-items-center rounded-full ${i < 2 ? "bg-black text-white" : "border border-black/25 text-transparent"}`}>{i < 2 && <Check className="h-2.5 w-2.5" />}</span><span className={i < 2 ? "text-black/40 line-through" : "font-medium"}>{row}</span><span className="ml-auto text-[9px] uppercase tracking-wider text-black/35">{i < 2 ? "Done" : "Next"}</span></div>)}</div></div>
            <div className="mt-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em] text-black/40"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black" />Your week, in motion</span><span>07:42 PM</span></div>
          </div>
          <div className="relative -mt-1 ml-auto w-[76%] border border-black/10 bg-[#dededb] p-4 sm:p-5 lg:-mr-5 lg:mt-[-24px]">
            <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">Habit streak</p><p className="mt-1 text-sm font-bold">Morning deep work</p></div><Flame className="h-4 w-4" /></div><div className="mt-4 grid grid-cols-14 gap-1">{Array.from({ length: 28 }, (_, i) => <span key={i} className={`aspect-square ${i > 23 ? "bg-black" : i > 16 ? "bg-black/65" : i > 9 ? "bg-black/35" : "bg-black/10"}`} />)}</div><p className="mt-2 text-[9px] text-black/45">12 day streak · keep the rhythm</p>
          </div>
          <span className="absolute -left-8 top-1/2 hidden -rotate-90 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30 lg:block">Plan · focus · repeat</span>
        </div>
      </section>

      <div className="bg-[#171717] text-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-7 gap-y-3 px-5 py-5 text-[9px] font-semibold uppercase tracking-[0.19em] text-white/55 sm:px-10 sm:py-6 sm:text-[10px] lg:px-16"><span className="text-white">Built for developers</span><span>Roadmap engine</span><span>Daily execution</span><span>Timeline &amp; deadlines</span><span>Focus velocity</span></div>
      </div>

      <section id="capabilities" className="relative mx-auto grid max-w-[1600px] gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-16 lg:py-40">
        <div className="lg:sticky lg:top-24 lg:self-start"><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-black/45"><span className="h-px w-8 bg-black/45" />01 / Core capabilities</p><h2 className="max-w-xl text-[clamp(3.5rem,8vw,7.4rem)] font-black leading-[0.83] tracking-[-0.08em]">Engineered<br />to help you<br /><span className="font-serif font-normal italic">finish.</span></h2><p className="mt-7 max-w-sm text-sm leading-7 text-black/55">High-density tools for daily workflow, habit execution, and long-range plans. Connected, so your attention can stay on the work.</p></div>
        <div className="grid gap-3 sm:grid-cols-12">{capabilityCards.map(({ number, icon: Icon, title, description, size }, index) => <article key={number} className={`relative flex min-h-[240px] flex-col justify-between overflow-hidden p-6 sm:p-8 ${size} ${index % 2 === 0 ? "bg-[#171717] text-white" : "bg-[#dededb] text-[#171717]"}`}><div className="flex items-start justify-between"><Icon className="h-5 w-5" /><span className="font-mono text-[10px] opacity-40">{number}</span></div><div className="relative z-10 mt-12 max-w-lg"><h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3><p className="mt-3 max-w-md text-sm leading-6 opacity-60">{description}</p></div><span className="pointer-events-none absolute -bottom-9 right-2 text-[10rem] font-black leading-none tracking-[-0.1em] opacity-[0.035]">{number}</span></article>)}</div>
      </section>

      <section id="modules" className="bg-[#e2e2df] py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end"><div><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-black/45"><span className="h-px w-8 bg-black/45" />02 / Interactive workspace</p><h2 className="max-w-4xl text-[clamp(3.6rem,8vw,7.5rem)] font-black leading-[0.84] tracking-[-0.08em]">Four modules.<br /><span className="text-black/30">One way forward.</span></h2></div><p className="max-w-sm text-sm leading-7 text-black/55 lg:justify-self-end">A connected execution system, from the first outline to the next focused session. Open any module to keep the work moving.</p></div>
          <div className="mt-14 space-y-3 sm:mt-20">
            {modules.map(({ number, title, subtitle, description, detail, cta, href, icon: Icon, mockTitle, rows }, index) => (
              <article key={number} className={`grid overflow-hidden border border-black/10 bg-[#f2f2f0] lg:grid-cols-12 ${index % 2 === 1 ? "lg:ml-[8%]" : "lg:mr-[8%]"}`}>
                <div className={`relative flex flex-col justify-between p-6 sm:p-9 lg:col-span-5 ${index % 2 === 1 ? "lg:order-2" : ""}`}><div className="flex items-center justify-between"><Icon className="h-5 w-5" /><span className="font-mono text-[10px] text-black/35">{number} / 04</span></div><div className="mt-10"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">{subtitle}</p><h3 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.055em] sm:text-4xl">{title}</h3><p className="mt-4 max-w-md text-sm leading-6 text-black/55">{description}</p><p className="mt-3 max-w-md text-xs leading-5 text-black/45">{detail}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:gap-3">{cta}<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
                <div className={`flex items-center bg-[#171717] p-5 text-white sm:p-8 lg:col-span-7 ${index % 2 === 1 ? "lg:order-1" : ""}`}><div className="w-full border border-white/15 bg-white/[0.04] p-4 sm:p-6"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-white" /><span className="text-xs font-semibold">{mockTitle}</span></div><span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Live status</span></div><div className="mt-5 space-y-2">{rows.map((row, rowIndex) => <div key={row} className="flex items-center gap-3 border border-white/10 bg-white/[0.04] px-3 py-3 text-xs"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${rowIndex === 0 ? "bg-white text-black" : "border border-white/25 text-white/40"}`}>{rowIndex === 0 ? <Check className="h-3 w-3" /> : <span className="text-[8px]">0{rowIndex + 1}</span>}</span><span className="flex-1">{row.split(" · ")[0]}</span><span className="text-[9px] uppercase tracking-wider text-white/40">{row.split(" · ")[1]}</span></div>)}</div>{index === 3 && <div className="mt-5 grid grid-cols-12 items-end gap-1">{[18, 30, 25, 48, 37, 62, 50, 72, 58, 84, 76, 100].map((h, i) => <span key={i} className="bg-white" style={{ height: `${h * 0.44}px`, opacity: 0.2 + (i / 12) * 0.7 }} />)}</div>}</div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative overflow-hidden bg-[#171717] py-24 text-white sm:py-32 lg:py-40">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16"><div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end"><div><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-white/45"><span className="h-px w-8 bg-white/45" />03 / Workflow architecture</p><h2 className="max-w-4xl text-[clamp(3.6rem,8.3vw,8rem)] font-black leading-[0.82] tracking-[-0.085em]">From chaos<br />to <span className="font-serif font-normal italic text-white/45">peak flow.</span></h2></div><p className="max-w-sm text-sm leading-7 text-white/55 lg:justify-self-end">A simple execution pipeline that helps you keep attention on what matters, while the system keeps the context close.</p></div>
          <div className="mt-16 grid gap-px bg-white/15 md:grid-cols-3 lg:mt-24">{workflowSteps.map(({ number, title, text, icon: Icon }, index) => <article key={number} className={`flex min-h-[300px] flex-col justify-between p-6 sm:p-9 ${index === 1 ? "bg-[#dededb] text-[#171717] md:translate-y-8" : "bg-[#171717] text-white"}`}><div className="flex items-start justify-between"><Icon className="h-6 w-6" /><span className="font-mono text-xs opacity-35">{number}</span></div><div><h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 opacity-55">{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-16 lg:py-40">
        <div className="lg:sticky lg:top-24 lg:self-start"><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-black/45"><span className="h-px w-8 bg-black/45" />04 / The difference</p><h2 className="text-[clamp(3.5rem,8vw,7.2rem)] font-black leading-[0.82] tracking-[-0.08em]">Less<br />fragmented.<br /><span className="font-serif font-normal italic text-black/35">More done.</span></h2><p className="mt-7 max-w-sm text-sm leading-7 text-black/55">Bring planning, routines, and execution signals into one place instead of stitching together disconnected tools.</p></div>
        <div className="overflow-hidden border border-black/10 bg-white">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-[#171717] px-3 py-5 text-white sm:px-6"><div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">Capability</div><div className="text-center"><span className="text-sm font-bold">Weavit</span><p className="mt-1 text-[9px] text-white/45">Connected workspace</p></div><div className="text-center"><span className="text-sm font-bold text-white/60">Manual</span><p className="mt-1 text-[9px] text-white/35">Apps &amp; sheets</p></div></div>
          {comparisons.map(([title, weavit, manual], index) => <div key={title} className={`grid min-h-[86px] grid-cols-[1.1fr_1fr_1fr] items-stretch border-b border-black/10 px-3 last:border-0 sm:px-6 ${index % 2 ? "bg-[#f2f2f0]" : "bg-white"}`}><div className="flex items-center gap-2 py-4 text-[10px] font-bold sm:gap-3 sm:text-xs"><span className="font-mono text-[9px] text-black/30">0{index + 1}</span>{title}</div><div className="flex flex-col items-center justify-center border-x border-black/[0.06] px-1 py-3 text-center"><CheckCircle2 className="mb-1 h-4 w-4" /><span className="text-[9px] leading-4 text-black/65 sm:text-[10px]">{weavit}</span></div><div className="flex flex-col items-center justify-center px-1 py-3 text-center text-black/40"><Minus className="mb-1 h-4 w-4" /><span className="text-[9px] leading-4 sm:text-[10px]">{manual}</span></div></div>)}
          <div className="flex justify-end bg-[#dededb] p-4 sm:p-5"><Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#171717] px-5 py-3 text-xs font-bold text-white">Try Weavit today <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div>
      </section>

      <section className="bg-[#dededb] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-16"><div><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-black/45"><span className="h-px w-8 bg-black/45" />05 / System highlights</p><h2 className="text-[clamp(3.5rem,7.5vw,7rem)] font-black leading-[0.82] tracking-[-0.08em]">Built for<br />the way you<br /><span className="font-serif font-normal italic">actually work.</span></h2><p className="mt-7 max-w-sm text-sm leading-7 text-black/55">A fast, focused foundation for planning and getting things done.</p></div><div className="grid grid-cols-2 gap-px self-end bg-black/15">{[{ value: "100%", label: "Client-side UI state" }, { value: "<1ms", label: "State sync latency" }, { value: "75", label: "Bar focus meter" }, { value: "0", label: "Setup required" }].map((stat, i) => <div key={stat.label} className={`min-h-[150px] p-5 sm:min-h-[210px] sm:p-8 ${i === 1 || i === 2 ? "bg-[#171717] text-white" : "bg-[#f2f2f0] text-[#171717]"}`}><p className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-none tracking-[-0.08em]">{stat.value}</p><p className="mt-4 max-w-[130px] text-[10px] font-semibold uppercase leading-4 tracking-wider opacity-55 sm:text-xs">{stat.label}</p></div>)}</div></div>
      </section>

      <section id="questions" className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-16 lg:py-40"><div><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.19em] text-black/45"><span className="h-px w-8 bg-black/45" />06 / Questions</p><h2 className="text-[clamp(3.5rem,8vw,7.5rem)] font-black leading-[0.82] tracking-[-0.08em]">Good to<br />know<span className="text-black/25">.</span></h2><p className="mt-7 max-w-sm text-sm leading-7 text-black/55">A few useful answers about the workspace and how the system works.</p></div><div className="border-t border-black/20">{faqs.map(([question, answer], i) => <details key={question} className="group border-b border-black/20"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-base font-bold sm:py-8 sm:text-lg"><span className="flex items-start gap-4"><span className="pt-1 font-mono text-[10px] text-black/35">0{i + 1}</span>{question}</span><ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pb-7 pl-9 text-sm leading-7 text-black/55 sm:pb-8">{answer}</p></details>)}</div></section>

      <section className="px-5 pb-16 sm:px-10 sm:pb-24 lg:px-16"><div className="relative mx-auto max-w-[1450px] overflow-hidden bg-[#171717] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20"><div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">07 / Start with what matters</p><h2 className="max-w-4xl text-[clamp(3.5rem,8.5vw,8rem)] font-black leading-[0.8] tracking-[-0.09em]">Stop keeping<br />everything in<br /><span className="font-serif font-normal italic text-white/45">your head.</span></h2><p className="mt-7 max-w-md text-sm leading-7 text-white/55">Give your plans, routines, and focus time a home. Then get on with the work.</p></div><Link href="/workspace" className="group inline-flex w-fit items-center gap-3 border border-white/25 px-6 py-4 text-sm font-bold transition-colors hover:bg-white hover:text-black">Open your workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div><span className="pointer-events-none absolute -bottom-16 right-0 hidden text-[21rem] font-black leading-none tracking-[-0.13em] text-white/[0.035] lg:block">W</span></div></section>

      <footer className="bg-[#dededb]"><div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-7 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16"><Link href="/landingpage/mono" className="flex items-center gap-2 font-bold text-black/80"><img src="/logo-weavit.png" alt="" className="h-6 w-auto grayscale" />weavit.</Link><p>© {new Date().getFullYear()} Weavit Platform · High-density workspace engine</p><div className="flex gap-5"><Link href="/overview" className="hover:text-black">Overview</Link><Link href="/workspace" className="hover:text-black">Workspace</Link><Link href="#top" className="inline-flex items-center gap-1 hover:text-black">Back to top <ArrowDownRight className="h-3 w-3 -rotate-45" /></Link></div></div></footer>
    </main>
  )
}
