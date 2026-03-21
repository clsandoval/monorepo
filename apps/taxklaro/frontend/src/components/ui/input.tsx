import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-50 placeholder:text-zinc-500 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
