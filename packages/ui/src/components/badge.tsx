import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-4 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-1.5 py-0 text-[10px] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5! before:content-[''] before:inline-block before:h-2 before:w-2 before:rounded-full",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background before:bg-primary [a]:hover:bg-foreground/90",
        primary:
          "bg-primary text-primary-foreground before:bg-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "bg-foreground text-background before:bg-secondary [a]:hover:bg-foreground/90",
        destructive:
          "bg-foreground text-background before:bg-destructive [a]:hover:bg-foreground/90",
        outline:
          "bg-transparent border-border text-foreground before:bg-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50 before:bg-foreground",
        link: "text-primary underline-offset-4 hover:underline before:hidden",
        "dark-red": "bg-foreground text-background before:bg-red-700 [a]:hover:bg-foreground/90",
        "light-red": "bg-foreground text-background before:bg-red-400 [a]:hover:bg-foreground/90",
        orange: "bg-foreground text-background before:bg-orange-500 [a]:hover:bg-foreground/90",
        yellow: "bg-foreground text-background before:bg-yellow-400 [a]:hover:bg-foreground/90",
        green: "bg-foreground text-background before:bg-green-500 [a]:hover:bg-foreground/90",
        blue: "bg-foreground text-background before:bg-blue-500 [a]:hover:bg-foreground/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
