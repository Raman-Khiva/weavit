import { UserButton, Show } from "@clerk/nextjs"
import Link from "next/link"

export const FloatingNav = () => {
  return (
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border/40 bg-background/60 px-5 py-2 shadow-md backdrop-blur-md sm:gap-6 sm:px-9 sm:py-3 dark:bg-background/40">
        <div className="mr-2 text-lg font-bold tracking-tighter sm:mr-4">

          <Link href="/" className="flex items-center  transition-opacity hover:opacity-90">
            <img
              src="/logo-weavit.png"
              alt="Weavit Logo"
              className="h-11 w-auto object-contain rounded-md"
            />
            <span className="font-bold">
              weavit.
            </span>
          </Link>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link
            href="/overview"
            className="transition-colors hover:text-foreground font-semibold text-indigo-400"
          >
            Overview
          </Link>
          <Link
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
        </div>
        <div className="ml-2 flex items-center gap-3 sm:ml-4">
          <Show when="signed-out">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/login?mode=sign-up"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2 text-xs sm:text-sm font-semibold text-background shadow-xs transition-all hover:opacity-90 active:scale-[0.98]"
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
