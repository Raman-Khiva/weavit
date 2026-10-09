'use client'
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Provider } from "react-redux"
import { store } from "@/services/store"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        "min-h-screen w-full bg-background text-foreground"
      )}
    >
      <body>
        <ThemeProvider>
          <Provider store={store}>
            <ClerkProvider>
              <TooltipProvider>
                {children}
                <FloatingThemeToggle />
              </TooltipProvider>
            </ClerkProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}

