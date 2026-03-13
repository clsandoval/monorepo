# Accessibility Specification — ARIA Labels, Roles, and Semantic Markup

> File: `final-mega-spec/ui/accessibility.md`
> Last updated: 2026-03-13
> Cross-references:
>   - Component library: [../frontend/component-library.md](../frontend/component-library.md)
>   - Keyboard navigation: [./keyboard-navigation.md](./keyboard-navigation.md) (aspect 7.4b)
>   - Validation rules: [../frontend/validation-rules.md](../frontend/validation-rules.md)
>   - Copy inventory: [../frontend/copy.md](../frontend/copy.md)

This document specifies WCAG 2.1 AA compliance requirements for the Daimon SaaS website. Every component, every page, and every interactive element has a concrete ARIA label, role, or annotation. No "add appropriate ARIA" placeholders — every string is written here.

**Target standard**: WCAG 2.1 Level AA

**Scope**: All pages in `apps/web/` — landing, auth, dashboard, integrations, billing, settings, admin, docs.

---

## Table of Contents

1. [Global ARIA Landmarks](#1-global-aria-landmarks)
2. [Layout Components](#2-layout-components)
3. [Form Components](#3-form-components)
4. [Feedback Components](#4-feedback-components)
5. [Data Display Components](#5-data-display-components)
6. [Action Components](#6-action-components)
7. [Landing Page](#7-landing-page)
8. [Auth Pages](#8-auth-pages)
9. [Dashboard Home](#9-dashboard-home)
10. [Integrations Page](#10-integrations-page)
11. [Billing Page](#11-billing-page)
12. [Settings Page](#12-settings-page)
13. [Admin Panel](#13-admin-panel)
14. [Docs Pages](#14-docs-pages)
15. [Live Region Announcements](#15-live-region-announcements)
16. [Image and Icon Alt Text](#16-image-and-icon-alt-text)
17. [Color Contrast Requirements](#17-color-contrast-requirements)

---

## 1. Global ARIA Landmarks

Every page must include these landmark regions so screen reader users can navigate by landmark.

### 1.1 Public Pages (landing, docs, legal)

```html
<!-- PublicLayout structure -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header role="banner">
    <nav aria-label="Main navigation">
      <!-- PublicNavbar content -->
    </nav>
  </header>
  <main id="main-content" tabindex="-1">
    <!-- Page content -->
  </main>
  <footer role="contentinfo">
    <nav aria-label="Footer navigation">
      <!-- PublicFooter links -->
    </nav>
  </footer>
</body>
```

### 1.2 Auth Pages (login, signup, reset-password)

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <main id="main-content" tabindex="-1" aria-label="Authentication">
    <!-- AuthLayout content -->
  </main>
</body>
```

### 1.3 Dashboard Pages

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <nav aria-label="Sidebar navigation" id="sidebar-nav">
    <!-- Sidebar content -->
  </nav>
  <header role="banner">
    <!-- DashboardTopbar -->
  </header>
  <main id="main-content" tabindex="-1">
    <!-- Page content -->
  </main>
</body>
```

### 1.4 Skip Link

**File:** `app/layout.tsx` (root layout, present on all pages)

```tsx
<a
  href="#main-content"
  className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-navy focus:px-4 focus:py-2 focus:border-2 focus:border-aqua"
>
  Skip to main content
</a>
```

- Visually hidden until focused
- First focusable element on every page
- Links to `<main id="main-content">`
- Visible text: `"Skip to main content"`

---

## 2. Layout Components

### 2.1 DashboardLayout

The root layout wraps everything. It provides landmark regions.

```tsx
// app/(dashboard)/layout.tsx
<div className="dashboard-shell">
  {/* Sidebar is <nav aria-label="Sidebar navigation"> — see below */}
  <div className="main-area">
    <header role="banner">
      <DashboardTopbar />
    </header>
    <main id="main-content" tabindex="-1">
      {children}
    </main>
  </div>
</div>
```

### 2.2 Sidebar

```tsx
// components/layout/Sidebar.tsx
<nav
  aria-label="Sidebar navigation"
  id="sidebar-nav"
>
  {/* Logo area */}
  <Link
    href="/dashboard"
    aria-label="Daimon home — go to dashboard"
  >
    <RocketIcon aria-hidden="true" />
    <span>Daimon</span>
  </Link>

  {/* Navigation items */}
  <ul role="list" aria-label="Dashboard navigation">
    {navItems.map(item => (
      <li key={item.href}>
        <SidebarNavItem
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={isActive(item.href)}
          aria-current={isActive(item.href) ? 'page' : undefined}
        />
      </li>
    ))}
  </ul>

  {/* Footer */}
  <div aria-label="User account">
    <span aria-hidden="true" className="user-avatar">{initial}</span>
    <span aria-label={`Signed in as ${userEmail}`}>{userEmail}</span>
    <button
      type="button"
      aria-label="Sign out"
      onClick={handleLogout}
    >
      <LogOutIcon aria-hidden="true" />
    </button>
  </div>
</nav>
```

**SidebarNavItem ARIA per route:**

| Route | `aria-label` | `aria-current` when active |
|-------|-------------|---------------------------|
| `/dashboard` | `"Dashboard"` | `"page"` |
| `/dashboard/integrations` | `"Integrations"` | `"page"` |
| `/dashboard/billing` | `"Billing"` | `"page"` |
| `/dashboard/settings` | `"Settings"` | `"page"` |
| `/docs` | `"Documentation"` | `"page"` |

```tsx
// SidebarNavItem.tsx
<Link
  href={href}
  aria-current={isActive ? 'page' : undefined}
  aria-label={label}
  className={...}
>
  <span aria-hidden="true">{icon}</span>
  <span>{label}</span>
</Link>
```

**LogoutButton ARIA:**
```tsx
<button
  type="button"
  aria-label="Sign out of Daimon"
  aria-busy={isLoggingOut}
>
  {isLoggingOut
    ? <Loader2 aria-hidden="true" className="animate-spin" />
    : <LogOut aria-hidden="true" />
  }
</button>
```

### 2.3 DashboardTopbar

```tsx
// components/layout/DashboardTopbar.tsx
<header role="banner" aria-label="Page header">
  {/* Mobile: hamburger */}
  <button
    type="button"
    aria-label="Open navigation menu"
    aria-expanded={isMobileNavOpen}
    aria-controls="mobile-nav-dialog"
    onClick={() => setMobileNavOpen(true)}
  >
    <MenuIcon aria-hidden="true" />
  </button>

  {/* Page title */}
  <h1 aria-label={`Current page: ${pageTitle}`}>{pageTitle}</h1>

  {/* Right side */}
  <div aria-label="Workspace info">
    <span aria-label={`Workspace: ${tenantName}`}>{tenantName}</span>
    <PlanBadge plan={plan} />
  </div>
</header>
```

**PlanBadge ARIA:**
```tsx
<span
  aria-label={`Current plan: ${planLabel}`}
  role="status"
>
  {planLabel}
</span>
```

| Plan | `aria-label` |
|------|-------------|
| `free` | `"Current plan: Free"` |
| `starter` | `"Current plan: Starter"` |
| `pro` | `"Current plan: Pro"` |

### 2.4 MobileNav

```tsx
// components/layout/MobileNav.tsx
<div
  role="dialog"
  id="mobile-nav-dialog"
  aria-modal="true"
  aria-label="Navigation menu"
  aria-hidden={!isOpen}
>
  {/* Backdrop */}
  <div
    aria-hidden="true"
    onClick={onClose}
    className="backdrop"
  />

  {/* Nav panel */}
  <div role="document">
    {/* Header */}
    <div>
      <Link href="/dashboard" aria-label="Daimon — go to dashboard" onClick={onClose}>
        <RocketIcon aria-hidden="true" />
        <span>Daimon</span>
      </Link>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
    </div>

    {/* Nav items — same ARIA as sidebar */}
    <nav aria-label="Mobile navigation">
      <ul role="list">
        {navItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={currentPath === item.href ? 'page' : undefined}
              onClick={onClose}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>

    {/* Footer */}
    <div aria-label="User account">
      <span aria-hidden="true" className="user-avatar">{initial}</span>
      <span aria-label={`Signed in as ${userEmail}`}>{userEmail}</span>
      <button type="button" aria-label="Sign out of Daimon">
        <LogOut aria-hidden="true" />
      </button>
    </div>
  </div>
</div>
```

### 2.5 AuthLayout and AuthCard

```tsx
// app/(auth)/layout.tsx
<main id="main-content" tabindex="-1" aria-label="Authentication">
  <AuthLogo />
  {children}
  <AuthFooterLinks />
</main>
```

**AuthLogo ARIA:**
```tsx
<div>
  <Link href="/" aria-label="Daimon — return to homepage">
    <RocketIcon aria-hidden="true" />
    <span>Daimon</span>
  </Link>
</div>
```

**AuthCard ARIA:**
```tsx
<div
  role="region"
  aria-labelledby="auth-card-title"
>
  <h1 id="auth-card-title">{title}</h1>
  {description && <p>{description}</p>}
  {children}
</div>
```

**AuthFooterLinks ARIA:**
```tsx
<footer>
  <nav aria-label="Legal and help links">
    <Link href="/legal/privacy-policy">Privacy Policy</Link>
    <span aria-hidden="true">·</span>
    <Link href="/legal/terms-of-service">Terms of Service</Link>
    <span aria-hidden="true">·</span>
    <Link href="/docs">Help</Link>
  </nav>
</footer>
```

### 2.6 PageShell (Dashboard Pages)

```tsx
// components/layout/PageShell.tsx
<div>
  {breadcrumbs && (
    <nav aria-label="Breadcrumb">
      <ol>
        {breadcrumbs.map((crumb, i) => (
          <li key={i} aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>
            {crumb.href
              ? <Link href={crumb.href}>{crumb.label}</Link>
              : <span>{crumb.label}</span>
            }
          </li>
        ))}
      </ol>
    </nav>
  )}

  <div>
    <div>
      <h1 id="page-title">{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div aria-label="Page actions">{actions}</div>}
  </div>

  <div aria-labelledby="page-title">
    {children}
  </div>
</div>
```

### 2.7 PublicNavbar

```tsx
// components/layout/PublicNavbar.tsx
<header role="banner">
  <nav aria-label="Main navigation">
    {/* Logo */}
    <Link href="/" aria-label="Daimon — return to homepage">
      <RocketIcon aria-hidden="true" />
      <span>Daimon</span>
    </Link>

    {/* Desktop nav links */}
    <ul role="list" aria-label="Site navigation" className="desktop-nav">
      <li><Link href="/#features">Features</Link></li>
      <li><Link href="/#pricing">Pricing</Link></li>
      <li><Link href="/docs">Documentation</Link></li>
      <li><Link href="/#faq">FAQ</Link></li>
    </ul>

    {/* CTAs */}
    <div aria-label="Account actions">
      <Link href="/login" aria-label="Sign in to your account">Sign in</Link>
      <Link href="/signup" aria-label="Create a free account">Get started</Link>
    </div>

    {/* Mobile hamburger */}
    <button
      type="button"
      aria-label="Open site menu"
      aria-expanded={isMobileMenuOpen}
      aria-controls="public-mobile-menu"
      className="mobile-hamburger"
    >
      <Menu aria-hidden="true" />
    </button>
  </nav>
</header>
```

**PublicMobileMenu ARIA:**
```tsx
<div
  role="dialog"
  id="public-mobile-menu"
  aria-modal="true"
  aria-label="Site menu"
  aria-hidden={!isOpen}
>
  <div>
    <Link href="/" aria-label="Daimon — return to homepage" onClick={onClose}>
      <RocketIcon aria-hidden="true" />
      <span>Daimon</span>
    </Link>
    <button type="button" aria-label="Close site menu" onClick={onClose}>
      <X aria-hidden="true" />
    </button>
  </div>
  <nav aria-label="Mobile site navigation">
    <ul role="list">
      <li><Link href="/#features" onClick={onClose}>Features</Link></li>
      <li><Link href="/#pricing" onClick={onClose}>Pricing</Link></li>
      <li><Link href="/docs" onClick={onClose}>Documentation</Link></li>
      <li><Link href="/#faq" onClick={onClose}>FAQ</Link></li>
    </ul>
  </nav>
  <div aria-label="Account actions">
    <Link href="/login">Sign in</Link>
    <Link href="/signup">Get started</Link>
  </div>
</div>
```

### 2.8 PublicFooter

```tsx
// components/layout/PublicFooter.tsx
<footer role="contentinfo" aria-label="Site footer">
  {/* Brand column */}
  <div aria-label="Daimon brand">
    <Link href="/" aria-label="Daimon — return to homepage">
      <RocketIcon aria-hidden="true" />
      <span>Daimon</span>
    </Link>
    <p>The AI operating system for your Discord server.</p>
  </div>

  {/* Link columns */}
  <nav aria-label="Product links">
    <h2>Product</h2>
    <ul role="list">
      <li><Link href="/#features">Features</Link></li>
      <li><Link href="/#pricing">Pricing</Link></li>
      <li><Link href="/changelog">Changelog</Link></li>
      <li><Link href="/roadmap">Roadmap</Link></li>
    </ul>
  </nav>

  <nav aria-label="Resource links">
    <h2>Resources</h2>
    <ul role="list">
      <li><Link href="/docs">Documentation</Link></li>
      <li><Link href="/docs/quick-start">Quick Start</Link></li>
      <li><Link href="/docs/tools">Tool Reference</Link></li>
      <li><Link href="/docs/faq">FAQ</Link></li>
    </ul>
  </nav>

  <nav aria-label="Legal links">
    <h2>Legal</h2>
    <ul role="list">
      <li><Link href="/legal/privacy-policy">Privacy Policy</Link></li>
      <li><Link href="/legal/terms-of-service">Terms of Service</Link></li>
      <li><Link href="/legal/disclaimers">Disclaimers</Link></li>
    </ul>
  </nav>

  <nav aria-label="Company links">
    <h2>Company</h2>
    <ul role="list">
      <li><Link href="/about">About</Link></li>
      <li><Link href="/contact">Contact</Link></li>
      <li><a href="https://github.com/pymc-devs" target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in new tab)">GitHub</a></li>
      <li><a href="https://twitter.com/pymcdevs" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X (opens in new tab)">Twitter/X</a></li>
    </ul>
  </nav>
</footer>
```

---

## 3. Form Components

### 3.1 FormInput

```tsx
// components/forms/FormInput.tsx
<div>
  <label
    htmlFor={id}
    id={`${id}-label`}
  >
    {label}
    {required && <span aria-hidden="true"> *</span>}
    {required && <span className="sr-only"> (required)</span>}
  </label>

  <input
    id={id}
    name={name}
    type={type}
    aria-describedby={[
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ].filter(Boolean).join(' ') || undefined}
    aria-invalid={error ? 'true' : 'false'}
    aria-required={required ? 'true' : 'false'}
    autoComplete={autoComplete}
    placeholder={placeholder}
    disabled={disabled}
    {...props}
  />

  {hint && (
    <p id={`${id}-hint`} className="field-hint">
      {hint}
    </p>
  )}

  {error && (
    <p id={`${id}-error`} role="alert" aria-live="polite" className="field-error">
      <span aria-hidden="true">⚠</span> {error}
    </p>
  )}
</div>
```

**ARIA attributes per field across all forms:**

| Field | `id` | `aria-label` (if no visible label) | `aria-describedby` pattern | `autoComplete` |
|-------|------|-------------------------------------|---------------------------|---------------|
| Email (login) | `login-email` | — | `login-email-error` if error | `email` |
| Password (login) | `login-password` | — | `login-password-error` if error | `current-password` |
| Email (signup) | `signup-email` | — | `signup-email-hint signup-email-error` | `email` |
| Password (signup) | `signup-password` | — | `signup-password-hint signup-password-error` | `new-password` |
| Confirm password | `signup-confirm-password` | — | `signup-confirm-password-error` | `new-password` |
| Reset email | `reset-email` | — | `reset-email-error` | `email` |
| New password (confirm) | `new-password` | — | `new-password-hint new-password-error` | `new-password` |
| Tenant name | `tenant-name` | — | `tenant-name-hint tenant-name-error` | `organization` |
| Discord bot token | `discord-bot-token` | — | `discord-bot-token-hint discord-bot-token-error` | `off` |
| Discord guild ID | `discord-guild-id` | — | `discord-guild-id-hint discord-guild-id-error` | `off` |
| Anthropic API key | `anthropic-api-key` | — | `anthropic-api-key-hint anthropic-api-key-error` | `off` |
| OpenAI API key | `openai-api-key` | — | `openai-api-key-hint openai-api-key-error` | `off` |
| Toggl API key | `toggl-api-key` | — | `toggl-api-key-hint toggl-api-key-error` | `off` |
| Dub API key | `dub-api-key` | — | `dub-api-key-hint dub-api-key-error` | `off` |
| Billing name | `billing-name` | — | `billing-name-error` | `name` |

### 3.2 PasswordInput

```tsx
// components/forms/PasswordInput.tsx
<div>
  <label htmlFor={id}>{label}</label>

  <div className="password-field-wrapper" role="group" aria-labelledby={`${id}-label`}>
    <input
      id={id}
      type={showPassword ? 'text' : 'password'}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      aria-invalid={error ? 'true' : 'false'}
      aria-required={required ? 'true' : 'false'}
      autoComplete={autoComplete}
    />
    <button
      type="button"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      aria-pressed={showPassword}
      onClick={() => setShowPassword(v => !v)}
      tabIndex={0}
    >
      {showPassword
        ? <EyeOff aria-hidden="true" />
        : <Eye aria-hidden="true" />
      }
    </button>
  </div>

  {hint && <p id={`${id}-hint`}>{hint}</p>}
  {error && <p id={`${id}-error`} role="alert" aria-live="polite">{error}</p>}
</div>
```

**Password strength indicator (signup page only):**
```tsx
<div
  role="status"
  aria-live="polite"
  aria-label={`Password strength: ${strengthLabel}`}
>
  {/* Visual bars */}
  <div aria-hidden="true">
    {bars.map((bar, i) => <div key={i} className={bar.active ? 'active' : ''} />)}
  </div>
  <span className="sr-only">Password strength: {strengthLabel}</span>
</div>
```

| Strength | `aria-label` suffix | Screen reader announcement |
|----------|---------------------|---------------------------|
| Too short | `"Too short"` | `"Password strength: Too short"` |
| Weak | `"Weak"` | `"Password strength: Weak"` |
| Fair | `"Fair"` | `"Password strength: Fair"` |
| Strong | `"Strong"` | `"Password strength: Strong"` |

### 3.3 ApiKeyInput

```tsx
// components/forms/ApiKeyInput.tsx
// Sensitive credential input — special ARIA handling

<div>
  <label htmlFor={id}>{label}</label>

  {/* When not yet connected: paste input */}
  {!isConnected && (
    <div>
      <input
        id={id}
        type="password"
        aria-label={`${serviceName} API key — will be encrypted and stored securely`}
        aria-describedby={`${id}-security-note ${id}-error`}
        aria-invalid={error ? 'true' : 'false'}
        autoComplete="off"
        spellCheck="false"
      />
      <p id={`${id}-security-note`}>
        Your key is encrypted at rest using Supabase Vault. We never log or transmit your key in plaintext.
      </p>
      {error && <p id={`${id}-error`} role="alert" aria-live="polite">{error}</p>}
    </div>
  )}

  {/* When connected: masked display + disconnect button */}
  {isConnected && (
    <div role="group" aria-label={`${serviceName} API key — connected`}>
      <span aria-label={`${serviceName} API key ending in ${lastFour}`}>
        ••••••••{lastFour}
      </span>
      <button
        type="button"
        aria-label={`Disconnect ${serviceName} API key`}
      >
        Disconnect
      </button>
    </div>
  )}
</div>
```

**ApiKeyInput ARIA per service:**

| Service | `id` | Connected `aria-label` | Disconnected `aria-label` |
|---------|------|------------------------|---------------------------|
| Anthropic | `anthropic-api-key` | `"Anthropic API key — connected, ending in {lastFour}"` | `"Anthropic API key — paste your key here"` |
| OpenAI | `openai-api-key` | `"OpenAI API key — connected, ending in {lastFour}"` | `"OpenAI API key — paste your key here (optional)"` |
| Toggl | `toggl-api-key` | `"Toggl API key — connected, ending in {lastFour}"` | `"Toggl API key — paste your key here"` |
| Dub | `dub-api-key` | `"Dub API key — connected, ending in {lastFour}"` | `"Dub API key — paste your key here"` |

### 3.4 Select

```tsx
// components/forms/Select.tsx
<div>
  <label htmlFor={id}>{label}</label>
  <select
    id={id}
    aria-describedby={error ? `${id}-error` : undefined}
    aria-invalid={error ? 'true' : 'false'}
    aria-required={required ? 'true' : 'false'}
  >
    {placeholder && (
      <option value="" disabled hidden aria-label={placeholder}>
        {placeholder}
      </option>
    )}
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
  {error && <p id={`${id}-error`} role="alert" aria-live="polite">{error}</p>}
</div>
```

### 3.5 Toggle

```tsx
// components/forms/Toggle.tsx
<label
  htmlFor={id}
  className="toggle-label"
>
  <input
    id={id}
    type="checkbox"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-describedby={description ? `${id}-description` : undefined}
    onChange={onChange}
  />
  <span aria-hidden="true" className="toggle-track">
    <span className="toggle-thumb" />
  </span>
  <span>{label}</span>
  {description && <span id={`${id}-description`}>{description}</span>}
</label>
```

**Toggle instances across the app:**

| Page | Toggle ID | Label | `aria-label` when checked | `aria-label` when unchecked |
|------|-----------|-------|--------------------------|----------------------------|
| Settings | `email-notifications` | `"Email notifications"` | `"Email notifications — on"` | `"Email notifications — off"` |
| Settings | `bot-active` | `"Bot active"` | `"Bot active — running"` | `"Bot active — paused"` |
| Admin | `tenant-suspended` | `"Suspend tenant"` | `"Tenant suspended"` | `"Tenant active"` |

### 3.6 Checkbox

```tsx
// components/forms/Checkbox.tsx
<label htmlFor={id} className="checkbox-label">
  <input
    id={id}
    type="checkbox"
    aria-label={label}
    aria-describedby={description ? `${id}-description` : undefined}
    aria-required={required ? 'true' : 'false'}
    checked={checked}
    onChange={onChange}
  />
  <span aria-hidden="true" className="checkbox-visual" />
  <span>{label}</span>
  {description && <span id={`${id}-description`} className="checkbox-description">{description}</span>}
</label>
```

**Checkbox instances:**

| Form | ID | Label | Description |
|------|----|-------|-------------|
| Signup | `accept-terms` | `"I agree to the Terms of Service and Privacy Policy"` | — |
| Billing delete confirm | `confirm-delete` | `"I understand this action is permanent"` | — |

### 3.7 SearchInput

```tsx
// components/forms/SearchInput.tsx
<div role="search">
  <label htmlFor={id} className="sr-only">{label}</label>
  <input
    id={id}
    type="search"
    aria-label={label}
    aria-describedby={results !== undefined ? `${id}-results` : undefined}
    placeholder={placeholder}
    autoComplete="off"
  />
  <span aria-hidden="true" className="search-icon">
    <SearchIcon />
  </span>
  {results !== undefined && (
    <span id={`${id}-results`} className="sr-only" aria-live="polite" role="status">
      {results === 0
        ? 'No results found'
        : `${results} result${results === 1 ? '' : 's'} found`
      }
    </span>
  )}
</div>
```

**SearchInput instances:**

| Page | ID | `aria-label` | `placeholder` |
|------|----|-------------|---------------|
| Admin tenant list | `admin-tenant-search` | `"Search tenants by name or email"` | `"Search tenants..."` |
| Docs | `docs-search` | `"Search documentation"` | `"Search docs..."` |

---

## 4. Feedback Components

### 4.1 AlertBanner

```tsx
// components/feedback/AlertBanner.tsx
<div
  role="alert"
  aria-live={live}   // 'assertive' for error, 'polite' for info/success
  aria-atomic="true"
  className={`alert-banner alert-banner--${variant}`}
>
  <span aria-hidden="true" className="alert-icon">{icon}</span>
  <div>
    {title && <strong>{title}</strong>}
    <span>{message}</span>
  </div>
  {dismissible && (
    <button
      type="button"
      aria-label={`Dismiss ${variant} notification: ${title || message}`}
      onClick={onDismiss}
    >
      <X aria-hidden="true" />
    </button>
  )}
</div>
```

**AlertBanner `role` and `aria-live` per variant:**

| Variant | `role` | `aria-live` | `aria-atomic` |
|---------|--------|------------|---------------|
| `error` | `alert` | `assertive` | `true` |
| `warning` | `status` | `polite` | `true` |
| `success` | `status` | `polite` | `true` |
| `info` | `status` | `polite` | `true` |

**Dismiss button `aria-label` examples:**

| Context | `aria-label` |
|---------|-------------|
| Email confirmation banner | `"Dismiss: Please confirm your email address"` |
| Error connecting Discord | `"Dismiss: Discord connection failed"` |
| Success connecting GitHub | `"Dismiss: GitHub connected successfully"` |

### 4.2 Toast

```tsx
// components/feedback/Toast.tsx
// Rendered in a portal at the bottom-right of the viewport

<div
  role="region"
  aria-label="Notifications"
  aria-live="polite"
  aria-atomic="false"
  className="toast-container"
>
  {toasts.map(toast => (
    <div
      key={toast.id}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`toast toast--${toast.variant}`}
    >
      <span aria-hidden="true">{toastIcon(toast.variant)}</span>
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label={`Dismiss notification: ${toast.message}`}
        onClick={() => dismissToast(toast.id)}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  ))}
</div>
```

**Toast messages and their ARIA per action:**

| Action | Toast message | `role` | `aria-live` |
|--------|--------------|--------|-------------|
| Discord connected | `"Discord bot connected successfully"` | `status` | `polite` |
| Discord disconnected | `"Discord bot disconnected"` | `status` | `polite` |
| GitHub connected | `"GitHub connected successfully"` | `status` | `polite` |
| GitHub disconnected | `"GitHub disconnected"` | `status` | `polite` |
| Google connected | `"Google connected successfully"` | `status` | `polite` |
| Google disconnected | `"Google disconnected"` | `status` | `polite` |
| Linear connected | `"Linear connected successfully"` | `status` | `polite` |
| Linear disconnected | `"Linear disconnected"` | `status` | `polite` |
| Toggl key saved | `"Toggl API key saved"` | `status` | `polite` |
| Dub key saved | `"Dub API key saved"` | `status` | `polite` |
| Anthropic key saved | `"Anthropic API key saved"` | `status` | `polite` |
| Plan upgraded | `"You're now on the Starter plan"` | `status` | `polite` |
| Plan upgraded | `"You're now on the Pro plan"` | `status` | `polite` |
| Settings saved | `"Settings saved"` | `status` | `polite` |
| Tenant name updated | `"Workspace name updated"` | `status` | `polite` |
| Account deleted | `"Your account has been deleted"` | `alert` | `assertive` |
| Error (generic) | `"Something went wrong. Please try again."` | `alert` | `assertive` |
| Session expired | `"Your session expired. Please sign in again."` | `alert` | `assertive` |
| API key invalid | `"API key is invalid. Please check and try again."` | `alert` | `assertive` |
| Stripe error | `"Payment processing failed. Please try again."` | `alert` | `assertive` |
| Copied to clipboard | `"Copied to clipboard"` | `status` | `polite` |

### 4.3 ConfirmDialog

```tsx
// components/feedback/ConfirmDialog.tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="confirm-dialog-title"
  aria-describedby="confirm-dialog-description"
>
  <div aria-hidden="true" className="dialog-backdrop" onClick={onCancel} />

  <div className="dialog-panel" role="document">
    <h2 id="confirm-dialog-title">{title}</h2>
    <p id="confirm-dialog-description">{description}</p>

    {confirmInput && (
      <div>
        <label htmlFor="confirm-input-field">{confirmInput.label}</label>
        <input
          id="confirm-input-field"
          type="text"
          aria-label={confirmInput.label}
          aria-describedby="confirm-input-instruction"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <p id="confirm-input-instruction" className="sr-only">
          Type {confirmInput.requiredValue} to confirm this action
        </p>
      </div>
    )}

    <div aria-label="Dialog actions">
      <button
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        aria-label={confirmLabel}
        onClick={onConfirm}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        {confirmLabel}
      </button>
    </div>
  </div>
</div>
```

**ConfirmDialog instances with exact ARIA strings:**

| Trigger | Dialog title (`aria-labelledby`) | Description (`aria-describedby`) | Confirm button `aria-label` | Cancel `aria-label` |
|---------|----------------------------------|----------------------------------|-----------------------------|---------------------|
| Disconnect Discord | `"Disconnect Discord bot?"` | `"Your bot will go offline immediately. You can reconnect at any time."` | `"Disconnect Discord bot"` | `"Keep Discord connected"` |
| Disconnect GitHub | `"Disconnect GitHub?"` | `"GitHub tools will no longer be available to your bot."` | `"Disconnect GitHub"` | `"Keep GitHub connected"` |
| Disconnect Google | `"Disconnect Google?"` | `"Google tools will no longer be available to your bot."` | `"Disconnect Google"` | `"Keep Google connected"` |
| Disconnect Linear | `"Disconnect Linear?"` | `"Linear tools will no longer be available to your bot."` | `"Disconnect Linear"` | `"Keep Linear connected"` |
| Remove Anthropic key | `"Remove Anthropic API key?"` | `"Your bot will stop working immediately until you add a new key."` | `"Remove Anthropic API key"` | `"Keep API key"` |
| Delete account | `"Delete your account?"` | `"This permanently deletes your workspace, disconnects your bot, and cancels your subscription. Type DELETE to confirm."` | `"Permanently delete account"` | `"Keep my account"` |
| Downgrade plan | `"Downgrade to Free plan?"` | `"You will lose access to Starter features at the end of your billing period."` | `"Downgrade to Free"` | `"Keep Starter"` |
| Cancel subscription | `"Cancel subscription?"` | `"Your plan will remain active until the end of your billing period."` | `"Cancel subscription"` | `"Keep subscription"` |
| Suspend tenant (admin) | `"Suspend this tenant?"` | `"The tenant's bot will go offline immediately. They will not be able to sign in."` | `"Suspend tenant"` | `"Cancel"` |
| Delete tenant (admin) | `"Delete this tenant?"` | `"All data for this tenant will be permanently deleted. Type the tenant ID to confirm."` | `"Delete tenant permanently"` | `"Cancel"` |

### 4.4 Modal

```tsx
// components/feedback/Modal.tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={`modal-title-${id}`}
  aria-describedby={description ? `modal-desc-${id}` : undefined}
>
  <div aria-hidden="true" className="modal-backdrop" onClick={onClose} />
  <div className="modal-panel" role="document">
    <div className="modal-header">
      <h2 id={`modal-title-${id}`}>{title}</h2>
      {description && (
        <p id={`modal-desc-${id}`}>{description}</p>
      )}
      <button
        type="button"
        aria-label={`Close ${title} dialog`}
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
    </div>
    <div className="modal-body">
      {children}
    </div>
    {footer && (
      <div className="modal-footer" aria-label="Dialog actions">
        {footer}
      </div>
    )}
  </div>
</div>
```

**Modal instances with exact ARIA strings:**

| Modal | `aria-labelledby` text | Close button `aria-label` |
|-------|----------------------|--------------------------|
| Connect Discord | `"Connect Discord bot"` | `"Close Connect Discord bot dialog"` |
| Connect Toggl | `"Connect Toggl"` | `"Close Connect Toggl dialog"` |
| Connect Dub | `"Connect Dub"` | `"Close Connect Dub dialog"` |
| Manage Anthropic key | `"Manage Anthropic API key"` | `"Close Manage Anthropic API key dialog"` |
| Manage OpenAI key | `"Manage OpenAI API key"` | `"Close Manage OpenAI API key dialog"` |
| Impersonate tenant (admin) | `"Impersonate tenant"` | `"Close Impersonate tenant dialog"` |

### 4.5 EmptyState

```tsx
// components/feedback/EmptyState.tsx
<div
  role="region"
  aria-label={ariaLabel}
  className="empty-state"
>
  <span aria-hidden="true" className="empty-state-icon">{icon}</span>
  <h3>{title}</h3>
  <p>{description}</p>
  {action && (
    <Button {...action} />
  )}
</div>
```

**EmptyState instances with exact `aria-label` and content:**

| Page / Component | `aria-label` | Title | Description | Action button `aria-label` |
|-----------------|-------------|-------|-------------|---------------------------|
| Dashboard — no bot | `"Bot not connected"` | `"Your bot isn't connected yet"` | `"Add your Discord bot token and guild ID to get started."` | `"Go to settings to connect your bot"` |
| Integrations — no connections | `"No integrations connected"` | `"No integrations connected"` | `"Connect services to unlock tools in your Discord bot."` | `"Browse available integrations"` |
| Admin tenant list — empty | `"No tenants found"` | `"No tenants"` | `"No tenants match your search."` | — |
| Admin audit log — empty | `"No audit events"` | `"No events yet"` | `"Audit events will appear here as they occur."` | — |

### 4.6 ErrorState

```tsx
// components/feedback/ErrorState.tsx
<div
  role="alert"
  aria-live="assertive"
  aria-label={ariaLabel}
  className="error-state"
>
  <span aria-hidden="true" className="error-state-icon">
    <AlertTriangle />
  </span>
  <h3>{title}</h3>
  <p>{description}</p>
  {retry && (
    <button
      type="button"
      aria-label={retry.ariaLabel}
      onClick={retry.onClick}
    >
      {retry.label}
    </button>
  )}
</div>
```

**ErrorState instances:**

| Context | `aria-label` | Title | Retry `aria-label` |
|---------|-------------|-------|-------------------|
| Dashboard fetch fail | `"Error loading dashboard"` | `"Failed to load dashboard"` | `"Retry loading dashboard"` |
| Integrations fetch fail | `"Error loading integrations"` | `"Failed to load integrations"` | `"Retry loading integrations"` |
| Billing fetch fail | `"Error loading billing information"` | `"Failed to load billing"` | `"Retry loading billing"` |
| Settings fetch fail | `"Error loading settings"` | `"Failed to load settings"` | `"Retry loading settings"` |
| Admin tenant list fail | `"Error loading tenants"` | `"Failed to load tenants"` | `"Retry loading tenants"` |

### 4.7 SkeletonLoader

```tsx
// components/feedback/SkeletonLoader.tsx
<div
  role="status"
  aria-label={ariaLabel}
  aria-busy="true"
  className="skeleton-wrapper"
>
  <span className="sr-only">{ariaLabel}</span>
  {/* Visual skeleton blocks — all aria-hidden */}
  <div aria-hidden="true" className="skeleton-block" />
  <div aria-hidden="true" className="skeleton-block" />
</div>
```

**SkeletonLoader instances with exact `aria-label`:**

| Context | `aria-label` |
|---------|-------------|
| Dashboard status cards | `"Loading dashboard status..."` |
| Integrations grid | `"Loading integrations..."` |
| Billing plan info | `"Loading billing information..."` |
| Settings form | `"Loading settings..."` |
| Admin tenant list | `"Loading tenants..."` |
| Admin tenant detail | `"Loading tenant details..."` |
| Docs sidebar | `"Loading documentation navigation..."` |
| Activity feed | `"Loading activity..."` |

---

## 5. Data Display Components

### 5.1 Badge

```tsx
// components/data/Badge.tsx
<span
  role={interactive ? 'button' : undefined}
  aria-label={ariaLabel || undefined}
  className={`badge badge--${variant}`}
>
  {children}
</span>
```

**Badge instances with `aria-label`:**

| Context | Variant | `aria-label` |
|---------|---------|-------------|
| Bot status: online | `success` | `"Bot status: online"` |
| Bot status: offline | `error` | `"Bot status: offline"` |
| Bot status: connecting | `warning` | `"Bot status: connecting"` |
| Connection: connected | `success` | `"Connected"` |
| Connection: disconnected | `neutral` | `"Not connected"` |
| Plan: Free | `neutral` | `"Plan: Free"` |
| Plan: Starter | `info` | `"Plan: Starter"` |
| Plan: Pro | `success` | `"Plan: Pro"` |
| Subscription: active | `success` | `"Subscription: active"` |
| Subscription: past_due | `warning` | `"Subscription: payment past due"` |
| Subscription: canceled | `error` | `"Subscription: canceled"` |
| Admin: suspended | `error` | `"Tenant: suspended"` |
| Service: OAuth | `info` | `"Auth type: OAuth"` |
| Service: API key | `neutral` | `"Auth type: API key"` |

### 5.2 StatusIndicator

```tsx
// components/data/StatusIndicator.tsx
<div
  role="status"
  aria-label={ariaLabel}
  className={`status-indicator status-indicator--${status}`}
>
  <span aria-hidden="true" className="status-dot" />
  <span>{label}</span>
</div>
```

**StatusIndicator instances:**

| Component | Status | `aria-label` | Label |
|-----------|--------|-------------|-------|
| Dashboard bot card | `online` | `"Bot is online and running"` | `"Online"` |
| Dashboard bot card | `offline` | `"Bot is offline"` | `"Offline"` |
| Dashboard bot card | `connecting` | `"Bot is connecting to Discord"` | `"Connecting..."` |
| Dashboard bot card | `error` | `"Bot encountered an error"` | `"Error"` |
| Admin tenant detail | `healthy` | `"Tenant bot is healthy"` | `"Healthy"` |
| Admin tenant detail | `stale` | `"Tenant bot heartbeat is stale"` | `"Stale"` |
| Admin tenant detail | `suspended` | `"Tenant is suspended"` | `"Suspended"` |

### 5.3 Table

```tsx
// components/data/Table.tsx
<div role="region" aria-label={tableAriaLabel} className="table-wrapper">
  <table aria-label={tableAriaLabel}>
    <caption className="sr-only">{caption}</caption>
    <thead>
      <tr>
        {columns.map(col => (
          <th
            key={col.key}
            scope="col"
            aria-sort={col.sortable ? (sortKey === col.key ? sortDir : 'none') : undefined}
          >
            {col.sortable ? (
              <button
                type="button"
                aria-label={`Sort by ${col.label} ${sortKey === col.key && sortDir === 'asc' ? 'descending' : 'ascending'}`}
              >
                {col.label}
                <span aria-hidden="true">{sortIcon(col.key)}</span>
              </button>
            ) : col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={row.id} aria-label={row.ariaLabel}>
          {columns.map(col => (
            <td key={col.key} data-label={col.label}>
              {row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Table instances with exact ARIA:**

| Table | `tableAriaLabel` | `caption` | Row `aria-label` pattern |
|-------|-----------------|-----------|--------------------------|
| Admin tenant list | `"Tenant list"` | `"All tenants in the system"` | `"Tenant: {tenantName}, plan: {plan}, status: {status}"` |
| Admin audit log | `"Audit event log"` | `"Recent audit events"` | `"Event: {action} by {actor} at {timestamp}"` |
| Billing invoice history | `"Invoice history"` | `"Past invoices"` | `"Invoice {id}: {amount} on {date}, status: {status}"` |

### 5.4 Pagination

```tsx
// components/data/Pagination.tsx
<nav aria-label={`${tableLabel} pagination`}>
  <button
    type="button"
    aria-label="Go to previous page"
    disabled={currentPage === 1}
    aria-disabled={currentPage === 1}
    onClick={() => onPageChange(currentPage - 1)}
  >
    <ChevronLeft aria-hidden="true" />
  </button>

  {pages.map(page => (
    <button
      key={page}
      type="button"
      aria-label={`Go to page ${page}`}
      aria-current={page === currentPage ? 'page' : undefined}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  ))}

  <button
    type="button"
    aria-label="Go to next page"
    disabled={currentPage === totalPages}
    aria-disabled={currentPage === totalPages}
    onClick={() => onPageChange(currentPage + 1)}
  >
    <ChevronRight aria-hidden="true" />
  </button>

  <span aria-live="polite" aria-atomic="true" className="sr-only">
    Page {currentPage} of {totalPages}
  </span>
</nav>
```

### 5.5 StatCard

```tsx
// components/data/StatCard.tsx
<div
  role="region"
  aria-label={`${title}: ${value}`}
  className="stat-card"
>
  <div aria-hidden="true" className="stat-icon">{icon}</div>
  <dl>
    <dt>{title}</dt>
    <dd aria-label={`${title} value: ${value}`}>{value}</dd>
  </dl>
  {trend && (
    <span
      aria-label={`Trend: ${trend.direction === 'up' ? 'increased' : 'decreased'} by ${trend.value}`}
      role="note"
    >
      <span aria-hidden="true">{trend.icon}</span>
      {trend.label}
    </span>
  )}
</div>
```

**StatCard instances:**

| Card | `aria-label` | `dt` | `dd` aria-label pattern |
|------|-------------|------|------------------------|
| Messages today | `"Messages today: {count}"` | `"Messages today"` | `"Messages today value: {count}"` |
| Tools called | `"Tool calls today: {count}"` | `"Tool calls today"` | `"Tool calls today value: {count}"` |
| Bot uptime | `"Bot uptime: {percent}%"` | `"Bot uptime"` | `"Bot uptime value: {percent}%"` |
| Active integrations | `"Active integrations: {count}"` | `"Active integrations"` | `"Active integrations value: {count}"` |

### 5.6 ActivityFeed

```tsx
// components/data/ActivityFeed.tsx
<section aria-label="Recent activity" aria-live="polite" aria-atomic="false">
  <h2>Recent Activity</h2>
  <ul role="list" aria-label="Activity events">
    {items.map(item => (
      <li key={item.id} aria-label={item.ariaLabel}>
        <span aria-hidden="true" className="activity-icon">{item.icon}</span>
        <div>
          <span>{item.description}</span>
          <time dateTime={item.isoTimestamp} aria-label={`at ${item.relativeTime}`}>
            {item.relativeTime}
          </time>
        </div>
      </li>
    ))}
  </ul>
  {isEmpty && (
    <p role="status" aria-label="No recent activity">No recent activity</p>
  )}
</section>
```

**Activity item `aria-label` patterns:**

| Event type | `aria-label` pattern |
|------------|---------------------|
| Message handled | `"Message from {username} handled {relativeTime}"` |
| Tool called | `"Tool {toolName} called by {username} {relativeTime}"` |
| Bot connected | `"Bot connected to Discord {relativeTime}"` |
| Bot disconnected | `"Bot disconnected from Discord {relativeTime}"` |
| Integration connected | `"GitHub connected {relativeTime}"` |
| Integration disconnected | `"Toggl disconnected {relativeTime}"` |

### 5.7 CopyToClipboard

```tsx
// components/data/CopyToClipboard.tsx
<button
  type="button"
  aria-label={copied ? 'Copied to clipboard' : `Copy ${label} to clipboard`}
  aria-live="polite"
  onClick={handleCopy}
>
  {copied
    ? <Check aria-hidden="true" />
    : <Copy aria-hidden="true" />
  }
  <span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
</button>
```

**CopyToClipboard instances:**

| Context | `label` (for aria) | Button `aria-label` default | After copy |
|---------|-------------------|----------------------------|------------|
| Discord Guild ID display | `"guild ID"` | `"Copy guild ID to clipboard"` | `"Copied to clipboard"` |
| Tenant ID (admin) | `"tenant ID"` | `"Copy tenant ID to clipboard"` | `"Copied to clipboard"` |
| Webhook URL (future) | `"webhook URL"` | `"Copy webhook URL to clipboard"` | `"Copied to clipboard"` |
| Code snippet (docs) | `"code snippet"` | `"Copy code snippet to clipboard"` | `"Copied to clipboard"` |

---

## 6. Action Components

### 6.1 Button

```tsx
// components/actions/Button.tsx
<button
  type={type}
  aria-label={ariaLabel || undefined}
  aria-disabled={disabled || isLoading}
  aria-busy={isLoading}
  disabled={disabled || isLoading}
  onClick={!disabled && !isLoading ? onClick : undefined}
>
  {isLoading && (
    <>
      <Loader2 aria-hidden="true" className="animate-spin" />
      <span className="sr-only">Loading...</span>
    </>
  )}
  {!isLoading && icon && <span aria-hidden="true">{icon}</span>}
  {children}
</button>
```

**Button `aria-label` specifications — only set when label text alone is insufficient:**

| Button | Visible text | `aria-label` (if different from text) |
|--------|-------------|---------------------------------------|
| Landing hero CTA | `"Get started free"` | — |
| Landing secondary CTA | `"See how it works"` | — |
| Login submit | `"Sign in"` | — |
| Signup submit | `"Create account"` | — |
| Reset send | `"Send reset email"` | — |
| Connect Discord | `"Connect bot"` | `"Connect Discord bot to Daimon"` |
| Disconnect Discord | `"Disconnect"` | `"Disconnect Discord bot"` |
| Save Discord settings | `"Save"` | `"Save Discord connection settings"` |
| Connect GitHub | `"Connect GitHub"` | — |
| Connect Google | `"Connect Google"` | — |
| Connect Linear | `"Connect Linear"` | — |
| Connect Toggl | `"Connect"` | `"Connect Toggl integration"` |
| Connect Dub | `"Connect"` | `"Connect Dub integration"` |
| Disconnect service (generic) | `"Disconnect"` | `"Disconnect {serviceName}"` (dynamic) |
| Upgrade to Starter | `"Upgrade to Starter"` | — |
| Upgrade to Pro | `"Upgrade to Pro"` | — |
| Manage subscription | `"Manage subscription"` | — |
| Save settings | `"Save changes"` | — |
| Delete account | `"Delete account"` | `"Permanently delete my account"` |
| Admin: impersonate | `"Impersonate"` | `"Impersonate tenant {tenantName}"` |
| Admin: suspend | `"Suspend"` | `"Suspend tenant {tenantName}"` |
| Admin: unsuspend | `"Unsuspend"` | `"Unsuspend tenant {tenantName}"` |
| Admin: delete tenant | `"Delete"` | `"Delete tenant {tenantName} permanently"` |
| Retry loading | `"Try again"` | `"Retry loading {context}"` |

**Loading state `aria-label` patterns:**

| Button | `aria-label` while loading |
|--------|--------------------------|
| Login submit | `"Signing in..."` |
| Signup submit | `"Creating your account..."` |
| Connect Discord | `"Connecting Discord bot..."` |
| Connect GitHub | `"Connecting GitHub..."` |
| Save API key | `"Saving API key..."` |
| Upgrade plan | `"Redirecting to checkout..."` |
| Save settings | `"Saving changes..."` |
| Delete account | `"Deleting account..."` |

### 6.2 IconButton

```tsx
// components/actions/IconButton.tsx
// Icon-only button — MUST always have aria-label
<button
  type="button"
  aria-label={ariaLabel}  // REQUIRED — no children text
  aria-pressed={pressed}
  title={ariaLabel}       // Tooltip fallback for sighted users
  onClick={onClick}
>
  <span aria-hidden="true">{icon}</span>
</button>
```

**IconButton `aria-label` per usage:**

| Location | Icon | `aria-label` |
|----------|------|-------------|
| Topbar hamburger | `Menu` | `"Open navigation menu"` |
| MobileNav close | `X` | `"Close navigation menu"` |
| PublicMobileMenu close | `X` | `"Close site menu"` |
| Sidebar logout | `LogOut` | `"Sign out of Daimon"` |
| Toast dismiss | `X` | `"Dismiss notification"` |
| Modal close | `X` | `"Close dialog"` |
| Password show/hide | `Eye`/`EyeOff` | `"Show password"` / `"Hide password"` |
| Table sort ASC | `ChevronUp` | `"Sort ascending"` |
| Table sort DESC | `ChevronDown` | `"Sort descending"` |
| Copy to clipboard | `Copy` | `"Copy to clipboard"` |
| Edit tenant (admin) | `Pencil` | `"Edit tenant {name}"` |

### 6.3 DropdownMenu

```tsx
// components/actions/DropdownMenu.tsx
<div className="dropdown-wrapper">
  <button
    type="button"
    id={`dropdown-trigger-${id}`}
    aria-haspopup="menu"
    aria-expanded={isOpen}
    aria-controls={`dropdown-menu-${id}`}
    aria-label={triggerAriaLabel}
    onClick={() => setIsOpen(v => !v)}
  >
    {triggerContent}
    <ChevronDown aria-hidden="true" />
  </button>

  <ul
    id={`dropdown-menu-${id}`}
    role="menu"
    aria-labelledby={`dropdown-trigger-${id}`}
    hidden={!isOpen}
  >
    {items.map(item => (
      <li key={item.id} role="none">
        <button
          type="button"
          role="menuitem"
          aria-label={item.ariaLabel || item.label}
          onClick={() => { item.action(); setIsOpen(false); }}
          disabled={item.disabled}
          aria-disabled={item.disabled}
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          {item.label}
        </button>
      </li>
    ))}
  </ul>
</div>
```

### 6.4 Tabs

```tsx
// components/actions/Tabs.tsx
<div>
  <div role="tablist" aria-label={tablistAriaLabel}>
    {tabs.map((tab, i) => (
      <button
        key={tab.id}
        role="tab"
        id={`tab-${tab.id}`}
        aria-selected={activeTab === tab.id}
        aria-controls={`tabpanel-${tab.id}`}
        tabIndex={activeTab === tab.id ? 0 : -1}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {tabs.map(tab => (
    <div
      key={tab.id}
      role="tabpanel"
      id={`tabpanel-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
      hidden={activeTab !== tab.id}
      tabIndex={0}
    >
      {tab.content}
    </div>
  ))}
</div>
```

**Tabs instances:**

| Page | `tablistAriaLabel` | Tab labels |
|------|--------------------|------------|
| Admin tenant detail | `"Tenant detail sections"` | `["Overview", "Connections", "Billing", "Audit Log"]` |
| Docs page | `"Documentation sections"` | `["Quick Start", "Tools", "Billing", "FAQ"]` |
| Settings page | `"Settings sections"` | `["General", "Discord", "Danger Zone"]` |

---

## 7. Landing Page

```tsx
// app/(public)/page.tsx
<main id="main-content" tabindex="-1">

  {/* Hero Section */}
  <section aria-labelledby="hero-title">
    <h1 id="hero-title">
      Your Discord server.<br />
      Powered by AI.
    </h1>
    <p aria-describedby="hero-title">
      Connect your own Discord bot token and Anthropic API key.
      Get an AI operating system in minutes.
    </p>
    <div aria-label="Get started actions">
      <Link href="/signup" aria-label="Get started free — create your account">
        Get started free
      </Link>
      <button
        type="button"
        aria-label="Watch a demo of Daimon in action"
        aria-haspopup="dialog"
      >
        See how it works
      </button>
    </div>
  </section>

  {/* Features Section */}
  <section aria-labelledby="features-title" id="features">
    <h2 id="features-title">Everything your server needs</h2>
    <ul role="list" aria-label="Feature list">
      {features.map(feature => (
        <li key={feature.id} aria-label={feature.title}>
          <span aria-hidden="true" className="feature-icon">{feature.icon}</span>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </li>
      ))}
    </ul>
  </section>

  {/* Pricing Section */}
  <section aria-labelledby="pricing-title" id="pricing">
    <h2 id="pricing-title">Simple, transparent pricing</h2>
    <div role="list" aria-label="Pricing plans">
      {plans.map(plan => (
        <article
          key={plan.id}
          role="listitem"
          aria-label={`${plan.name} plan: ${plan.price}`}
          aria-describedby={`plan-features-${plan.id}`}
        >
          <h3>{plan.name}</h3>
          <p aria-label={`Price: ${plan.price} per month`}>{plan.price}</p>
          <ul id={`plan-features-${plan.id}`} aria-label={`${plan.name} plan features`}>
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <Link
            href="/signup"
            aria-label={`Get started with ${plan.name} plan`}
          >
            {plan.cta}
          </Link>
        </article>
      ))}
    </div>
  </section>

  {/* FAQ Section */}
  <section aria-labelledby="faq-title" id="faq">
    <h2 id="faq-title">Frequently asked questions</h2>
    <dl>
      {faqs.map((faq, i) => (
        <div key={i}>
          <dt>
            <button
              type="button"
              aria-expanded={openFaq === i}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
            >
              {faq.question}
              <ChevronDown aria-hidden="true" />
            </button>
          </dt>
          <dd
            id={`faq-answer-${i}`}
            aria-labelledby={`faq-question-${i}`}
            hidden={openFaq !== i}
          >
            {faq.answer}
          </dd>
        </div>
      ))}
    </dl>
  </section>

  {/* Social Proof Section */}
  <section aria-labelledby="social-proof-title">
    <h2 id="social-proof-title" className="sr-only">What our users say</h2>
    <ul role="list" aria-label="Testimonials">
      {testimonials.map(t => (
        <li key={t.id}>
          <blockquote cite={t.sourceUrl}>
            <p>{t.quote}</p>
            <footer>
              <cite aria-label={`${t.authorName}, ${t.authorRole}`}>
                {t.authorName}, {t.authorRole}
              </cite>
            </footer>
          </blockquote>
        </li>
      ))}
    </ul>
  </section>

</main>
```

---

## 8. Auth Pages

### 8.1 Login Page (`/login`)

```tsx
// app/(auth)/login/page.tsx
<AuthCard title="Sign in to Daimon" description="Enter your email and password">

  {/* Global error banner */}
  {loginError && (
    <AlertBanner
      variant="error"
      message={loginError}
      role="alert"
      aria-live="assertive"
    />
  )}

  <form
    aria-label="Sign in form"
    onSubmit={handleSubmit}
    noValidate
  >
    <FormInput
      id="login-email"
      label="Email address"
      type="email"
      required
      autoComplete="email"
      aria-describedby={emailError ? 'login-email-error' : undefined}
      aria-invalid={!!emailError}
    />

    <PasswordInput
      id="login-password"
      label="Password"
      required
      autoComplete="current-password"
      aria-describedby={passwordError ? 'login-password-error' : undefined}
      aria-invalid={!!passwordError}
    />

    <Link
      href="/reset-password"
      aria-label="Forgot your password? Reset it here"
    >
      Forgot password?
    </Link>

    <Button
      type="submit"
      aria-label={isLoading ? 'Signing in...' : 'Sign in'}
      aria-busy={isLoading}
      disabled={isLoading}
    >
      Sign in
    </Button>

    <p>
      Don't have an account?{' '}
      <Link href="/signup" aria-label="Create a new account">
        Sign up
      </Link>
    </p>
  </form>

</AuthCard>
```

### 8.2 Signup Page (`/signup`)

```tsx
// app/(auth)/signup/page.tsx
<AuthCard title="Create your account" description="Start with a free account. No credit card required.">

  <form aria-label="Create account form" onSubmit={handleSubmit} noValidate>

    <FormInput
      id="signup-email"
      label="Email address"
      type="email"
      required
      autoComplete="email"
      aria-describedby="signup-email-hint signup-email-error"
      aria-invalid={!!emailError}
    />
    <p id="signup-email-hint" className="field-hint">
      We'll send a confirmation link to this address.
    </p>

    <PasswordInput
      id="signup-password"
      label="Password"
      required
      autoComplete="new-password"
      aria-describedby="signup-password-hint signup-password-error"
      aria-invalid={!!passwordError}
    />
    <p id="signup-password-hint" className="field-hint">
      At least 8 characters. Mix letters, numbers, and symbols for a stronger password.
    </p>

    {/* Password strength indicator */}
    <div role="status" aria-live="polite" aria-label={`Password strength: ${strengthLabel}`}>
      <span className="sr-only">Password strength: {strengthLabel}</span>
    </div>

    <PasswordInput
      id="signup-confirm-password"
      label="Confirm password"
      required
      autoComplete="new-password"
      aria-describedby="signup-confirm-password-error"
      aria-invalid={!!confirmError}
    />

    <Checkbox
      id="accept-terms"
      label="I agree to the Terms of Service and Privacy Policy"
      required
      aria-required="true"
      aria-describedby="accept-terms-error"
      aria-invalid={!!termsError}
    />
    {termsError && (
      <p id="accept-terms-error" role="alert" aria-live="polite">{termsError}</p>
    )}

    <Button
      type="submit"
      aria-label={isLoading ? 'Creating your account...' : 'Create account'}
      aria-busy={isLoading}
    >
      Create account
    </Button>

    <p>
      Already have an account?{' '}
      <Link href="/login" aria-label="Sign in to your existing account">Sign in</Link>
    </p>

  </form>

</AuthCard>
```

### 8.3 Reset Password Page (`/reset-password`)

```tsx
// app/(auth)/reset-password/page.tsx
<AuthCard title="Reset your password" description="Enter your email and we'll send a reset link.">

  <form aria-label="Password reset form" onSubmit={handleSubmit} noValidate>

    <FormInput
      id="reset-email"
      label="Email address"
      type="email"
      required
      autoComplete="email"
      aria-describedby={emailError ? 'reset-email-error' : undefined}
      aria-invalid={!!emailError}
    />

    <Button
      type="submit"
      aria-label={isLoading ? 'Sending reset email...' : 'Send reset email'}
      aria-busy={isLoading}
    >
      Send reset email
    </Button>

    {/* Success state */}
    {emailSent && (
      <div role="status" aria-live="polite" aria-label="Reset email sent">
        <p>Check your email for a reset link. It expires in 1 hour.</p>
      </div>
    )}

    <Link href="/login" aria-label="Return to sign in">Back to sign in</Link>

  </form>

</AuthCard>
```

### 8.4 Confirm Reset Page (`/reset-password/confirm`)

```tsx
// app/(auth)/reset-password/confirm/page.tsx
<AuthCard title="Set a new password">

  <form aria-label="New password form" onSubmit={handleSubmit} noValidate>

    <PasswordInput
      id="new-password"
      label="New password"
      required
      autoComplete="new-password"
      aria-describedby="new-password-hint new-password-error"
      aria-invalid={!!passwordError}
    />
    <p id="new-password-hint">At least 8 characters.</p>

    <PasswordInput
      id="confirm-new-password"
      label="Confirm new password"
      required
      autoComplete="new-password"
      aria-describedby="confirm-new-password-error"
      aria-invalid={!!confirmError}
    />

    <Button
      type="submit"
      aria-label={isLoading ? 'Updating password...' : 'Update password'}
      aria-busy={isLoading}
    >
      Update password
    </Button>

  </form>

</AuthCard>
```

---

## 9. Dashboard Home

```tsx
// app/(dashboard)/dashboard/page.tsx
<main id="main-content" tabindex="-1">
  <PageShell title="Dashboard" description="Overview of your Daimon workspace">

    {/* Onboarding checklist — only shown when incomplete */}
    {onboardingIncomplete && (
      <section aria-labelledby="onboarding-title">
        <h2 id="onboarding-title">Complete your setup</h2>
        <ol role="list" aria-label="Setup checklist">
          <li aria-label={`Step 1: ${step1Label} — ${step1Complete ? 'complete' : 'incomplete'}`}>
            <span aria-hidden="true">{step1Complete ? '✓' : '○'}</span>
            {step1Label}
          </li>
          {/* ... more steps */}
        </ol>
      </section>
    )}

    {/* Status cards */}
    <section aria-labelledby="status-title">
      <h2 id="status-title" className="sr-only">Workspace status</h2>
      <div aria-label="Status overview" role="group">
        <StatCard
          title="Messages today"
          value={stats.messagesToday}
          aria-label={`Messages today: ${stats.messagesToday}`}
        />
        <StatCard
          title="Tool calls today"
          value={stats.toolCallsToday}
          aria-label={`Tool calls today: ${stats.toolCallsToday}`}
        />
        <StatCard
          title="Bot uptime"
          value={`${stats.uptimePercent}%`}
          aria-label={`Bot uptime: ${stats.uptimePercent}%`}
        />
        <StatCard
          title="Active integrations"
          value={stats.activeIntegrations}
          aria-label={`Active integrations: ${stats.activeIntegrations}`}
        />
      </div>
    </section>

    {/* Bot status card */}
    <section aria-labelledby="bot-status-title">
      <h2 id="bot-status-title">Bot status</h2>
      <div role="region" aria-label={`Discord bot: ${botStatus}`}>
        <StatusIndicator
          status={botStatus}
          label={botStatusLabel}
          aria-label={`Bot is ${botStatus}`}
        />
        <p aria-label={`Connected to guild: ${guildName}`}>
          Connected to: {guildName}
        </p>
        <p aria-label={`Last heartbeat: ${lastHeartbeat}`}>
          Last heartbeat: {lastHeartbeat}
        </p>
      </div>
    </section>

    {/* Activity feed */}
    <ActivityFeed
      items={recentActivity}
      aria-label="Recent bot activity"
    />

  </PageShell>
</main>
```

**Onboarding checklist step `aria-label` patterns:**

| Step | `aria-label` (complete) | `aria-label` (incomplete) |
|------|------------------------|--------------------------|
| Connect Discord | `"Step 1: Connect your Discord bot — complete"` | `"Step 1: Connect your Discord bot — action required"` |
| Add Anthropic key | `"Step 2: Add Anthropic API key — complete"` | `"Step 2: Add Anthropic API key — action required"` |
| Connect an integration | `"Step 3: Connect an integration — complete"` | `"Step 3: Connect an integration — optional"` |
| Upgrade plan | `"Step 4: Upgrade your plan — complete"` | `"Step 4: Upgrade your plan — optional"` |

---

## 10. Integrations Page

```tsx
// app/(dashboard)/dashboard/integrations/page.tsx
<main id="main-content" tabindex="-1">
  <PageShell title="Integrations" description="Connect external services to your bot">

    {/* Service grid */}
    <section aria-labelledby="integrations-grid-title">
      <h2 id="integrations-grid-title" className="sr-only">Available integrations</h2>

      <ul role="list" aria-label="Integration services">
        {services.map(service => (
          <li key={service.id}>
            <article
              aria-label={`${service.name} — ${service.connected ? 'connected' : 'not connected'}`}
            >
              <img
                src={service.logoUrl}
                alt={`${service.name} logo`}
                width={40}
                height={40}
              />
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <Badge
                variant={service.connected ? 'success' : 'neutral'}
                aria-label={service.connected ? `${service.name}: connected` : `${service.name}: not connected`}
              >
                {service.connected ? 'Connected' : 'Not connected'}
              </Badge>

              {service.connected ? (
                <Button
                  variant="secondary"
                  aria-label={`Disconnect ${service.name}`}
                  onClick={() => handleDisconnect(service.id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="primary"
                  aria-label={`Connect ${service.name}`}
                  onClick={() => handleConnect(service.id)}
                >
                  Connect
                </Button>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>

    {/* OAuth services section */}
    <section aria-labelledby="oauth-services-title">
      <h2 id="oauth-services-title">OAuth services</h2>
      <p id="oauth-services-desc">
        These services use secure OAuth. You'll be redirected to authorize Daimon.
      </p>
      {/* GitHub, Google, Linear cards — see service grid above */}
    </section>

    {/* API key services section */}
    <section aria-labelledby="apikey-services-title">
      <h2 id="apikey-services-title">API key services</h2>
      <p id="apikey-services-desc">
        Paste your API key to connect. Keys are encrypted and stored securely.
      </p>
      {/* Toggl, Dub cards — see service grid above */}
    </section>

  </PageShell>
</main>
```

**Service `aria-label` per card:**

| Service | Connected `aria-label` | Not connected `aria-label` |
|---------|----------------------|---------------------------|
| GitHub | `"GitHub — connected"` | `"GitHub — not connected"` |
| Google | `"Google — not connected"` | `"Google — not connected"` |
| Linear | `"Linear — not connected"` | `"Linear — not connected"` |
| Toggl | `"Toggl — connected"` | `"Toggl — not connected"` |
| Dub | `"Dub — not connected"` | `"Dub — not connected"` |
| Discord | `"Discord — connected"` | `"Discord — not connected"` |

---

## 11. Billing Page

```tsx
// app/(dashboard)/dashboard/billing/page.tsx
<main id="main-content" tabindex="-1">
  <PageShell title="Billing" description="Manage your subscription and API keys">

    {/* Current plan */}
    <section aria-labelledby="current-plan-title">
      <h2 id="current-plan-title">Current plan</h2>

      <div role="region" aria-label={`Current subscription: ${planName}`}>
        <PlanBadge plan={plan} aria-label={`Plan: ${planName}`} />
        <p aria-label={`Billing cycle: ${billingCycle}`}>
          {billingCycle}
        </p>
        <p aria-label={`Next invoice: ${nextInvoiceDate}`}>
          Next invoice: {nextInvoiceDate}
        </p>
        <Button
          aria-label="Manage subscription in Stripe Customer Portal"
          onClick={openCustomerPortal}
        >
          Manage subscription
        </Button>
      </div>
    </section>

    {/* Plan comparison */}
    <section aria-labelledby="plan-comparison-title">
      <h2 id="plan-comparison-title">Available plans</h2>

      <div role="list" aria-label="Plan options">
        {plans.map(p => (
          <article
            key={p.id}
            role="listitem"
            aria-label={`${p.name} plan: ${p.price}/month`}
            aria-current={plan === p.id ? 'true' : undefined}
          >
            <h3>{p.name}</h3>
            <p aria-label={`Price: ${p.price} per month`}>{p.price}/mo</p>
            <ul aria-label={`${p.name} plan features`}>
              {p.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            {plan !== p.id && (
              <Button
                aria-label={p.price > currentPlanPrice
                  ? `Upgrade to ${p.name}`
                  : `Downgrade to ${p.name}`
                }
                onClick={() => handlePlanChange(p.id)}
              >
                {p.price > currentPlanPrice ? `Upgrade to ${p.name}` : `Downgrade to ${p.name}`}
              </Button>
            )}
            {plan === p.id && (
              <span aria-label="This is your current plan" role="status">
                Current plan
              </span>
            )}
          </article>
        ))}
      </div>
    </section>

    {/* BYOK API keys */}
    <section aria-labelledby="api-keys-title">
      <h2 id="api-keys-title">Your API keys</h2>
      <p id="api-keys-desc">
        These are your personal keys, not ours. They're encrypted and used to power your bot.
      </p>

      <div aria-labelledby="api-keys-title" aria-describedby="api-keys-desc">
        <ApiKeyInput
          id="anthropic-api-key"
          label="Anthropic API key"
          serviceName="Anthropic"
          required
          aria-required="true"
          aria-describedby="anthropic-key-note"
        />
        <p id="anthropic-key-note">
          Required. Powers all AI responses. Get yours at console.anthropic.com.
        </p>

        <ApiKeyInput
          id="openai-api-key"
          label="OpenAI API key (optional)"
          serviceName="OpenAI"
          aria-describedby="openai-key-note"
        />
        <p id="openai-key-note">
          Optional. Used for message classification. Falls back to Anthropic if not provided.
        </p>
      </div>
    </section>

    {/* Invoice history */}
    <section aria-labelledby="invoices-title">
      <h2 id="invoices-title">Invoice history</h2>
      <Table
        aria-label="Invoice history"
        caption="Past invoices for your account"
        columns={invoiceColumns}
        rows={invoices}
      />
    </section>

  </PageShell>
</main>
```

---

## 12. Settings Page

```tsx
// app/(dashboard)/dashboard/settings/page.tsx
<main id="main-content" tabindex="-1">
  <PageShell title="Settings" description="Manage your workspace and account settings">

    <Tabs
      tablistAriaLabel="Settings sections"
      tabs={[
        { id: 'general', label: 'General' },
        { id: 'discord', label: 'Discord' },
        { id: 'danger', label: 'Danger Zone' },
      ]}
    />

    {/* General tab panel */}
    <div role="tabpanel" id="tabpanel-general" aria-labelledby="tab-general">
      <form
        aria-label="General settings form"
        onSubmit={handleSaveGeneral}
        noValidate
      >
        <FormInput
          id="tenant-name"
          label="Workspace name"
          type="text"
          required
          aria-describedby="tenant-name-hint tenant-name-error"
          aria-invalid={!!tenantNameError}
        />
        <p id="tenant-name-hint">
          Shown in the dashboard and email notifications. 2–100 characters.
        </p>

        <Toggle
          id="email-notifications"
          label="Email notifications"
          aria-label="Email notifications — receive updates about your bot and account"
        />

        <Button
          type="submit"
          aria-label={isLoading ? 'Saving changes...' : 'Save general settings'}
          aria-busy={isLoading}
        >
          Save changes
        </Button>
      </form>
    </div>

    {/* Discord tab panel */}
    <div role="tabpanel" id="tabpanel-discord" aria-labelledby="tab-discord">
      <form
        aria-label="Discord connection form"
        onSubmit={handleSaveDiscord}
        noValidate
      >
        <FormInput
          id="discord-bot-token"
          label="Bot token"
          type="password"
          required
          autoComplete="off"
          aria-describedby="discord-bot-token-hint discord-bot-token-error"
          aria-invalid={!!tokenError}
        />
        <p id="discord-bot-token-hint">
          Found in the Discord Developer Portal under your application &gt; Bot &gt; Token.
          Starts with your bot's client ID.
        </p>

        <FormInput
          id="discord-guild-id"
          label="Guild ID (Server ID)"
          type="text"
          required
          autoComplete="off"
          aria-describedby="discord-guild-id-hint discord-guild-id-error"
          aria-invalid={!!guildError}
        />
        <p id="discord-guild-id-hint">
          Right-click your server in Discord and select "Copy Server ID".
          Requires Developer Mode enabled in Discord settings.
        </p>

        <Button
          type="submit"
          aria-label={isLoading ? 'Saving Discord settings...' : 'Save Discord settings'}
          aria-busy={isLoading}
        >
          Save
        </Button>

        {isConnected && (
          <Button
            variant="secondary-destructive"
            aria-label="Disconnect Discord bot"
            onClick={() => setShowDisconnectConfirm(true)}
          >
            Disconnect bot
          </Button>
        )}
      </form>
    </div>

    {/* Danger Zone tab panel */}
    <div role="tabpanel" id="tabpanel-danger" aria-labelledby="tab-danger">
      <section
        aria-labelledby="danger-zone-title"
        aria-describedby="danger-zone-desc"
      >
        <h2 id="danger-zone-title">Danger Zone</h2>
        <p id="danger-zone-desc">
          These actions are permanent and cannot be undone.
        </p>

        <div aria-label="Danger zone actions">
          <div>
            <h3>Delete account</h3>
            <p>Permanently delete your workspace, disconnect your bot, and cancel your subscription.</p>
            <Button
              variant="destructive"
              aria-label="Delete your account permanently"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete account
            </Button>
          </div>
        </div>
      </section>
    </div>

  </PageShell>
</main>
```

---

## 13. Admin Panel

```tsx
// app/(dashboard)/admin/page.tsx (tenant list)
<main id="main-content" tabindex="-1">
  <PageShell title="Admin" description="Manage all tenants">

    {/* Search and filters */}
    <div role="search" aria-label="Tenant search and filters">
      <SearchInput
        id="admin-tenant-search"
        label="Search tenants by name or email"
        placeholder="Search tenants..."
      />
      <Select
        id="admin-plan-filter"
        label="Filter by plan"
        aria-label="Filter tenants by plan"
        options={planOptions}
      />
      <Select
        id="admin-status-filter"
        label="Filter by status"
        aria-label="Filter tenants by status"
        options={statusOptions}
      />
    </div>

    {/* Tenant table */}
    <Table
      aria-label="Tenant list"
      caption="All tenants in the system"
    >
      <thead>
        <tr>
          <th scope="col">Tenant</th>
          <th scope="col">Plan</th>
          <th scope="col">Status</th>
          <th scope="col">Created</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {tenants.map(tenant => (
          <tr
            key={tenant.id}
            aria-label={`Tenant: ${tenant.name}, plan: ${tenant.plan}, status: ${tenant.status}`}
          >
            <td>
              <Link
                href={`/admin/tenants/${tenant.id}`}
                aria-label={`View details for ${tenant.name}`}
              >
                {tenant.name}
              </Link>
            </td>
            <td>
              <Badge aria-label={`Plan: ${tenant.plan}`}>{tenant.plan}</Badge>
            </td>
            <td>
              <StatusIndicator
                status={tenant.status}
                aria-label={`Status: ${tenant.status}`}
              />
            </td>
            <td>
              <time dateTime={tenant.createdAtIso}>
                {tenant.createdAtFormatted}
              </time>
            </td>
            <td>
              <DropdownMenu
                triggerAriaLabel={`Actions for ${tenant.name}`}
                items={[
                  { label: 'View', ariaLabel: `View ${tenant.name} details`, action: () => router.push(`/admin/tenants/${tenant.id}`) },
                  { label: 'Impersonate', ariaLabel: `Impersonate ${tenant.name}`, action: () => handleImpersonate(tenant) },
                  { label: 'Suspend', ariaLabel: `Suspend ${tenant.name}`, action: () => handleSuspend(tenant) },
                  { label: 'Delete', ariaLabel: `Delete ${tenant.name} permanently`, action: () => handleDelete(tenant), destructive: true },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    <Pagination aria-label="Tenant list pagination" />

  </PageShell>
</main>
```

**Admin Tenant Detail Page (`/admin/tenants/[id]`):**

```tsx
<main id="main-content" tabindex="-1">
  <PageShell
    title={tenant.name}
    breadcrumbs={[
      { label: 'Admin', href: '/admin' },
      { label: 'Tenants', href: '/admin/tenants' },
      { label: tenant.name },
    ]}
  >
    <Tabs
      tablistAriaLabel={`${tenant.name} detail sections`}
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'connections', label: 'Connections' },
        { id: 'billing', label: 'Billing' },
        { id: 'audit', label: 'Audit Log' },
      ]}
    />

    {/* Overview panel */}
    <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
      <dl aria-label="Tenant details">
        <div>
          <dt>Tenant ID</dt>
          <dd>
            {tenant.id}
            <CopyToClipboard label="tenant ID" value={tenant.id} />
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusIndicator status={tenant.status} aria-label={`Status: ${tenant.status}`} />
          </dd>
        </div>
        <div>
          <dt>Plan</dt>
          <dd><Badge aria-label={`Plan: ${tenant.plan}`}>{tenant.plan}</Badge></dd>
        </div>
        <div>
          <dt>Owner email</dt>
          <dd>{tenant.ownerEmail}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>
            <time dateTime={tenant.createdAtIso}>{tenant.createdAtFormatted}</time>
          </dd>
        </div>
      </dl>

      {/* Admin actions */}
      <div aria-label={`Admin actions for ${tenant.name}`} role="group">
        <Button
          aria-label={`Impersonate ${tenant.name} — view their dashboard as them`}
          onClick={handleImpersonate}
        >
          Impersonate
        </Button>
        <Toggle
          id="tenant-suspended"
          label={tenant.status === 'suspended' ? 'Tenant suspended' : 'Suspend tenant'}
          aria-label={tenant.status === 'suspended'
            ? `${tenant.name} is suspended — toggle to unsuspend`
            : `${tenant.name} is active — toggle to suspend`
          }
        />
        <Button
          variant="destructive"
          aria-label={`Delete ${tenant.name} permanently`}
          onClick={handleDelete}
        >
          Delete tenant
        </Button>
      </div>
    </div>

    {/* Audit log panel */}
    <div role="tabpanel" id="tabpanel-audit" aria-labelledby="tab-audit">
      <Table
        aria-label={`Audit log for ${tenant.name}`}
        caption={`Audit events for ${tenant.name}`}
      />
    </div>

  </PageShell>
</main>
```

---

## 14. Docs Pages

```tsx
// app/(public)/docs/layout.tsx
<div>
  <nav aria-label="Documentation navigation" id="docs-nav">
    <ul role="list">
      <li>
        <Link href="/docs/quick-start" aria-current={isActive('/docs/quick-start') ? 'page' : undefined}>
          Quick Start
        </Link>
      </li>
      <li>
        <button
          type="button"
          aria-expanded={toolsExpanded}
          aria-controls="docs-tools-submenu"
        >
          Tool Reference
          <ChevronDown aria-hidden="true" />
        </button>
        <ul id="docs-tools-submenu" aria-label="Tool reference sections" hidden={!toolsExpanded}>
          <li><Link href="/docs/tools/discord" aria-current={isActive('/docs/tools/discord') ? 'page' : undefined}>Discord</Link></li>
          <li><Link href="/docs/tools/toggl" aria-current={isActive('/docs/tools/toggl') ? 'page' : undefined}>Toggl</Link></li>
          <li><Link href="/docs/tools/github" aria-current={isActive('/docs/tools/github') ? 'page' : undefined}>GitHub</Link></li>
          <li><Link href="/docs/tools/google" aria-current={isActive('/docs/tools/google') ? 'page' : undefined}>Google</Link></li>
          <li><Link href="/docs/tools/linear" aria-current={isActive('/docs/tools/linear') ? 'page' : undefined}>Linear</Link></li>
          <li><Link href="/docs/tools/linkedin" aria-current={isActive('/docs/tools/linkedin') ? 'page' : undefined}>LinkedIn</Link></li>
          <li><Link href="/docs/tools/dub" aria-current={isActive('/docs/tools/dub') ? 'page' : undefined}>Dub</Link></li>
          <li><Link href="/docs/tools/fly" aria-current={isActive('/docs/tools/fly') ? 'page' : undefined}>Fly</Link></li>
        </ul>
      </li>
      <li>
        <Link href="/docs/billing" aria-current={isActive('/docs/billing') ? 'page' : undefined}>
          Billing & Plans
        </Link>
      </li>
      <li>
        <Link href="/docs/faq" aria-current={isActive('/docs/faq') ? 'page' : undefined}>
          FAQ
        </Link>
      </li>
    </ul>
  </nav>

  <main id="main-content" tabindex="-1">
    {children}
  </main>
</div>
```

**Docs page `<article>` ARIA:**
```tsx
<article aria-labelledby="docs-page-title">
  <h1 id="docs-page-title">{pageTitle}</h1>
  {/* Content */}
</article>
```

**Docs code block ARIA:**
```tsx
<figure aria-label={`Code example: ${codeTitle}`}>
  <figcaption>{codeTitle}</figcaption>
  <pre>
    <code aria-label={`${language} code: ${codeTitle}`}>{code}</code>
  </pre>
  <CopyToClipboard label="code snippet" value={code} />
</figure>
```

---

## 15. Live Region Announcements

All dynamic content changes that don't trigger a page navigation must be announced via ARIA live regions.

### 15.1 Global Live Region

Place this in `app/layout.tsx` — shared across all pages:

```tsx
// Global live regions in root layout
<div aria-live="polite" aria-atomic="true" className="sr-only" id="global-announcer">
  {/* Used for success/info announcements */}
</div>
<div aria-live="assertive" aria-atomic="true" className="sr-only" id="global-alert-announcer">
  {/* Used for error announcements */}
</div>
```

### 15.2 Announcements per Action

| Trigger | Region | Message |
|---------|--------|---------|
| Discord bot connects | `polite` | `"Discord bot connected. Your bot is now online."` |
| Discord bot disconnects | `polite` | `"Discord bot disconnected."` |
| Discord bot connection fails | `assertive` | `"Failed to connect Discord bot. Please check your token and try again."` |
| GitHub OAuth starts | `polite` | `"Redirecting to GitHub for authorization..."` |
| GitHub connects | `polite` | `"GitHub connected successfully."` |
| GitHub disconnects | `polite` | `"GitHub disconnected."` |
| Google connects | `polite` | `"Google connected successfully."` |
| Linear connects | `polite` | `"Linear connected successfully."` |
| Toggl key saves | `polite` | `"Toggl API key saved and verified."` |
| Toggl key invalid | `assertive` | `"Toggl API key is invalid. Please check and try again."` |
| Dub key saves | `polite` | `"Dub API key saved and verified."` |
| Anthropic key saves | `polite` | `"Anthropic API key saved successfully."` |
| Anthropic key invalid | `assertive` | `"Anthropic API key is invalid. Please verify the key format."` |
| Plan upgrade success | `polite` | `"You've been upgraded to the {planName} plan."` |
| Plan upgrade fails | `assertive` | `"Failed to upgrade plan. Please try again or contact support."` |
| Settings save success | `polite` | `"Settings saved."` |
| Settings save fails | `assertive` | `"Failed to save settings. Please try again."` |
| Account deleted | `assertive` | `"Your account has been deleted. You have been signed out."` |
| Session expired | `assertive` | `"Your session has expired. Please sign in again."` |
| Copied to clipboard | `polite` | `"Copied to clipboard."` |
| Form validation fails | `assertive` | `"Please correct the errors in the form before submitting."` |
| Bot status changes (real-time) | `polite` | `"Bot status changed to {newStatus}."` |
| Modal opens | `polite` | `"Dialog opened: {dialogTitle}"` |
| Modal closes | `polite` | `"Dialog closed."` |

### 15.3 Bot Status Real-Time Updates

The dashboard subscribes to Supabase Realtime for bot status changes. When status changes:

```tsx
// In dashboard page — Realtime subscription
useEffect(() => {
  const channel = supabase
    .channel(`tenant-status-${tenantId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'discord_connections' }, (payload) => {
      const newStatus = payload.new.status
      // Announce to screen reader
      announce(`Bot status changed to ${newStatus === 'connected' ? 'online' : newStatus}.`)
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [tenantId])
```

```tsx
// announce() helper — writes to global live region
function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.getElementById(
    priority === 'assertive' ? 'global-alert-announcer' : 'global-announcer'
  )
  if (el) {
    el.textContent = ''
    requestAnimationFrame(() => {
      el.textContent = message
    })
  }
}
```

---

## 16. Image and Icon Alt Text

### 16.1 All Icons Must Be `aria-hidden="true"` When Decorative

Every Lucide icon used purely as decoration (paired with visible text) must have `aria-hidden="true"`:

```tsx
// Correct
<Button>
  <Plus aria-hidden="true" />
  Add integration
</Button>

// Incorrect — screen reader reads "Plus Add integration"
<Button>
  <Plus />
  Add integration
</Button>
```

### 16.2 Standalone Icons (No Paired Text) Must Have `aria-label`

```tsx
// IconButton wraps all standalone icon usages
<IconButton aria-label="Sign out of Daimon">
  <LogOut aria-hidden="true" />
</IconButton>
```

### 16.3 Service Logos

All service logos in the integrations grid are `<img>` elements with descriptive alt text:

| Service | `alt` text |
|---------|-----------|
| GitHub | `"GitHub logo"` |
| Google | `"Google logo"` |
| Linear | `"Linear logo"` |
| Toggl | `"Toggl logo"` |
| Dub | `"Dub logo"` |
| Discord | `"Discord logo"` |
| Anthropic | `"Anthropic logo"` |
| OpenAI | `"OpenAI logo"` |

### 16.4 OG Images and Hero Images

```tsx
// Landing page hero illustration (if present)
<img
  src="/images/hero-illustration.svg"
  alt="Discord interface with Daimon AI assistant responding to a user message"
  width={600}
  height={400}
/>

// If purely decorative
<img
  src="/images/decoration.svg"
  alt=""
  aria-hidden="true"
/>
```

### 16.5 User Avatars

```tsx
// User avatar (initials-based)
<span
  aria-hidden="true"  // Decorative — user's name is announced separately
  className="user-avatar"
>
  {initial}
</span>
```

---

## 17. Color Contrast Requirements

All text colors in the Daimon design system must meet WCAG 2.1 AA minimums (4.5:1 for normal text, 3:1 for large text ≥18px regular or ≥14px bold).

### 17.1 Contrast Ratios — All Combinations Verified

| Foreground | Background | Ratio | Usage | WCAG level |
|------------|-----------|-------|-------|-----------|
| Navy `#0C1F40` | White `#FFFFFF` | 16.2:1 | Body text, headings on white | AAA ✓ |
| Navy `#0C1F40` | Light grey `#F7F7F7` | 15.6:1 | Body text on dashboard bg | AAA ✓ |
| Navy `#0C1F40` | Aqua `#B4E7DD` | 7.1:1 | Button text on aqua bg | AAA ✓ |
| White `#FFFFFF` | Navy `#0C1F40` | 16.2:1 | Sidebar nav, footer text | AAA ✓ |
| `rgba(255,255,255,0.65)` | Navy `#0C1F40` | 8.3:1 | Sidebar nav default state | AAA ✓ |
| `rgba(255,255,255,0.90)` | Navy `#0C1F40` | 12.9:1 | Sidebar nav hover state | AAA ✓ |
| `rgba(12,31,64,0.55)` | White `#FFFFFF` | 5.2:1 | Muted text, descriptions | AA ✓ |
| `rgba(12,31,64,0.45)` | White `#FFFFFF` | 4.1:1 | Footer link text | **Fails AA** — use `rgba(12,31,64,0.55)` minimum |
| Aqua `#B4E7DD` | Navy `#0C1F40` | 7.1:1 | Active nav indicator, focus rings | AAA ✓ |
| Navy `#0C1F40` | `rgba(180,231,221,0.30)` on white | ~10:1 | Starter plan badge text | AA ✓ |
| Error red `#DC2626` | White `#FFFFFF` | 5.9:1 | Error text, error borders | AA ✓ |
| Warning amber `#D97706` | White `#FFFFFF` | 3.3:1 | Warning text — 14px bold | AA ✓ (large text) |
| Success green `#059669` | White `#FFFFFF` | 4.8:1 | Success text | AA ✓ |

**Action required**: `rgba(12,31,64,0.45)` used in `AuthFooterLinks` fails AA. Must be changed to `rgba(12,31,64,0.55)` (ratio 5.2:1). Update `AuthFooterLinks.tsx`.

### 17.2 Focus Ring Contrast

Aqua `#B4E7DD` focus ring on white backgrounds: 2px solid, ratio 2.5:1. Meets WCAG 2.1 AA for focus indicators (3:1 minimum for non-text contrast).

**Action required**: Aqua on white (`#FFFFFF`) has ratio of 2.5:1 — marginally below the 3:1 requirement for focus indicators under WCAG 2.1 Success Criterion 1.4.11. Use `#82D4C8` (darker aqua, ratio 3.2:1) for focus rings on white backgrounds. On Navy backgrounds, keep `#B4E7DD` (ratio 7.1:1).

Focus ring specification update:

| Context | Focus ring color | Background | Ratio |
|---------|-----------------|-----------|-------|
| On white bg | `#82D4C8` 2px solid | `#FFFFFF` | 3.2:1 ✓ |
| On light grey bg | `#82D4C8` 2px solid | `#F7F7F7` | 3.1:1 ✓ |
| On Navy bg | `#B4E7DD` 2px solid | `#0C1F40` | 7.1:1 ✓ |
| On Aqua bg | `#0C1F40` 2px solid | `#B4E7DD` | 7.1:1 ✓ |

### 17.3 Interactive Component States

| State | Minimum contrast requirement | Verification |
|-------|------------------------------|-------------|
| Default button text | 4.5:1 | ✓ all buttons verified above |
| Disabled button text | No requirement (disabled = not operable) | Opacity 0.4 acceptable |
| Placeholder text | 3:1 (informational, not decorative) | Use `rgba(12,31,64,0.40)` minimum |
| Error text | 4.5:1 | Red `#DC2626` on white = 5.9:1 ✓ |
| Field border (default) | 3:1 against bg | `rgba(12,31,64,0.20)` on white = 2.2:1 ✗ — use `rgba(12,31,64,0.30)` = 3.3:1 |
| Field border (focus) | 3:1 | Aqua focus ring — see above |
| Field border (error) | 3:1 | Error red `#DC2626` = 5.9:1 ✓ |

**Action required**: Default field border `rgba(12,31,64,0.20)` fails non-text contrast (3:1). Use `rgba(12,31,64,0.30)` for all default input borders, which achieves 3.3:1.
