"use client"

import React, { useState } from "react"
import { cn } from "cn"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Loader2, ArrowLeft } from "lucide-react"

export interface LoginFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  isSignUp?: boolean
  step?: "email" | "password" | "code"
  email?: string
  setEmail?: (v: string) => void
  password?: string
  setPassword?: (v: string) => void
  code?: string
  setCode?: (v: string) => void
  isLoading?: boolean
  error?: string | null
  onToggleMode?: () => void
  onGoogleSignIn?: () => void
  onAppleSignIn?: () => void
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onBackToEmail?: () => void
}

export function LoginForm({
  className,
  isSignUp: controlledIsSignUp,
  step = "email",
  email: controlledEmail,
  setEmail: setControlledEmail,
  password: controlledPassword,
  setPassword: setControlledPassword,
  code: controlledCode,
  setCode: setControlledCode,
  isLoading = false,
  error = null,
  onToggleMode,
  onGoogleSignIn,
  onAppleSignIn,
  onSubmit,
  onBackToEmail,
  ...props
}: LoginFormProps) {
  // Local state fallbacks if not controlled
  const [internalEmail, setInternalEmail] = useState("")
  const [internalPassword, setInternalPassword] = useState("")
  const [internalCode, setInternalCode] = useState("")
  const [internalIsSignUp, setInternalIsSignUp] = useState(false)

  const email = controlledEmail !== undefined ? controlledEmail : internalEmail
  const setEmail = setControlledEmail || setInternalEmail
  const password = controlledPassword !== undefined ? controlledPassword : internalPassword
  const setPassword = setControlledPassword || setInternalPassword
  const code = controlledCode !== undefined ? controlledCode : internalCode
  const setCode = setControlledCode || setInternalCode
  const isSignUp = controlledIsSignUp !== undefined ? controlledIsSignUp : internalIsSignUp

  const handleToggle = () => {
    if (onToggleMode) {
      onToggleMode()
    } else {
      setInternalIsSignUp((prev) => !prev)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          {/* Header & Logo */}
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium transition-opacity hover:opacity-90"
            >
              <div className="flex items-center justify-center">
                <img
                  src="/logo-weavit.png"
                  alt="Weavit Logo"
                  className="h-11 w-auto object-contain rounded-md"
                />
              </div>
              <span className="sr-only">Weavit</span>
            </a>
            <h1 className="text-xl font-bold tracking-tight">
              {isSignUp ? "Create your Weavit account" : "Welcome to Weavit"}
            </h1>
            <FieldDescription>
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              )}
            </FieldDescription>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive text-center font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === "email" && (
            <>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Continuing...
                    </span>
                  ) : (
                    <span>Continue with Email</span>
                  )}
                </Button>
              </Field>

              <FieldSeparator>Or</FieldSeparator>

              {/* OAuth Buttons */}
              <Field className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onAppleSignIn}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-xs">Apple</span>
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-xs">Google</span>
                </Button>
              </Field>
            </>
          )}

          {/* STEP 2: PASSWORD */}
          {step === "password" && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                <span className="truncate max-w-[200px] font-mono">{email}</span>
                {onBackToEmail && (
                  <button
                    type="button"
                    onClick={onBackToEmail}
                    className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Change
                  </button>
                )}
              </div>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  autoFocus
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  )}
                </Button>
              </Field>
            </>
          )}

          {/* STEP 3: VERIFICATION CODE (OTP) */}
          {step === "code" && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                <span>Code sent to <span className="font-mono text-foreground">{email}</span></span>
                {onBackToEmail && (
                  <button
                    type="button"
                    onClick={onBackToEmail}
                    className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Change
                  </button>
                )}
              </div>

              <Field>
                <FieldLabel htmlFor="code">Verification Code</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  autoFocus
                  className="font-mono text-center tracking-widest text-lg"
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span>Verify Code & Continue</span>
                  )}
                </Button>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-[11px]">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a>{" "}
        and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
