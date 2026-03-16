'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlanTier = 'free' | 'starter' | 'pro'

interface ToolEntry {
  name: string
  description: string
  plan: PlanTier
  credential?: string
}

interface ToolCategory {
  id: string
  title: string
  count: number
  tools: ToolEntry[]
}

// ---------------------------------------------------------------------------
// Tool data — 95 tools (89 direct + 6 Linear remote MCP)
// ---------------------------------------------------------------------------

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'discord',
    title: 'Discord (7 tools)',
    count: 7,
    tools: [
      {
        name: 'discord_read_thread',
        description:
          'Read message history from a Discord thread. Returns messages oldest-first with role, display name, username, timestamp, and content.',
        plan: 'free',
      },
      {
        name: 'discord_read_channel',
        description:
          'Read recent messages from a Discord channel. Returns up to 100 messages oldest-first with author info.',
        plan: 'free',
      },
      {
        name: 'discord_parse_link',
        description:
          'Extract IDs from a Discord URL. Use to determine what a link points to (channel vs message/thread) before reading content.',
        plan: 'free',
      },
      {
        name: 'discord_search_messages',
        description:
          'Search messages across the Discord guild by content, author, channel, or content type. Returns up to 25 results per request.',
        plan: 'free',
      },
      {
        name: 'discord_get_message',
        description:
          'Fetch the full content of a single Discord message by channel ID and message ID.',
        plan: 'free',
      },
      {
        name: 'discord_send_message',
        description:
          'Send a message to a Discord text channel (internal channels only — client-facing channels are blocked).',
        plan: 'free',
      },
      {
        name: 'discord_create_thread',
        description:
          'Create a public thread in a Discord channel and post an initial message (internal channels only).',
        plan: 'free',
      },
    ],
  },
  {
    id: 'toggl',
    title: 'Toggl (34 tools)',
    count: 34,
    tools: [
      // Time Entry (7)
      {
        name: 'toggl_get_my_time_entries',
        description:
          'Get time entries for the authenticated Toggl user, optionally filtered by date range (max 90-day range).',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_my_time_entry',
        description: 'Get a single Toggl time entry by ID.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_my_current_time_entry',
        description:
          'Get the currently running Toggl time entry. Returns a hint if no entry is running.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_create_my_time_entry',
        description:
          'Create a new Toggl time entry. Set duration to -1 for a running (open) entry.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_update_my_time_entry',
        description:
          'Update an existing Toggl time entry. Only provided fields are changed.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_stop_my_time_entry',
        description: 'Stop a currently running Toggl time entry.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_bulk_edit_time_entries',
        description:
          'Bulk edit up to 100 Toggl time entries using JSON Patch operations.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      // Project (4)
      {
        name: 'toggl_get_projects',
        description:
          'Get all projects in the Toggl workspace, optionally filtered by active status.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_project',
        description: 'Get a single Toggl project by ID.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_update_project',
        description:
          "Update a Toggl project's metadata (name, color, status, billable, etc.).",
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_create_project',
        description: 'Create a new Toggl project in the workspace.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      // Task (5)
      {
        name: 'toggl_get_tasks',
        description: 'Get all tasks in the Toggl workspace.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_task',
        description: 'Get a single Toggl task by project and task ID.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_project_tasks',
        description: 'Get all tasks for a specific Toggl project.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_create_task',
        description: 'Create a new task under a Toggl project.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_update_task',
        description: "Update a Toggl task's name, status, or time estimate.",
        plan: 'starter',
        credential: 'Toggl API key',
      },
      // Workspace Member (1)
      {
        name: 'toggl_get_workspace_members',
        description:
          'Look up Toggl workspace members by name or list all members. Returns user IDs needed for project assignment.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      // Project User (3)
      {
        name: 'toggl_add_user_to_project',
        description:
          'Add a user to a Toggl project. Use toggl_get_workspace_members to look up user IDs first.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_get_project_users',
        description:
          'List users assigned to a Toggl project, including their project-user association IDs.',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      {
        name: 'toggl_remove_user_from_project',
        description:
          'Remove a user from a Toggl project using the project-user association ID (from toggl_get_project_users).',
        plan: 'starter',
        credential: 'Toggl API key',
      },
      // Workspace Reports (14) — require workspace admin
      {
        name: 'toggl_search_workspace_time_entries',
        description:
          'Search all workspace members\u2019 time entries. Requires Toggl workspace admin. Supports date ranges beyond 1 year (auto-chunked).',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_get_workspace_time_summary',
        description:
          'Get aggregated time summary for all workspace members. Group by users, projects, or clients. Requires workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_workspace_project_summary',
        description:
          'Get per-project/user tracked and billable seconds. Requires Toggl workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_workspace_time_totals',
        description:
          'Get aggregated time totals with optional day/week/month granularity. Requires workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_weekly_report',
        description:
          'Get weekly timesheet per user with daily breakdowns. Requires Toggl workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_export_detailed_csv',
        description:
          'Export detailed time entries as CSV. Requires Toggl workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_export_summary_csv',
        description:
          'Export summary time entries as CSV with optional grouping. Requires Toggl workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_project_trends',
        description:
          'Get project trends comparing current vs previous period. Requires workspace admin. Premium Toggl feature.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_employee_profitability',
        description:
          'Export employee profitability as CSV. Requires workspace admin. Premium Toggl feature.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_project_profitability',
        description:
          'Export project profitability as CSV. Requires workspace admin. Premium Toggl feature.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_list_report_users',
        description:
          'List users available for Toggl report filtering. Requires workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_list_report_projects',
        description:
          'List projects available for Toggl report filtering. Requires workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_list_report_clients',
        description:
          'List clients available for Toggl report filtering. Requires workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
      {
        name: 'toggl_list_project_user_rates',
        description:
          'List project-user rate assignments. Requires Toggl workspace admin.',
        plan: 'pro',
        credential: 'Toggl API key (workspace admin)',
      },
    ],
  },
  {
    id: 'linkedin',
    title: 'LinkedIn (17 tools)',
    count: 17,
    tools: [
      {
        name: 'linkedin_list_posts',
        description:
          'List recent posts from the LinkedIn organization page with text, visibility, and lifecycle state.',
        plan: 'pro',
      },
      {
        name: 'linkedin_create_post',
        description:
          'Create a text or article post on the LinkedIn organization page.',
        plan: 'pro',
      },
      {
        name: 'linkedin_update_post',
        description: 'Update the text of an existing LinkedIn post by URN.',
        plan: 'pro',
      },
      {
        name: 'linkedin_delete_post',
        description: 'Delete a post from the LinkedIn organization page.',
        plan: 'pro',
      },
      {
        name: 'linkedin_get_share_stats',
        description:
          'Get share/post engagement statistics (clicks, likes, comments, impressions) for the LinkedIn organization.',
        plan: 'pro',
      },
      {
        name: 'linkedin_get_follower_stats',
        description:
          'Get follower demographics and growth statistics for the LinkedIn organization.',
        plan: 'pro',
      },
      {
        name: 'linkedin_get_page_stats',
        description:
          'Get page view statistics for the LinkedIn organization page (desktop, mobile, total).',
        plan: 'pro',
      },
      {
        name: 'linkedin_list_ad_accounts',
        description:
          'List LinkedIn ad accounts accessible to the organization.',
        plan: 'pro',
      },
      {
        name: 'linkedin_list_campaigns',
        description:
          'List campaigns in a LinkedIn ad account, optionally filtered by status.',
        plan: 'pro',
      },
      {
        name: 'linkedin_create_campaign',
        description: 'Create a new campaign in a LinkedIn ad account.',
        plan: 'pro',
      },
      {
        name: 'linkedin_update_campaign',
        description:
          'Update a LinkedIn ad campaign (pause, resume, change budget).',
        plan: 'pro',
      },
      {
        name: 'linkedin_get_ad_analytics',
        description:
          'Get ad performance analytics with configurable pivots, date ranges, and metrics.',
        plan: 'pro',
      },
      {
        name: 'linkedin_get_lead_form_responses',
        description:
          'Get lead form responses from LinkedIn Lead Gen Forms for a sponsored account.',
        plan: 'pro',
      },
      {
        name: 'linkedin_send_conversions',
        description:
          'Send conversion events to LinkedIn for offline/online attribution tracking.',
        plan: 'pro',
      },
      {
        name: 'linkedin_list_events',
        description: 'List events for the LinkedIn organization.',
        plan: 'pro',
      },
      {
        name: 'linkedin_create_event',
        description:
          'Create a new event on the LinkedIn organization page.',
        plan: 'pro',
      },
      {
        name: 'linkedin_search_ad_library',
        description:
          'Search the LinkedIn Ad Library for public ad transparency data by query or advertiser name.',
        plan: 'pro',
      },
    ],
  },
  {
    id: 'google-analytics',
    title: 'Google Analytics (4 tools)',
    count: 4,
    tools: [
      {
        name: 'ga_run_report',
        description:
          'Run a custom Google Analytics 4 report with any combination of GA4 dimensions and metrics.',
        plan: 'pro',
      },
      {
        name: 'ga_get_traffic_overview',
        description:
          'Get GA4 traffic overview: sessions and users broken down by channel group and source/medium.',
        plan: 'pro',
      },
      {
        name: 'ga_get_top_pages',
        description:
          'Get the top pages on the site by pageviews for a date range.',
        plan: 'pro',
      },
      {
        name: 'ga_get_campaign_performance',
        description:
          'Get GA4 campaign performance: sessions, users, conversions, and revenue broken down by campaign.',
        plan: 'pro',
      },
    ],
  },
  {
    id: 'fly',
    title: 'Fly.io (9 tools)',
    count: 9,
    tools: [
      {
        name: 'fly_launch_session',
        description:
          'Launch a new ephemeral session on Fly.io from a template. Creates a Fly app with a running machine.',
        plan: 'starter',
      },
      {
        name: 'fly_stop_session',
        description:
          'Stop and permanently delete a Fly.io session app and all its resources.',
        plan: 'starter',
      },
      {
        name: 'fly_get_session_status',
        description:
          'Get the status of a Fly.io session: machine state, region, and access URLs.',
        plan: 'starter',
      },
      {
        name: 'fly_list_sessions',
        description:
          'List all active Fly.io sessions (running mmm-* apps) with their status.',
        plan: 'starter',
      },
      {
        name: 'fly_list_images',
        description:
          'List available Docker images from template apps for launching new sessions.',
        plan: 'starter',
      },
      {
        name: 'fly_list_templates',
        description:
          'List available session templates. Returns system templates and saved user templates.',
        plan: 'starter',
      },
      {
        name: 'fly_save_template',
        description:
          'Save a deployed Fly app as a reusable template for future session launches.',
        plan: 'starter',
      },
      {
        name: 'fly_delete_template',
        description:
          'Delete a saved session template. Only the creator can delete their templates.',
        plan: 'starter',
      },
      {
        name: 'fly_launch_builder',
        description:
          'Launch a Docker-in-Docker builder session with Docker, git, and Claude for building and deploying apps.',
        plan: 'starter',
      },
    ],
  },
  {
    id: 'acp',
    title: 'ACP — Agent Communication Protocol (4 tools)',
    count: 4,
    tools: [
      {
        name: 'acp_health_check',
        description:
          'Check if the ACP server is healthy on a Fly.io session before sending messages.',
        plan: 'starter',
      },
      {
        name: 'acp_list_tools',
        description:
          'List tools available to session Claude via ACP. Discover what capabilities a remote session has.',
        plan: 'starter',
      },
      {
        name: 'acp_send_message',
        description:
          'Send a message to session Claude via ACP for Claude-to-Claude communication with remote sessions.',
        plan: 'starter',
      },
      {
        name: 'acp_call_tool',
        description:
          'Call a specific tool on a remote session via ACP without going through Claude.',
        plan: 'starter',
      },
    ],
  },
  {
    id: 'decision-hub',
    title: 'Decision Hub (4 tools)',
    count: 4,
    tools: [
      {
        name: 'decision_hub_search_skills',
        description:
          'Search Decision Hub for skills matching a natural language query. Returns skill names, descriptions, and org slugs.',
        plan: 'starter',
      },
      {
        name: 'decision_hub_activate_skill',
        description:
          'Activate a Decision Hub skill for the current conversation. Downloads and injects skill instructions.',
        plan: 'starter',
      },
      {
        name: 'decision_hub_list_active_skills',
        description:
          'List Decision Hub skills currently active in this conversation.',
        plan: 'starter',
      },
      {
        name: 'decision_hub_deactivate_skill',
        description:
          'Deactivate a Decision Hub skill from the current conversation.',
        plan: 'starter',
      },
    ],
  },
  {
    id: 'onyx',
    title: 'Onyx (2 tools)',
    count: 2,
    tools: [
      {
        name: 'onyx_list_agents',
        description:
          'List available Onyx knowledge base agents with their IDs, names, descriptions, and document sets.',
        plan: 'starter',
      },
      {
        name: 'onyx_query',
        description:
          'Query the organization knowledge base via Onyx RAG. Returns an answer with citations from source documents.',
        plan: 'starter',
      },
    ],
  },
  {
    id: 'bluedot',
    title: 'Bluedot (4 tools)',
    count: 4,
    tools: [
      {
        name: 'bluedot_list_meetings',
        description:
          'List all accessible Bluedot meetings (newest first) with date, title, duration, attendees, and content availability.',
        plan: 'pro',
      },
      {
        name: 'bluedot_get_transcript',
        description:
          'Get the full speaker-attributed transcript of a Bluedot meeting.',
        plan: 'pro',
      },
      {
        name: 'bluedot_get_summary',
        description:
          'Get the AI-generated summary of a Bluedot meeting with action items and key points.',
        plan: 'pro',
      },
      {
        name: 'bluedot_search_transcripts',
        description:
          'Search across all accessible Bluedot transcripts and summaries for a keyword or phrase.',
        plan: 'pro',
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub (1 tool)',
    count: 1,
    tools: [
      {
        name: 'github_run_gh',
        description:
          'Run a GitHub CLI (gh) command using the requesting user\u2019s GitHub OAuth credentials.',
        plan: 'starter',
        credential: 'GitHub OAuth',
      },
    ],
  },
  {
    id: 'linear',
    title: 'Linear — Remote MCP (6 tools)',
    count: 6,
    tools: [
      {
        name: 'linear_list_issues',
        description:
          'List Linear issues, optionally filtered by team. Returns titles, states, assignees, and priorities.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
      {
        name: 'linear_search_issues',
        description:
          'Search Linear issues by text query across titles and descriptions.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
      {
        name: 'linear_get_issue',
        description:
          'Get a single Linear issue by ID or identifier (e.g. BAI-42) with full details and comments.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
      {
        name: 'linear_create_issue',
        description:
          'Create a new Linear issue with optional description, priority, assignee, and labels.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
      {
        name: 'linear_update_issue',
        description:
          'Update an existing Linear issue: title, description, priority, state, or assignee.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
      {
        name: 'linear_list_teams',
        description:
          'List all Linear teams in the workspace with team names, keys, and available workflow states.',
        plan: 'starter',
        credential: 'Linear OAuth',
      },
    ],
  },
  {
    id: 'dub',
    title: 'Dub.co (2 tools)',
    count: 2,
    tools: [
      {
        name: 'dub_list_links',
        description:
          'List Dub.co short links with UTM parameters and aggregate stats (clicks, leads, sales).',
        plan: 'starter',
      },
      {
        name: 'dub_get_analytics',
        description:
          'Get aggregated Dub.co analytics grouped by time, geography, device, browser, UTM parameters, or referrer.',
        plan: 'starter',
      },
    ],
  },
  {
    id: 'credentials',
    title: 'Credentials (1 tool)',
    count: 1,
    tools: [
      {
        name: 'get_credential',
        description:
          'Get the requesting user\u2019s API token for a platform. Use when writing ad-hoc scripts that call platform APIs directly.',
        plan: 'free',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Plan badge
// ---------------------------------------------------------------------------

const PLAN_COLORS: Record<PlanTier, { bg: string; text: string; label: string }> =
  {
    free: { bg: 'hsl(var(--muted))', text: 'hsl(var(--foreground))', label: 'Free' },
    starter: { bg: 'hsl(var(--primary) / 0.3)', text: '#0D6E5E', label: 'Starter' },
    pro: { bg: 'rgba(246, 174, 114, 0.25)', text: '#8B4400', label: 'Pro' },
  }

function PlanBadge({ plan }: { plan: PlanTier }) {
  const c = PLAN_COLORS[plan]
  return (
    <span
      className="font-body text-sm font-semibold inline-block py-0.5 px-2 rounded-sm whitespace-nowrap shrink-0"
      style={{
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {c.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ToolRow
// ---------------------------------------------------------------------------

function ToolRow({ tool }: { tool: ToolEntry }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-100">
      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <code
          className="text-sm font-semibold font-mono text-foreground bg-muted py-0.5 px-1.5 rounded-sm inline-block mb-1"
        >
          {tool.name}
        </code>
        {tool.credential && (
          <span
            className="font-body text-sm text-gray-400 ml-2"
          >
            Requires: {tool.credential}
          </span>
        )}
        <p
          className="font-body text-sm text-gray-600 leading-normal m-0"
        >
          {tool.description}
        </p>
      </div>

      {/* Plan badge */}
      <PlanBadge plan={tool.plan} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategorySection (collapsible)
// ---------------------------------------------------------------------------

function CategorySection({
  category,
  isOpen,
  onToggle,
  matchCount,
  visibleTools,
}: {
  category: ToolCategory
  isOpen: boolean
  onToggle: () => void
  matchCount: number
  visibleTools: ToolEntry[]
}) {
  if (matchCount === 0) return null

  return (
    <section className="mb-2">
      {/* Header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center gap-2 w-full py-3 px-4 bg-gray-50 border border-border cursor-pointer text-left transition-colors duration-150"
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            '#F3F4F6')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            '#F9FAFB')
        }
      >
        {isOpen ? (
          <ChevronDown size={16} color="#6B7280" />
        ) : (
          <ChevronRight size={16} color="#6B7280" />
        )}
        <span
          className="font-headline text-sm font-bold text-foreground flex-1"
        >
          {category.title}
        </span>
        {matchCount < category.count && (
          <span
            className="font-body text-sm text-gray-400"
          >
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </span>
        )}
      </button>

      {/* Tools list */}
      {isOpen && (
        <div className="border border-border border-t-0 px-4 bg-white">

          {visibleTools.map((tool) => (
            <ToolRow key={tool.name} tool={tool} />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ToolReferencePage() {
  const [query, setQuery] = useState('')
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(TOOL_CATEGORIES.map((c) => c.id)),
  )

  const q = query.toLowerCase().trim()

  // Filter tools by query
  const filteredCategories = TOOL_CATEGORIES.map((cat) => {
    const visible = q
      ? cat.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.credential?.toLowerCase().includes(q) ?? false),
        )
      : cat.tools
    return { ...cat, visible, matchCount: visible.length }
  })

  const totalVisible = filteredCategories.reduce(
    (sum, c) => sum + c.matchCount,
    0,
  )

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // When searching, auto-open matching sections
  function handleQueryChange(val: string) {
    setQuery(val)
    if (val.trim()) {
      // Open any section that has matches
      const matching = TOOL_CATEGORIES.filter((cat) =>
        cat.tools.some(
          (t) =>
            t.name.toLowerCase().includes(val.toLowerCase()) ||
            t.description.toLowerCase().includes(val.toLowerCase()),
        ),
      ).map((c) => c.id)
      setOpenSections(new Set(matching))
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-10">
        <div
          className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2"
        >
          Tool Reference
        </div>
        <h1
          className="font-headline text-[clamp(28px,4vw,40px)] font-black text-foreground leading-tight mt-0 mb-4"
        >
          All Tools
        </h1>
        <p
          className="font-body text-base text-gray-500 m-0 leading-relaxed"
        >
          Complete reference for all 95 tools available in Daimon, organized by
          platform. Search by name, description, or integration.
        </p>
      </header>

      {/* Plan legend */}
      <div className="flex gap-4 flex-wrap mb-8 py-3.5 px-4 bg-gray-50 border border-border">

        <span
          className="font-body text-sm font-semibold text-gray-500 self-center"
        >
          Plan required:
        </span>
        {(Object.keys(PLAN_COLORS) as PlanTier[]).map((tier) => (
          <div
            key={tier}
            className="flex items-center gap-1.5"
          >
            <PlanBadge plan={tier} />
            <span
              className="font-body text-sm text-gray-500"
            >
              {tier === 'free'
                ? 'All plans'
                : tier === 'starter'
                  ? 'Starter or Pro'
                  : 'Pro only'}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          color="#9CA3AF"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          type="search"
          placeholder="Search tools by name or description…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="font-body text-sm w-full h-11 pl-[38px] border border-gray-300 bg-white text-foreground outline-none box-border"
          style={{
            paddingRight: query ? '38px' : '12px',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary))')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setOpenSections(new Set(TOOL_CATEGORIES.map((c) => c.id)))
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex"
          >
            <X size={14} color="#9CA3AF" />
          </button>
        )}
      </div>

      {/* Results count when searching */}
      {q && (
        <p
          className="font-body text-sm text-gray-400 mb-4"
        >
          {totalVisible === 0
            ? 'No tools found.'
            : `${totalVisible} tool${totalVisible !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Categories */}
      <div>
        {filteredCategories.map(({ visible, matchCount, ...cat }) => (
          <CategorySection
            key={cat.id}
            category={cat}
            isOpen={openSections.has(cat.id)}
            onToggle={() => toggleSection(cat.id)}
            matchCount={matchCount}
            visibleTools={visible}
          />
        ))}
      </div>

      {/* Footer nav */}
      <nav
        aria-label="Page navigation"
        className="flex justify-between mt-16 pt-8 border-t border-border"
      >
        <a
          className="font-body text-sm font-medium text-foreground no-underline"
          href="/docs/quick-start"
          aria-label="Previous page: Quick Start"
        >
          ← Quick Start
        </a>
        <a
          className="font-body text-sm font-medium text-foreground no-underline"
          href="/docs/faq"
          aria-label="Next page: FAQ"
        >
          FAQ →
        </a>
      </nav>
    </div>
  )
}
