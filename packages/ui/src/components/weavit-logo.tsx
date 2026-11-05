import { cn } from "@workspace/ui/lib/utils"

type WeavitLogoProps = {
  className?: string
  alt?: string
}

/** Light mode uses the dark mark; dark mode uses the light mark. */
export function WeavitLogo({
  className,
  alt = "Weavit Logo",
}: WeavitLogoProps) {
  return (
    <>
      <img
        src="/logo-weavit-dark.png"
        alt={alt}
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src="/logo-weavit.png"
        alt={alt}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  )
}
