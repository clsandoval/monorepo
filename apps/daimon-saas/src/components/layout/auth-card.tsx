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
    <Card className={cn('rounded-none shadow-none border-border px-6 py-6 max-[440px]:px-4 max-[440px]:py-4')}>
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
          <CardDescription className="text-sm text-muted-foreground leading-normal">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <Separator className="my-0" />
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  )
}
