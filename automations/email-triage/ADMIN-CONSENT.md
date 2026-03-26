# Admin Consent Required: Triage Agent

## What This Is

A personal email triage tool that uses Microsoft Graph API to read, categorize, and draft replies to emails. It runs locally via Claude Code — no data leaves the local machine except API calls to Microsoft Graph.

## What I Need

An Azure AD admin to grant **admin consent** for the "Triage Agent" app registration so it can access my mailbox via Microsoft Graph.

## App Details

- **App Name**: Triage Agent
- **Application (client) ID**: `abdaac54-f4ee-4864-a8f5-695326ea3584`
- **Directory (tenant) ID**: `55b8ebc8-9489-44c0-9b3b-40152f96f651`
- **Object ID**: `894661b5-7c91-4b6b-a288-4fe7d9bc106a`

## Permissions Requested

All **delegated** (user-level, not application-level):

| Permission | Type | What It Does |
|---|---|---|
| `Mail.Read` | Delegated | Read the signed-in user's email |
| `Mail.ReadWrite` | Delegated | Read/write (categorize, flag) the signed-in user's email |
| `Mail.Send` | Delegated | Send mail as the signed-in user |

These are **delegated permissions** — they only work on behalf of a signed-in user and only access that user's mailbox. No other user's data is accessible.

## Step-by-Step Guide for the Admin

### Option A: Grant consent via Azure Portal (recommended)

1. Sign in to [Azure Portal](https://portal.azure.com) with an admin account
2. Go to **Azure Active Directory** → **App registrations**
3. Search for **"Triage Agent"** (or use client ID `abdaac54-f4ee-4864-a8f5-695326ea3584`)
4. Click on the app to open it
5. Go to **API permissions** in the left sidebar
6. Verify the permissions listed are `Mail.Read`, `Mail.ReadWrite`, and `Mail.Send` — all **Delegated**
7. Click **"Grant admin consent for [organization name]"**
8. Click **Yes** to confirm
9. Verify the **Status** column now shows a green checkmark with "Granted for [organization name]"

### Option B: Grant consent via the Microsoft consent URL

Open this URL in a browser while signed in as an admin:

```
https://login.microsoftonline.com/55b8ebc8-9489-44c0-9b3b-40152f96f651/adminconsent?client_id=abdaac54-f4ee-4864-a8f5-695326ea3584
```

This will show a consent prompt listing the requested permissions. Click **Accept**.

### Option C: Grant consent for just one user

If org-wide consent is not desired, the admin can consent on behalf of just one user:

1. Go to **Azure Active Directory** → **Enterprise applications**
2. Find **"Triage Agent"**
3. Go to **Permissions** → **Grant admin consent**
4. Or go to **Users and groups** → add the specific user, then grant consent

## After Consent Is Granted

Let me know and I'll complete the OAuth device-code sign-in flow. No further admin action needed after this one-time consent.
