import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Flame,
  FolderKanban,
  Layers3,
  MoveUpRight,
  Sparkles,
  Zap,
} from "lucide-react"

const features = [
  { icon: FolderKanban, title: "Roadmaps", detail: "Turn big goals into phases you can actually finish.", number: "01" },
  { icon: Flame, title: "Daily habits", detail: "Build repeatable momentum, one day at a time.", number: "02" },
  { icon: CalendarDays, title: "Deadlines", detail: "Keep the important dates in view, always.", number: "03" },
  { icon: Zap, title: "Focus sessions", detail: "Protect deep work and see your pace improve.", number: "04" },
]

const roadmapTasks = [
  { label: "Map the fundamentals", done: true },
  { label: "Build a project in public", done: true },
  { label: "Practice system design", done: false },
]

export default function LandingPage() {
  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#11130f] text-[#f5f4eb] selection:bg-[#2F2FE4] selection:text-white">
      <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/landingpage" className="flex items-center gap-2.5" aria-label="Weavit home">
          <img src="/logo-weavit.png" alt="" className="h-9 w-auto rounded-md" />
          <span className="text-lg font-bold tracking-tight">weavit<span className="text-[#aaaaff]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex" aria-label="Main navigation">
          <Link href="#system" className="transition-colors hover:text-white">The system</Link>
          <Link href="#capabilities" className="transition-colors hover:text-white">Capabilities</Link>
          <Link href="#about" className="transition-colors hover:text-white">Why Weavit</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden px-3 py-2 text-sm text-white/65 transition-colors hover:text-white sm:inline-flex">Log in</Link>
          <Link href="/landingpage/mono" className="hidden px-2 py-2 text-xs font-semibold text-white/55 transition-colors hover:text-white lg:inline-flex">Mono</Link>
          <Link href="/workspace" className="inline-flex items-center gap-2 rounded-full bg-[#2F2FE4] px-4 py-2.5 text-xs font-bold text-[#fff] transition-transform hover:scale-[1.03] sm:px-5 sm:text-sm">
            Open workspace <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-[1440px] items-center gap-12 px-5 pb-16 pt-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-16 lg:pb-24 lg:pt-12">
        <div className="relative z-10 max-w-[760px]">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/60 sm:text-xs">
            <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-[#2F2FE4] opacity-50" /><span className="relative h-2 w-2 rounded-full bg-[#2F2FE4]" /></span>
            A workspace for follow-through
          </div>
          <h1 className="text-[clamp(4.1rem,10.4vw,9.5rem)] font-black leading-[0.83] tracking-[-0.075em]">
            Make room<br />
            <span className="text-[#aaaaff]">for the</span><br />
            work that<br className="sm:hidden" /> matters<span className="text-[#aaaaff]">.</span>
          </h1>
          <div className="mt-9 grid max-w-[670px] gap-7 sm:grid-cols-[1fr_auto] sm:items-end">
            <p className="max-w-[390px] text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Roadmaps, daily habits, deadlines, and focus time—brought together so your plans keep moving after you make them.
            </p>
            <Link href="/workspace" className="group inline-flex w-fit items-center gap-3 border-b border-[#2F2FE4]/50 pb-2 text-sm font-semibold text-[#aaaaff] transition-colors hover:border-[#2F2FE4]">
              Get into the flow <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2F2FE4] text-white transition-transform group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
          <div className="mt-14 flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.17em] text-white/35 sm:mt-20">
            <span className="h-px w-10 bg-[#2F2FE4]/60" /> From intention to done, in one place
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto lg:mr-0 lg:mt-12">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-[#2F2FE4]/10 blur-3xl sm:-right-12 sm:-top-12 sm:h-64 sm:w-64" />
          <div className="relative rotate-[2deg] rounded-[28px] border border-white/10 bg-[#1b1e18] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Your next big thing</p><p className="mt-1 text-lg font-bold">Ship the portfolio</p></div>
              <span className="rounded-full bg-[#2F2FE4]/10 px-3 py-1.5 text-[10px] font-bold text-[#aaaaff]">IN PROGRESS</span>
            </div>
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#2F2FE4] p-4 text-white sm:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black/10"><Layers3 className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-55">Current phase</p><p className="truncate text-base font-extrabold sm:text-lg">Build &amp; share</p></div>
              <MoveUpRight className="h-5 w-5 shrink-0" />
            </div>
            <div className="mt-5 space-y-3">
              {roadmapTasks.map((task) => (
                <div key={task.label} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${task.done ? "border-[#2F2FE4] bg-[#2F2FE4] text-white" : "border-white/20 text-transparent"}`}><Check className="h-3 w-3" /></span>
                  <span className={`flex-1 text-sm ${task.done ? "text-white/40 line-through" : "text-white/85"}`}>{task.label}</span>
                  {task.done && <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">Done</span>}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex -space-x-2"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#1b1e18] bg-[#bd795d] text-[9px] font-bold">R</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#1b1e18] bg-[#6f82a3] text-[9px] font-bold">+</span></div>
              <span className="flex items-center gap-2 text-xs text-white/45"><Clock3 className="h-3.5 w-3.5" /> Next milestone · Friday</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -left-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#252820] px-4 py-3 shadow-xl sm:-left-12 sm:bottom-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2a65a]/15 text-[#f2a65a]"><Flame className="h-5 w-5" /></span>
            <div><p className="text-sm font-bold">Day 12</p><p className="text-[10px] text-white/45">Showing up adds up.</p></div>
          </div>
          <span className="absolute -right-2 top-0 hidden -rotate-90 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/25 sm:block">A little more progress, every day</span>
        </div>
      </section>

      <div className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:px-10 sm:py-6 sm:text-xs lg:px-16">
          <span className="text-[#aaaaff]">One workspace</span><span>Roadmaps</span><CircleDot className="hidden h-3 w-3 text-white/20 sm:block" /><span>Daily habits</span><CircleDot className="hidden h-3 w-3 text-white/20 sm:block" /><span>Deadlines</span><CircleDot className="hidden h-3 w-3 text-white/20 sm:block" /><span>Focus sessions</span>
        </div>
      </div>

      <section id="system" className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-16 lg:py-40">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaaaff]"><span className="h-px w-8 bg-[#2F2FE4]" /> The system</p>
          <h2 className="max-w-xl text-[clamp(3.2rem,7vw,6.3rem)] font-black leading-[0.88] tracking-[-0.065em]">Plans are<br />easy.<br /><span className="text-white/35">Follow-through</span><br />is the work.</h2>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/55 sm:text-base">Weavit connects the steps you take each day to the bigger picture you are working toward.</p>
          <Link href="/workspace/projects" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#aaaaff] hover:gap-3">Explore roadmaps <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="space-y-4 sm:space-y-5">
          <article className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#2F2FE4] p-6 text-white sm:ml-12 sm:p-9">
            <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_0.85fr] sm:items-end">
              <div><span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">01 / Make the path</span><h3 className="mt-8 max-w-sm text-4xl font-black leading-[0.93] tracking-[-0.055em] sm:text-5xl">Big goals,<br />broken down.</h3><p className="mt-4 max-w-xs text-sm leading-6 opacity-70">Build roadmaps from phases, tasks, and the notes you need to keep moving.</p></div>
              <div className="rounded-2xl bg-[#11130f] p-4 text-white sm:rotate-2 sm:p-5"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-white/40">Launch plan</span><BarChart3 className="h-4 w-4 text-[#aaaaff]" /></div><div className="mt-5 flex items-end gap-1.5">{[25, 42, 34, 58, 45, 72, 61, 90, 76, 100, 86, 100].map((height, i) => <span key={i} className={`flex-1 rounded-t-sm ${i < 7 ? "bg-[#2F2FE4]" : "bg-white/15"}`} style={{ height: `${height * 0.58}px` }} />)}</div><div className="mt-3 flex justify-between text-[9px] text-white/35"><span>PHASE 01</span><span>7 OF 12 TASKS</span></div></div>
            </div>
            <span className="pointer-events-none absolute -right-3 -top-10 text-[10rem] font-black leading-none tracking-[-0.1em] text-black/[0.04]">01</span>
          </article>
          <article className="relative grid gap-8 overflow-hidden rounded-[26px] border border-white/10 bg-[#24251f] p-6 sm:mr-12 sm:grid-cols-[0.82fr_1fr] sm:items-center sm:p-9">
            <div className="order-2 sm:order-1"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2a65a]">02 / Keep the rhythm</span><div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">{Array.from({ length: 35 }, (_, i) => <span key={i} className={`aspect-square rounded-[3px] ${i % 7 === 5 || i === 10 ? "bg-white/[0.07]" : i > 25 ? "bg-[#f2a65a]" : i > 18 ? "bg-[#f2a65a]/60" : i > 9 ? "bg-[#f2a65a]/30" : "bg-white/[0.12]"}`} />)}</div><div className="mt-3 flex justify-between text-[9px] uppercase tracking-wider text-white/30"><span>5 weeks</span><span>steady beats perfect</span></div></div>
            <div className="order-1 sm:order-2"><h3 className="text-4xl font-black leading-[0.93] tracking-[-0.055em] sm:text-5xl">Small steps.<br /><span className="text-[#f2a65a]">Real momentum.</span></h3><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">Track habits with streaks and heatmaps that make consistency visible.</p><Link href="/workspace/habits" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">Build a habit <ArrowRight className="h-4 w-4" /></Link></div>
          </article>
          <article className="grid gap-5 rounded-[26px] border border-white/10 bg-[#171915] p-6 sm:ml-24 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#91a9ff]">03 / Stay in the moment</span><h3 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Keep your attention on the next thing.</h3><p className="mt-3 max-w-md text-sm leading-6 text-white/50">Time-block focus, capture draft notes, and keep deadlines close without switching tools.</p></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#91a9ff]"><Clock3 className="h-7 w-7" /></div>
          </article>
        </div>
      </section>

      <section id="capabilities" className="border-y border-white/10 bg-[#171915]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-10 sm:py-28 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 lg:px-16 lg:py-36">
          <div>
            <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaaaff]"><span className="h-px w-8 bg-[#2F2FE4]" /> Made to work together</p>
            <h2 className="text-[clamp(3.3rem,7vw,6.2rem)] font-black leading-[0.86] tracking-[-0.065em]">Less<br />shuffling.<br /><span className="text-white/35">More shipping.</span></h2>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/55">All the pieces of a productive week, connected in one focused workspace.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, detail, number }, index) => (
              <article key={title} className={`group relative min-h-[190px] bg-[#171915] p-6 transition-colors hover:bg-[#20221b] sm:p-8 ${index === 0 ? "sm:translate-y-6" : ""} ${index === 3 ? "sm:-translate-y-6" : ""}`}>
                <div className="flex items-start justify-between"><Icon className="h-5 w-5 text-[#aaaaff]" /><span className="font-mono text-[10px] text-white/25">{number}</span></div>
                <h3 className="mt-9 text-xl font-bold tracking-tight">{title}</h3><p className="mt-2 max-w-[250px] text-sm leading-6 text-white/45">{detail}</p>
                <ChevronRight className="absolute bottom-7 right-7 h-4 w-4 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-[#aaaaff]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-16 lg:py-40">
        <div><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaaaff]"><span className="h-px w-8 bg-[#2F2FE4]" /> Built for the long game</p><h2 className="max-w-3xl text-[clamp(3.5rem,8vw,7.5rem)] font-black leading-[0.84] tracking-[-0.075em]">Your goals<br />deserve more<br />than another<br /><span className="text-[#aaaaff]">to-do list.</span></h2></div>
        <div className="lg:pb-2 lg:pl-12"><div className="mb-8 flex items-center gap-1 text-[#aaaaff]">{Array.from({ length: 5 }, (_, i) => <Sparkles key={i} className="h-4 w-4 fill-current" />)}</div><blockquote className="text-2xl font-medium leading-snug tracking-[-0.03em] text-white/85 sm:text-3xl">“Everything is in one place now—roadmaps, daily habits, deadlines. I actually finish what I start.”</blockquote><div className="mt-7 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#2F2FE4] text-sm font-black text-white">RK</span><div><p className="text-sm font-bold">Raman Khiva</p><p className="mt-0.5 text-xs text-white/40">Full-stack developer</p></div></div></div>
      </section>

      <section className="px-5 pb-20 sm:px-10 sm:pb-28 lg:px-16">
        <div className="relative mx-auto max-w-[1312px] overflow-hidden rounded-[30px] bg-[#2F2FE4] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">Your next chapter starts here</p><h2 className="max-w-3xl text-[clamp(3.3rem,8vw,7rem)] font-black leading-[0.83] tracking-[-0.075em]">Make the plan.<br />Then make it real.</h2><p className="mt-6 max-w-md text-sm leading-6 opacity-65">Open your workspace, gather the moving parts, and get started on what matters.</p></div><Link href="/workspace" className="group inline-flex w-fit items-center gap-4 rounded-full bg-[#11130f] px-6 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.03]">Open your workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>
          <span className="pointer-events-none absolute -bottom-20 right-0 hidden select-none text-[20rem] font-black leading-none tracking-[-0.12em] text-black/[0.045] lg:block">W</span>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-5 border-t border-white/10 px-5 py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <Link href="/landingpage" className="flex items-center gap-2 font-bold text-white/80"><img src="/logo-weavit.png" alt="" className="h-6 w-auto rounded" />weavit.</Link>
        <p>© {new Date().getFullYear()} Weavit Platform · Make room for the work that matters.</p>
        <div className="flex gap-5"><Link href="/overview" className="hover:text-white">Overview</Link><Link href="/workspace" className="hover:text-white">Workspace</Link><Link href="#top" className="inline-flex items-center gap-1 hover:text-white">Back up <ArrowDown className="h-3 w-3 rotate-180" /></Link></div>
      </footer>
    </main>
  )
}
