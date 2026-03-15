import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthCard({ children, title, description }: AuthCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-none border-border px-10 py-10 max-[440px]:px-6 max-[440px]:py-6',
        'shadow-[0_1px_3px_hsl(var(--foreground)/0.08),0_4px_16px_hsl(var(--foreground)/0.06)]'
      )}
    >
      {/* CI Stripe accent */}
      <div aria-hidden="true" className="absolute left-0 top-0 h-full w-1.5">
        <div className="absolute left-0 top-[15%] h-[70%] w-1.5 bg-primary opacity-30" />
        <div className="absolute left-0 top-[35%] h-[30%] w-1.5 bg-secondary opacity-35" />
        <div className="absolute left-0 top-[40%] h-[20%] w-1.5 bg-primary opacity-60" />
      </div>

      <CardHeader className="p-0 pb-0">
        <CardTitle
          className={cn(
            'font-heading text-2xl font-medium text-foreground leading-tight',
            "[font-variation-settings:'wdth'_112.5]"
          )}
        >
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-[15px] text-muted-foreground leading-normal">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <Separator className="my-6" />
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  )
}
