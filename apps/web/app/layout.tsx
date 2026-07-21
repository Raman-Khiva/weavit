import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

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
        "fixed inset-0 h-screen w-screen overflow-hidden border-white bg-white"
      )}
    >
      <body>
        <ThemeProvider>
          <ClerkProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
