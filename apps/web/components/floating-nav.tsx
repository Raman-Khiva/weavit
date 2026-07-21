import React from "react"
import { UserButton, Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"

export const FloatingNav = () => {
  return (
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border/40 bg-background/60 px-5 py-2 shadow-md backdrop-blur-md sm:gap-6 sm:px-9 sm:py-3 dark:bg-background/40">
        <div className="mr-2 text-lg font-bold tracking-tighter sm:mr-4">
          <Link href="/">weavit.</Link>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
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
        <div className="ml-2 flex items-center gap-5 sm:ml-4">
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton>
              <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </div>
  )
}
