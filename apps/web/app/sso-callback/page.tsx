"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground font-mono">Completing authentication...</p>
        <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />
      </div>
    </div>
  )
}
