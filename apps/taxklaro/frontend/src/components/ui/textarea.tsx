import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
