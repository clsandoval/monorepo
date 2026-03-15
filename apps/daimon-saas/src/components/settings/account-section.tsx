'use client'

import * as React from 'react'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function FieldError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  )
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-muted-foreground">
      {children}
    </p>
  )
}

interface PasswordFieldProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete: string
  hasError: boolean
  minLength?: number
}

function PasswordField({
  id,
  name,
  value,
  onChange,
  autoComplete,
  hasError,
  minLength,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative inline-block">
      <Input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        className={cn(
          'w-80 h-10 pr-10',
          hasError && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
        )}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0.5 text-muted-foreground flex items-center hover:text-foreground"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

interface SettingsAccountSectionProps {
  userEmail: string
  userDisplayName: string
}

export function SettingsAccountSection({
  userEmail,
  userDisplayName,
}: SettingsAccountSectionProps) {
  const { toast } = useToast()
  const router = useRouter()

  // Display name state
  const [displayName, setDisplayName] = React.useState(userDisplayName)
  const [displayNameError, setDisplayNameError] = React.useState<string | null>(null)
  const [savingDisplayName, setSavingDisplayName] = React.useState(false)

  // Change password state
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [currentPasswordError, setCurrentPasswordError] = React.useState<string | null>(null)
  const [newPasswordError, setNewPasswordError] = React.useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<string | null>(null)
  const [savingPassword, setSavingPassword] = React.useState(false)

  async function handleSaveDisplayName(e: React.FormEvent) {
    e.preventDefault()
    setDisplayNameError(null)

    if (displayName.length > 100) {
      setDisplayNameError('Display name must be 100 characters or less.')
      return
    }

    setSavingDisplayName(true)
    try {
      const res = await fetch('/api/settings/account/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: displayName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to update display name. Please try again.')
      }
      toast.success('Display name updated.')
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update display name. Please try again.'
      toast.error(message)
    } finally {
      setSavingDisplayName(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setCurrentPasswordError(null)
    setNewPasswordError(null)
    setConfirmPasswordError(null)

    let hasError = false

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required.')
      hasError = true
    }
    if (!newPassword) {
      setNewPasswordError('New password is required.')
      hasError = true
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters.')
      hasError = true
    } else if (newPassword === currentPassword) {
      setNewPasswordError('New password must be different from your current password.')
      hasError = true
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password.')
      hasError = true
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match.')
      hasError = true
    }

    if (hasError) return

    setSavingPassword(true)
    try {
      const res = await fetch('/api/settings/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 401 || data.field === 'current_password') {
          setCurrentPasswordError(data.error ?? 'Current password is incorrect.')
          return
        }
        if (data.field === 'new_password') {
          setNewPasswordError(data.error ?? 'Failed to update password. Please try again.')
          return
        }
        throw new Error(data.error ?? 'Failed to update password. Please try again.')
      }
      toast.success('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update password. Please try again.'
      toast.error(message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b">
        <CardTitle className="font-heading text-lg font-semibold text-foreground">
          Account
        </CardTitle>
        <CardDescription>
          Update your display name and password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Display Name + Email form */}
        <form id="display-name-form" onSubmit={handleSaveDisplayName}>
          <div>
            <Label htmlFor="display-name" className="mb-1.5">Display Name</Label>
            <div className="flex items-center gap-3">
              <Input
                id="display-name"
                name="full_name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  setDisplayNameError(null)
                }}
                maxLength={100}
                placeholder="Your name"
                className={cn(
                  'w-80 h-10',
                  displayNameError && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
                )}
              />
              <Button
                type="submit"
                disabled={savingDisplayName}
                size="lg"
                className="min-w-[80px]"
              >
                {savingDisplayName ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
            {displayNameError ? (
              <FieldError message={displayNameError} />
            ) : (
              <FieldHint>Used in dashboard greetings and team member lists.</FieldHint>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="mt-5">
            <Label>Email</Label>
            <p className="py-2.5 text-sm text-foreground">
              {userEmail}
            </p>
            <FieldHint>
              Email cannot be changed. Contact support to update your email address.
            </FieldHint>
          </div>
        </form>

        <Separator />

        {/* Change Password Form */}
        <form id="change-password-form" onSubmit={handleChangePassword}>
          <h3 className="font-heading text-base font-semibold text-foreground mb-4">
            Change Password
          </h3>

          {/* Current Password */}
          <div className="mb-4">
            <Label htmlFor="current-password" className="mb-1.5">Current Password</Label>
            <PasswordField
              id="current-password"
              name="current_password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setCurrentPasswordError(null)
              }}
              autoComplete="current-password"
              hasError={!!currentPasswordError}
            />
            <FieldError message={currentPasswordError} />
          </div>

          {/* New Password */}
          <div className="mb-4">
            <Label htmlFor="new-password" className="mb-1.5">New Password</Label>
            <PasswordField
              id="new-password"
              name="new_password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setNewPasswordError(null)
              }}
              autoComplete="new-password"
              hasError={!!newPasswordError}
              minLength={8}
            />
            {newPasswordError ? (
              <FieldError message={newPasswordError} />
            ) : (
              <FieldHint>Minimum 8 characters.</FieldHint>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="mb-5">
            <Label htmlFor="confirm-password" className="mb-1.5">Confirm New Password</Label>
            <PasswordField
              id="confirm-password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmPasswordError(null)
              }}
              autoComplete="new-password"
              hasError={!!confirmPasswordError}
            />
            <FieldError message={confirmPasswordError} />
          </div>

          <Button
            type="submit"
            disabled={savingPassword}
            size="lg"
            className="min-w-[160px]"
          >
            {savingPassword ? <Loader2 className="size-4 animate-spin" /> : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
