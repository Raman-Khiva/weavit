"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth, useClerk, SignIn } from "@clerk/nextjs"
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy"
import { LoginForm } from "@workspace/ui/components/login-form"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()
  const { signIn, isLoaded: isSignInLoaded } = useSignIn()
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp()
  const { setActive } = useClerk()

  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState<"email" | "password" | "code">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useClerkNative, setUseClerkNative] = useState(false)

  // Sync mode with URL search params (e.g. ?mode=sign-up)
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "sign-up" || mode === "signup") {
      setIsSignUp(true)
    } else {
      setIsSignUp(false)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace("/dashboard")
    }
  }, [isAuthLoaded, isSignedIn, router])

  const handleToggleMode = () => {
    setIsSignUp((prev) => !prev)
    setStep("email")
    setError(null)
    setPassword("")
    setCode("")
  }

  const handleBackToEmail = () => {
    setStep("email")
    setError(null)
    setCode("")
    setPassword("")
  }

  // Google OAuth redirect
  const handleGoogleSignIn = async () => {
    if (!isSignInLoaded) return
    setError(null)
    setIsLoading(true)
    try {
      if (isSignUp && isSignUpLoaded) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      } else {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err)
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Google sign in failed")
      setIsLoading(false)
    }
  }

  // Apple OAuth redirect
  const handleAppleSignIn = async () => {
    if (!isSignInLoaded) return
    setError(null)
    setIsLoading(true)
    try {
      if (isSignUp && isSignUpLoaded) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_apple",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      } else {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_apple",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      }
    } catch (err: any) {
      console.error("Apple OAuth error:", err)
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Apple sign in failed")
      setIsLoading(false)
    }
  }

  // Form submission logic (Email -> Password / Code -> Complete)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // ----------------------------------------------------
      // STEP 1: INITIAL EMAIL SUBMISSION
      // ----------------------------------------------------
      if (step === "email") {
        if (!email.trim()) {
          setError("Please enter a valid email address")
          setIsLoading(false)
          return
        }

        if (!isSignUp) {
          if (!isSignInLoaded) return
          const signInAttempt = await signIn.create({
            identifier: email.trim(),
          })

          if (signInAttempt.status === "complete") {
            if (setActive) {
              await setActive({ session: signInAttempt.createdSessionId })
            }
            router.push("/dashboard")
            return
          }

          if (signInAttempt.status === "needs_first_factor") {
            const hasPassword = signInAttempt.supportedFirstFactors?.some(
              (f) => f.strategy === "password"
            )
            const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
              (f) => f.strategy === "email_code"
            ) as any

            if (hasPassword) {
              setStep("password")
            } else if (emailCodeFactor) {
              await signInAttempt.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: emailCodeFactor.emailAddressId,
              })
              setStep("code")
            } else {
              setStep("password")
            }
          } else {
            setError(`Status: ${signInAttempt.status}. Please complete verification.`)
          }
        } else {
          // SIGN UP
          if (!isSignUpLoaded) return
          const signUpAttempt = await signUp.create({
            emailAddress: email.trim(),
          })

          if (signUpAttempt.status === "complete") {
            if (setActive) {
              await setActive({ session: signUpAttempt.createdSessionId })
            }
            router.push("/dashboard")
            return
          }

          await signUpAttempt.prepareEmailAddressVerification({
            strategy: "email_code",
          })
          setStep("code")
        }
      }

      // ----------------------------------------------------
      // STEP 2: PASSWORD ATTEMPT
      // ----------------------------------------------------
      else if (step === "password") {
        if (!password) {
          setError("Please enter your password")
          setIsLoading(false)
          return
        }

        if (!isSignUp) {
          if (!isSignInLoaded) return
          const result = await signIn.attemptFirstFactor({
            strategy: "password",
            password,
          })

          if (result.status === "complete") {
            if (setActive) {
              await setActive({ session: result.createdSessionId })
            }
            router.push("/dashboard")
            return
          } else {
            setError(`Unexpected status: ${result.status}`)
          }
        } else {
          // Sign up with password if needed
          if (!isSignUpLoaded) return
          const result = await signUp.update({ password })
          if (result.status === "complete") {
            if (setActive) {
              await setActive({ session: result.createdSessionId })
            }
            router.push("/dashboard")
            return
          }
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
          setStep("code")
        }
      }

      // ----------------------------------------------------
      // STEP 3: OTP VERIFICATION CODE
      // ----------------------------------------------------
      else if (step === "code") {
        if (!code.trim()) {
          setError("Please enter the verification code")
          setIsLoading(false)
          return
        }

        if (!isSignUp) {
          if (!isSignInLoaded) return
          const result = await signIn.attemptFirstFactor({
            strategy: "email_code",
            code: code.trim(),
          })

          if (result.status === "complete") {
            if (setActive) {
              await setActive({ session: result.createdSessionId })
            }
            router.push("/dashboard")
            return
          } else {
            setError(`Verification status: ${result.status}`)
          }
        } else {
          if (!isSignUpLoaded) return
          const result = await signUp.attemptEmailAddressVerification({
            code: code.trim(),
          })

          if (result.status === "complete") {
            if (setActive) {
              await setActive({ session: result.createdSessionId })
            }
            router.push("/dashboard")
            return
          } else {
            setError(`Verification status: ${result.status}`)
          }
        }
      }
    } catch (err: any) {
      console.error("Clerk auth error:", err)
      const primaryMessage =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "An unexpected error occurred during authentication"
      setError(primaryMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        {useClerkNative ? (
          <div className="flex flex-col items-center gap-4">
            <SignIn routing="hash" />
            <button
              onClick={() => setUseClerkNative(false)}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
            >
              Switch back to customized Weavit login
            </button>
          </div>
        ) : (
          <>
            <LoginForm
              isSignUp={isSignUp}
              step={step}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              code={code}
              setCode={setCode}
              isLoading={isLoading}
              error={error}
              onToggleMode={handleToggleMode}
              onGoogleSignIn={handleGoogleSignIn}
              onAppleSignIn={handleAppleSignIn}
              onSubmit={handleSubmit}
              onBackToEmail={handleBackToEmail}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setUseClerkNative(true)}
                className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors underline cursor-pointer"
              >
                Having trouble? Use standard Clerk sign-in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
