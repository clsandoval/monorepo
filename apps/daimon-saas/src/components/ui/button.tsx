"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:brightness-[0.93] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary hover:bg-primary/85",
        primary: "bg-primary text-primary-foreground border-primary hover:bg-primary/85",
        outline:
          "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-white",
        secondary:
          "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-white",
        ghost:
          "bg-transparent text-foreground border-transparent hover:bg-foreground/[0.06]",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90",
        danger:
          "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90",
        "danger-secondary":
          "bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-7 text-[15px] gap-2",
        sm: "h-8 px-3 text-[13px] gap-1.5",
        md: "h-11 px-7 text-[15px] gap-2",
        lg: "h-[52px] px-9 text-[17px] gap-2.5",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// LoadingSpinner sub-component
function LoadingSpinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "size">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  const resolvedAriaLabel =
    isLoading && !props["aria-label"] ? "Loading…" : props["aria-label"]

  // Determine spinner size based on button size
  const spinnerSize = size === "sm" ? 14 : size === "lg" ? 20 : 16

  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={isDisabled}
      aria-disabled={isDisabled ? "true" : undefined}
      aria-busy={isLoading ? "true" : undefined}
      aria-label={resolvedAriaLabel}
      className={cn(
        buttonVariants({ variant, size, className }),
        fullWidth && "w-full"
      )}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={spinnerSize} />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {rightIcon && !isLoading ? rightIcon : null}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export default Button
