import { UserButton, Show } from "@clerk/nextjs"
import Link from "next/link"
import { WeavitLogo } from "@workspace/ui/components/weavit-logo"

export const FloatingNav = (): JSX.Element => {
  return (
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-2 shadow-md backdrop-blur-md sm:gap-6 sm:px-9 sm:py-3 dark:border-white/10 dark:bg-zinc-950/70">
        <div className="mr-2 text-lg font-bold tracking-tighter text-zinc-950 sm:mr-4 dark:text-white">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <WeavitLogo className="h-11 w-auto rounded-md" />
            <span className="font-bold">weavit.</span>
          </Link>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-500 md:flex dark:text-zinc-400">
          <Link
            href="/dashboard"
            className="font-semibold text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Dashboard
          </Link>
          <Link
            href="/workspace"
            className="transition-colors hover:text-zinc-950 dark:hover:text-white"
          >
            Workspace
          </Link>
          <Link
            href="#features"
            className="transition-colors hover:text-zinc-950 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-zinc-950 dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="transition-colors hover:text-zinc-950 dark:hover:text-white"
          >
            About
          </Link>
        </div>
        <div className="ml-2 flex items-center gap-3 sm:ml-4">
          <Show when="signed-out">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 sm:text-sm dark:text-zinc-400 dark:hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/login?mode=sign-up"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.98] sm:text-sm dark:bg-white dark:text-zinc-950"
            >
              Sign Up
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </div>
  )
}
