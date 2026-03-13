'use client'

import * as React from 'react'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

function Spinner() {
  return (
    <span
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid #0C1F40',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}

function fieldInputBase(hasError: boolean): React.CSSProperties {
  return {
    width: '320px',
    height: '40px',
    padding: '10px 12px',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    color: '#111827',
    background: '#FFFFFF',
    border: hasError ? '1px solid #EF4444' : '1px solid #D1D5DB',
    borderRadius: '0px',
    outline: 'none',
    boxSizing: 'border-box',
  }
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      style={{
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 400,
        fontSize: '12px',
        color: '#EF4444',
        margin: '6px 0 0 0',
      }}
    >
      {message}
    </p>
  )
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 400,
        fontSize: '12px',
        color: '#6B7280',
        margin: '6px 0 0 0',
      }}
    >
      {children}
    </p>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 500,
        fontSize: '14px',
        color: '#374151',
        marginBottom: '6px',
      }}
    >
      {children}
    </label>
  )
}

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete: string
  hasError: boolean
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  minLength?: number
}

function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete,
  hasError,
  onFocus,
  onBlur,
  minLength,
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        style={{ ...fieldInputBase(hasError), paddingRight: '40px' }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#6B7280',
          display: 'flex',
          alignItems: 'center',
        }}
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
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        marginBottom: '24px',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '24px 32px 20px 32px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-archivo), Archivo, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0C1F40',
            marginBottom: '4px',
          }}
        >
          Account
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
          }}
        >
          Update your display name and password.
        </p>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px 32px 32px 32px' }}>
        {/* Display Name + Email form */}
        <form id="display-name-form" onSubmit={handleSaveDisplayName}>
          {/* Display Name */}
          <div>
            <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
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
                style={fieldInputBase(!!displayNameError)}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #0C1F40'
                  e.target.style.boxShadow = '0 0 0 3px rgba(180, 231, 221, 0.4)'
                }}
                onBlur={(e) => {
                  e.target.style.border = displayNameError
                    ? '1px solid #EF4444'
                    : '1px solid #D1D5DB'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="submit"
                disabled={savingDisplayName}
                style={{
                  height: '40px',
                  minWidth: '80px',
                  padding: '0 20px',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#0C1F40',
                  background: '#B4E7DD',
                  border: 'none',
                  borderRadius: '0px',
                  cursor: savingDisplayName ? 'not-allowed' : 'pointer',
                  opacity: savingDisplayName ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {savingDisplayName ? <Spinner /> : 'Save'}
              </button>
            </div>
            {displayNameError ? (
              <FieldError message={displayNameError} />
            ) : (
              <FieldHint>Used in dashboard greetings and team member lists.</FieldHint>
            )}
          </div>

          {/* Email (read-only) */}
          <div style={{ marginTop: '20px' }}>
            <FieldLabel>Email</FieldLabel>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: '#374151',
                padding: '10px 0',
                margin: 0,
              }}
            >
              {userEmail}
            </p>
            <FieldHint>
              Email cannot be changed. Contact support to update your email address.
            </FieldHint>
          </div>
        </form>

        {/* Section divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #E5E7EB',
            margin: '24px 0',
          }}
        />

        {/* Change Password Form */}
        <form id="change-password-form" onSubmit={handleChangePassword}>
          <h3
            style={{
              fontFamily: 'var(--font-archivo), Archivo, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              color: '#0C1F40',
              marginTop: 0,
              marginBottom: '16px',
            }}
          >
            Change Password
          </h3>

          {/* Current Password */}
          <div style={{ marginBottom: '16px' }}>
            <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
            <PasswordInput
              id="current-password"
              name="current_password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setCurrentPasswordError(null)
              }}
              autoComplete="current-password"
              hasError={!!currentPasswordError}
              onFocus={(e) => {
                e.target.style.border = '1px solid #0C1F40'
                e.target.style.boxShadow = '0 0 0 3px rgba(180, 231, 221, 0.4)'
              }}
              onBlur={(e) => {
                e.target.style.border = currentPasswordError
                  ? '1px solid #EF4444'
                  : '1px solid #D1D5DB'
                e.target.style.boxShadow = 'none'
              }}
            />
            <FieldError message={currentPasswordError} />
          </div>

          {/* New Password */}
          <div style={{ marginBottom: '16px' }}>
            <FieldLabel htmlFor="new-password">New Password</FieldLabel>
            <PasswordInput
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
              onFocus={(e) => {
                e.target.style.border = '1px solid #0C1F40'
                e.target.style.boxShadow = '0 0 0 3px rgba(180, 231, 221, 0.4)'
              }}
              onBlur={(e) => {
                e.target.style.border = newPasswordError
                  ? '1px solid #EF4444'
                  : '1px solid #D1D5DB'
                e.target.style.boxShadow = 'none'
              }}
            />
            {newPasswordError ? (
              <FieldError message={newPasswordError} />
            ) : (
              <FieldHint>Minimum 8 characters.</FieldHint>
            )}
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: '20px' }}>
            <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
            <PasswordInput
              id="confirm-password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmPasswordError(null)
              }}
              autoComplete="new-password"
              hasError={!!confirmPasswordError}
              onFocus={(e) => {
                e.target.style.border = '1px solid #0C1F40'
                e.target.style.boxShadow = '0 0 0 3px rgba(180, 231, 221, 0.4)'
              }}
              onBlur={(e) => {
                e.target.style.border = confirmPasswordError
                  ? '1px solid #EF4444'
                  : '1px solid #D1D5DB'
                e.target.style.boxShadow = 'none'
              }}
            />
            <FieldError message={confirmPasswordError} />
          </div>

          {/* Update Password button */}
          <button
            type="submit"
            disabled={savingPassword}
            style={{
              height: '40px',
              minWidth: '160px',
              padding: '0 20px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#0C1F40',
              background: '#B4E7DD',
              border: 'none',
              borderRadius: '0px',
              cursor: savingPassword ? 'not-allowed' : 'pointer',
              opacity: savingPassword ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {savingPassword ? <Spinner /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
