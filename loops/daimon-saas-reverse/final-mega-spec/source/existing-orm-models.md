# Existing ORM Models and Repository Patterns

Source: `projects/decision-orchestrator/apps/bot/src_v2/db/`

## Architecture Overview

The bot uses **SQLAlchemy 2.0 declarative ORM** with a strict two-layer pattern:

1. **ORM Layer** (`db/models/*_orm.py`) — SQLAlchemy `DeclarativeBase` subclasses. Never returned directly to callers.
2. **Schema Layer** (`db/models/*.py`) — Pydantic `BaseModel` subclasses. The public boundary type returned by all repositories.
3. **Repository Layer** (`db/repositories/*.py`) — Flat functions taking a live `Session`. Convert ORM → Pydantic before returning.

### Base Class

File: `db/models/base.py`

```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Base class for all v2 ORM models."""
    pass
```

All ORM models inherit from this `Base`.

### Pattern Rules

- Repositories accept `sqlalchemy.orm.Session` as first argument (never `AsyncSession`).
- Repositories never return ORM instances to callers — always convert to Pydantic via private `_to_pydantic()` helper.
- `session.flush()` is called after mutations; `session.commit()` is called only in specific write repositories (Bluedot) where the function owns the transaction boundary.
- `session.refresh(row)` is called after flush to populate server-defaults (e.g., `gen_random_uuid()`, `now()`).
- PostgreSQL-specific upserts use `sqlalchemy.dialects.postgresql.insert` with `.on_conflict_do_update()`.

---

## ORM Models

### `UserProfileORM`

File: `db/models/user_profile_orm.py`
Table: `user_profiles`

```python
class UserProfileORM(Base):
    __tablename__ = "user_profiles"

    user_id:    Mapped[uuid.UUID]  # PK, UUID, NOT NULL
    is_admin:   Mapped[bool]       # Boolean, NOT NULL, server_default=false
    created_at: Mapped[datetime]   # TIMESTAMP WITH TIME ZONE, server_default=now()
```

Pydantic schema: `UserProfile` (`db/models/user_profile.py`)
```python
class UserProfile(BaseModel):
    user_id:    uuid.UUID
    is_admin:   bool = False
    created_at: datetime | None = None
```

---

### `UserIdentityDiscordORM`

File: `db/models/user_identity_discord_orm.py`
Table: `user_identity_discord`

```python
class UserIdentityDiscordORM(Base):
    __tablename__ = "user_identity_discord"

    id:               Mapped[uuid.UUID]    # PK, UUID, server_default=gen_random_uuid()
    user_id:          Mapped[uuid.UUID]    # UUID, UNIQUE, NOT NULL — FK to auth.users
    discord_id:       Mapped[str]          # String, UNIQUE, NOT NULL
    discord_username: Mapped[str | None]   # String, nullable
    created_at:       Mapped[datetime]     # TIMESTAMP WITH TIME ZONE, server_default=now()
```

Pydantic schema: `UserIdentityDiscord` (`db/models/user_identity_discord.py`)
```python
class UserIdentityDiscord(BaseModel):
    id:               uuid.UUID | None = None
    user_id:          uuid.UUID
    discord_id:       str
    discord_username: str | None = None
    created_at:       datetime | None = None
```

---

### `UserCredentialORM`

File: `db/models/user_credentials_orm.py`
Table: `user_credentials`

```python
class UserCredentialORM(Base):
    __tablename__ = "user_credentials"

    id:              Mapped[uuid.UUID]       # PK, UUID, server_default=gen_random_uuid()
    user_id:         Mapped[uuid.UUID]       # UUID, NOT NULL — FK to auth.users
    platform:        Mapped[str]             # String, NOT NULL — e.g. "toggl", "github"
    vault_secret_id: Mapped[uuid.UUID]       # UUID, NOT NULL — FK to vault.secrets
    metadata_:       Mapped[dict[str, Any]]  # JSONB column named "metadata", server_default='{}'
    created_at:      Mapped[datetime]        # TIMESTAMP WITH TIME ZONE, server_default=now()
    updated_at:      Mapped[datetime]        # TIMESTAMP WITH TIME ZONE, server_default=now()
```

Note: Python attribute is `metadata_` (underscore suffix to avoid collision with SQLAlchemy's built-in `metadata`); PostgreSQL column name is `metadata`.

Pydantic schema: `UserCredential` (`db/models/user_credentials.py`)
```python
class UserCredential(BaseModel):
    id:              uuid.UUID | None = None
    user_id:         uuid.UUID
    platform:        str
    vault_secret_id: uuid.UUID
    metadata:        dict[str, Any] = {}
    created_at:      datetime | None = None
    updated_at:      datetime | None = None
```

#### Platform-Specific Metadata Models

File: `db/models/credential_metadata.py`

Typed models for the `metadata` JSONB field per platform. Callers validate via these at read/write boundaries; the ORM column itself remains `dict[str, Any]`.

```python
class TogglCredentialMetadata(BaseModel):
    toggl_user_id:                int
    toggl_default_workspace_id:   int | None = None
    toggl_fullname:                str | None = None
    toggl_email:                   str | None = None
    toggl_workspace_role:          str | None = None
```

Platform values (from `CredentialPlatform` enum in `core/auth/`): `toggl`, `github`, `google`, `linear`.
Each platform has a corresponding metadata model pattern. Toggl is the only one currently defined in `credential_metadata.py`; OAuth platforms (github, google, linear) store tokens directly in Vault with minimal non-secret metadata.

---

### `DirectMessageSessionORM`

File: `db/models/dm_session_orm.py`
Table: `direct_message_sessions`

```python
class DirectMessageSessionORM(Base):
    __tablename__ = "direct_message_sessions"

    id:               Mapped[uuid.UUID]  # PK, UUID, server_default=gen_random_uuid()
    platform:         Mapped[str]        # String, NOT NULL, server_default='discord'
    platform_user_id: Mapped[str]        # String, NOT NULL
    started_at:       Mapped[datetime]   # TIMESTAMP WITH TIME ZONE, server_default=now()
    session_uuid:     Mapped[str]        # String, NOT NULL — Langfuse session ID
```

Unique constraint: `(platform, platform_user_id)` — enforced via upsert conflict target in repository.

Pydantic schema: `DirectMessageSession` (`db/models/dm_session.py`)
```python
class DirectMessageSession(BaseModel):
    id:               uuid.UUID | None = None
    platform:         str
    platform_user_id: str
    started_at:       datetime | None = None
    session_uuid:     str
```

---

### `ScheduledTaskORM`

File: `db/models/scheduled_task_orm.py`
Table: `scheduled_tasks`

```python
class ScheduledTaskORM(Base):
    __tablename__ = "scheduled_tasks"

    id:               Mapped[uuid.UUID]       # PK, UUID, server_default=gen_random_uuid()
    user_discord_id:  Mapped[str]             # String, NOT NULL
    guild_id:         Mapped[str]             # String, NOT NULL
    prompt:           Mapped[str]             # Text, NOT NULL
    cron_expression:  Mapped[str]             # String, NOT NULL — e.g. "0 9 * * 1-5"
    schedule_display: Mapped[str]             # String, NOT NULL — human-readable
    timezone:         Mapped[str]             # String, NOT NULL — IANA timezone name
    is_enabled:       Mapped[bool]            # Boolean, NOT NULL, server_default=true
    next_run:         Mapped[datetime]        # TIMESTAMP WITH TIME ZONE, NOT NULL
    last_run:         Mapped[datetime | None] # TIMESTAMP WITH TIME ZONE, nullable
    created_at:       Mapped[datetime]        # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
```

Pydantic schema: `ScheduledTask` (`db/models/scheduled_task.py`)
```python
class ScheduledTask(BaseModel):
    id:               uuid.UUID
    user_discord_id:  str
    guild_id:         str
    prompt:           str
    cron_expression:  str
    schedule_display: str
    timezone:         TimeZoneName  # from pydantic_extra_types
    is_enabled:       bool
    next_run:         datetime
    last_run:         datetime | None = None
    created_at:       datetime
```

---

### `AdminImpersonationSessionORM`

File: `db/models/admin_impersonation_session_orm.py`
Table: `admin_impersonation_sessions`

```python
class AdminImpersonationSessionORM(Base):
    __tablename__ = "admin_impersonation_sessions"

    id:             Mapped[uuid.UUID]  # PK, UUID, server_default=gen_random_uuid()
    admin_user_id:  Mapped[uuid.UUID]  # UUID, NOT NULL, UNIQUE — one session per admin
    target_user_id: Mapped[uuid.UUID]  # UUID, NOT NULL
    created_at:     Mapped[datetime]   # TIMESTAMP WITH TIME ZONE, nullable, server_default=now()
```

UNIQUE constraint on `admin_user_id` enforces one-active-impersonation-per-admin.

Pydantic schema: `AdminImpersonationSession` (`db/models/admin_impersonation_session.py`)
```python
class AdminImpersonationSession(BaseModel):
    id:             uuid.UUID | None = None
    admin_user_id:  uuid.UUID
    target_user_id: uuid.UUID
    created_at:     datetime | None = None
```

---

### `ConversationSkillORM`

File: `db/models/conversation_skills_orm.py`
Table: `conversation_skills`

```python
class ConversationSkillORM(Base):
    __tablename__ = "conversation_skills"
    __table_args__ = (UniqueConstraint("conversation_id", "org", "skill_name"),)

    id:              Mapped[uuid.UUID]  # PK, UUID, server_default=gen_random_uuid()
    conversation_id: Mapped[str]        # String, NOT NULL — Discord thread/channel ID
    org:             Mapped[str]        # String, NOT NULL — Decision Hub org slug
    skill_name:      Mapped[str]        # String, NOT NULL — Decision Hub skill identifier
    activated_at:    Mapped[datetime]   # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
```

UNIQUE constraint on `(conversation_id, org, skill_name)`.

Pydantic schema: `ConversationSkill` (`db/models/conversation_skills.py`)
```python
class ConversationSkill(BaseModel):
    id:              str       # UUID cast to str at boundary
    conversation_id: str
    org:             str
    skill_name:      str
    activated_at:    datetime
```

---

### `SessionTemplateORM`

File: `db/models/session_templates.py` (note: ORM in same file, no separate `_orm.py`)
Table: `session_templates`

```python
class SessionTemplateORM(Base):
    __tablename__ = "session_templates"

    id:                       Mapped[PyUUID]        # PK, UUID, server_default=gen_random_uuid()
    slug:                     Mapped[str]            # Text, UNIQUE, NOT NULL
    name:                     Mapped[str]            # Text, NOT NULL
    description:              Mapped[str | None]     # Text, nullable
    fly_app:                  Mapped[str]            # Text, NOT NULL — Fly.io app name
    features:                 Mapped[list[str]]      # ARRAY(Text), NOT NULL, server_default='{}'
    source_repos:             Mapped[list[str]]      # ARRAY(Text), NOT NULL, server_default='{}'
    framework:                Mapped[str | None]     # Text, nullable
    created_by_discord_id:    Mapped[str | None]     # Text, nullable
    created_by_discord_name:  Mapped[str | None]     # Text, nullable
    is_public:                Mapped[bool]           # Boolean, NOT NULL, server_default=false
    created_at:               Mapped[datetime]       # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
    updated_at:               Mapped[datetime]       # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
    last_launched_at:         Mapped[datetime | None]# TIMESTAMP WITH TIME ZONE, nullable
    launch_count:             Mapped[int]            # Integer, NOT NULL, server_default=0
```

---

### `DiscordChannelMappingORM`

File: `db/models/discord_channel_mapping_orm.py`
Table: `discord_channel_mapping`

```python
class DiscordChannelMappingORM(Base):
    __tablename__ = "discord_channel_mapping"

    id:                  Mapped[PyUUID]   # PK, UUID, server_default=gen_random_uuid()
    client_channel_id:   Mapped[int]      # BigInteger, UNIQUE, NOT NULL — client-facing Discord channel
    internal_channel_id: Mapped[int]      # BigInteger, NOT NULL — internal team channel
    server_id:           Mapped[int]      # BigInteger, NOT NULL — Discord guild ID
    is_enabled:          Mapped[bool]     # Boolean, NOT NULL, default=True, server_default=true
    created_at:          Mapped[datetime] # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
    updated_at:          Mapped[datetime] # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
```

This table routes client-facing Discord channels to internal team channels. The bot reads this at startup to build an in-memory routing map. No Pydantic schema — repository returns `dict[int, int]` (client → internal).

---

### `BluedotTranscriptORM` and `BluedotMeetingORM`

File: `db/models/bluedot.py`

Two ORM models for one underlying table (`bluedot_transcripts`) and its privacy-filtered view (`bluedot_accessible_meetings`).

#### `BluedotTranscriptORM` (writes/tests)
Table: `bluedot_transcripts`

```python
class BluedotTranscriptORM(Base):
    __tablename__ = "bluedot_transcripts"

    id:                 Mapped[PyUUID]           # PK, UUID, server_default=gen_random_uuid()
    meeting_id:         Mapped[str]              # Text, UNIQUE, NOT NULL
    video_id:           Mapped[str | None]       # Text, nullable
    title:              Mapped[str | None]       # Text, nullable
    attendees:          Mapped[list[str] | None] # JSONB, nullable — list of email strings
    duration:           Mapped[float | None]     # Numeric, nullable — minutes
    meeting_created_at: Mapped[datetime | None]  # TIMESTAMP WITH TIME ZONE, nullable
    transcript:         Mapped[list[dict] | None]# JSONB, nullable — [{speaker, text}, ...]
    transcript_text:    Mapped[str | None]       # Text, nullable — flattened for ILIKE search
    has_transcript:     Mapped[bool]             # Boolean, NOT NULL
    summary:            Mapped[str | None]       # Text, nullable
    summary_v2:         Mapped[str | None]       # Text, nullable
    has_summary:        Mapped[bool]             # Boolean, NOT NULL
    webhook_type:       Mapped[str | None]       # Text, nullable
    raw_payload:        Mapped[dict | None]      # JSONB, nullable — full Bluedot webhook payload
    created_at:         Mapped[datetime]         # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
    updated_at:         Mapped[datetime]         # TIMESTAMP WITH TIME ZONE, NOT NULL, server_default=now()
```

#### `BluedotMeetingORM` (reads — maps to view)
Table/View: `bluedot_accessible_meetings`

Identical columns to `BluedotTranscriptORM` but mapped to the privacy-filtered view. This is the only ORM model used by MCP tools for secure read access. Privacy filtering logic: rows where `raw_payload._validation.is_accessible = 'false'` are excluded by the view.

---

## Repository Functions

### `user_profile` repository

File: `db/repositories/user_profile.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_user_id` | `(session, user_id: UUID) -> UserProfile \| None` | Look up profile by Supabase Auth user_id |
| `create_profile` | `(session, *, user_id: UUID, is_admin: bool = False) -> UserProfile` | Insert new profile row |

Pattern: flush + refresh after insert.

---

### `user_identity` repository

File: `db/repositories/user_identity.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_discord_id` | `(session, discord_id: str) -> UserIdentityDiscord \| None` | Look up by Discord user ID |
| `get_by_user_id` | `(session, user_id: UUID) -> UserIdentityDiscord \| None` | Look up by Supabase user_id |
| `create_identity` | `(session, *, user_id, discord_id, discord_username=None) -> UserIdentityDiscord` | Create identity link |

---

### `user_credentials` repository

File: `db/repositories/user_credentials.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_user_and_platform` | `(session, user_id, platform) -> UserCredential \| None` | Get credential for specific user+platform |
| `get_all_for_user` | `(session, user_id) -> list[UserCredential]` | All credentials for a user |
| `create_credential` | `(session, *, user_id, platform, vault_secret_id, metadata=None) -> UserCredential` | Create new credential record |
| `upsert_credential` | `(session, *, user_id, platform, vault_secret_id, metadata=None) -> UserCredential` | Create or update by (user_id, platform) |

Upsert logic: manual select-then-update (not PostgreSQL `ON CONFLICT`) because there is no unique constraint on `(user_id, platform)` at the DB level — uniqueness is enforced via Python select-first pattern.

---

### `dm_session` repository

File: `db/repositories/dm_session.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_platform_user` | `(session, *, platform, platform_user_id) -> DirectMessageSession \| None` | Get session for platform+user |
| `upsert` | `(session, *, platform, platform_user_id, session_uuid) -> DirectMessageSession` | Create or reset session — resets `started_at` to NOW() |

Upsert implementation: uses `INSERT ... ON CONFLICT DO UPDATE` with `index_elements=["platform", "platform_user_id"]`. On conflict: sets `session_uuid` to new UUID and `started_at` to `NOW()`.

---

### `scheduled_task` repository

File: `db/repositories/scheduled_task.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `create` | `(session, *, user_discord_id, guild_id, prompt, cron_expression, schedule_display, timezone, next_run) -> ScheduledTask` | Insert new task |
| `get_by_id` | `(session, *, task_id) -> ScheduledTask \| None` | Get by UUID |
| `list_by_user_guild` | `(session, *, user_discord_id, guild_id) -> list[ScheduledTask]` | All tasks for user+guild, ordered by `created_at` |
| `load_due_tasks` | `(session) -> list[ScheduledTask]` | Tasks with `next_run <= now AND next_run >= now - 1h AND is_enabled = true` |
| `update_next_run` | `(session, *, task_id, next_run) -> None` | Advance next_run, set `last_run` to now |
| `update_is_enabled` | `(session, *, task_id, is_enabled) -> None` | Toggle enabled flag |
| `update_task` | `(session, *, task_id, prompt, cron_expression, schedule_display, next_run) -> None` | Update prompt + schedule |
| `delete` | `(session, *, task_id) -> bool` | Delete task; returns True if row deleted |

Grace window: `load_due_tasks` accepts tasks up to 1 hour late (grace_cutoff = now - timedelta(hours=1)).

---

### `admin_impersonation` repository

File: `db/repositories/admin_impersonation.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_admin_user_id` | `(session, admin_user_id) -> AdminImpersonationSession \| None` | Get active session for admin |
| `upsert_session` | `(session, *, admin_user_id, target_user_id) -> AdminImpersonationSession` | Create or update impersonation (replaces target) |
| `delete_session` | `(session, admin_user_id) -> None` | End impersonation; no-op if none exists |

---

### `vault` repository

File: `db/repositories/vault.py`

Vault uses raw SQL (`session.execute(text(...))`) — not ORM — because `vault.secrets` is in a separate PostgreSQL schema.

| Function | Signature | Description |
|----------|-----------|-------------|
| `create_secret` | `(session, *, name, secret, description="") -> uuid.UUID` | Calls `vault.create_secret(secret, name, description)` → returns UUID of new vault row |
| `get_decrypted_secret` | `(session, secret_id) -> str \| None` | SELECT from `vault.decrypted_secrets` WHERE id = :id → returns plaintext |
| `delete_secret` | `(session, secret_id) -> None` | DELETE FROM `vault.secrets` WHERE id = :id |

Vault SQL:
```sql
-- Create
SELECT vault.create_secret(:secret, :name, :description)

-- Read (decrypted)
SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = :id

-- Delete
DELETE FROM vault.secrets WHERE id = :id
```

---

### `conversation_skills` repository

File: `db/repositories/conversation_skills.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `save_conversation_skill` | `(session, *, conversation_id, org, skill_name) -> ConversationSkill` | Activate skill via `INSERT ON CONFLICT DO NOTHING`; fetches if already existed |
| `load_conversation_skills` | `(session, *, conversation_id) -> list[ConversationSkill]` | All active skills for a conversation |
| `delete_conversation_skill` | `(session, *, conversation_id, org, skill_name) -> bool` | Deactivate skill; returns True if row deleted |

---

### `discord_channel_mapping` repository

File: `db/repositories/discord_channel_mapping.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `load_enabled_mappings` | `(session) -> dict[int, int]` | All enabled mappings as `client_channel_id → internal_channel_id` dict |

Returns plain dict, not Pydantic. Used at startup to build in-memory routing table.

---

### `session_templates` repository

File: `db/repositories/session_templates.py`

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_by_slug` | `(session, slug) -> SessionTemplate \| None` | Get by unique slug |
| `get_visible_templates` | `(session, discord_user_id=None) -> list[SessionTemplate]` | Public templates + user's private templates; ordered by `launch_count DESC` |
| `create` | `(session, template: SessionTemplateCreate) -> SessionTemplate` | Insert new template |
| `update_template` | `(session, slug, updates: SessionTemplateUpdate) -> SessionTemplate \| None` | Partial update via `model_dump(exclude_unset=True)` |
| `delete` | `(session, slug) -> bool` | Delete by slug; returns True if deleted |
| `increment_launch_count` | `(session, slug) -> SessionTemplate \| None` | Increment `launch_count`, set `last_launched_at` |

---

### `bluedot` repository

File: `db/repositories/bluedot.py`

All reads use `BluedotMeetingORM` (the privacy-filtered view). Writes use `BluedotTranscriptORM` (the underlying table).

| Function | Signature | Description |
|----------|-----------|-------------|
| `list_meetings` | `(session, date_from=None, date_to=None) -> list[BluedotMeeting]` | All accessible meetings, newest first; optional date range |
| `get_transcript` | `(session, meeting_id) -> BluedotTranscript \| None` | Transcript by meeting ID; None if no transcript or private |
| `get_summary` | `(session, meeting_id) -> BluedotSummary \| None` | Summary by meeting ID; None if no summary or private |
| `search_transcripts` | `(session, query, limit=25, date_from=None, date_to=None) -> list[BluedotMeeting]` | ILIKE search on transcript_text (indexed) + summary + summary_v2 |
| `upsert_transcript` | `(session, meeting_id, payload) -> None` | Merge webhook payload via `INSERT ON CONFLICT DO UPDATE` with `COALESCE` to preserve existing fields |
| `update_validation` | `(session, meeting_id, validation_result) -> None` | Update `_validation` key in `raw_payload` JSONB; uses `flag_modified()` |
| `delete_transcript` | `(session, meeting_id) -> None` | Hard delete by meeting_id |
| `load_all_transcripts` | `(session, limit=200) -> list[BluedotTranscriptORM]` | Returns ORM instances (not Pydantic) for background re-validation jobs |
| `get_transcript_count` | `(session) -> int` | COUNT(*) of transcript rows |

#### Bluedot Upsert Merge Strategy

`upsert_transcript` merges two Bluedot webhook types (transcript vs summary) via `COALESCE(new_value, existing_value)` for all JSONB fields. This preserves the first webhook's data when the second arrives. Fields that are boolean flags (`has_transcript`, `has_summary`) use `new | existing` (OR logic). Raw `null()` (`sa.null()`) is used for absent JSONB fields to distinguish SQL NULL from JSON `null`.

#### Privacy Filtering

`bluedot_accessible_meetings` view logic:
- **Include**: rows where `raw_payload->'_validation'->>'is_accessible' = 'true'`
- **Include**: rows without `_validation` key (backward compatibility)
- **Exclude**: rows where `raw_payload->'_validation'->>'is_accessible' = 'false'`

---

## Multi-Tenant Implications

The following tables must gain a `tenant_id` column (or be replaced by new tenant-scoped tables) when moving to multi-tenancy:

| Table | Currently Scoped By | Multi-Tenant Scoping Needed |
|-------|--------------------|-----------------------------|
| `user_profiles` | Supabase Auth `user_id` | No change — users belong to tenants via `tenant_members` |
| `user_identity_discord` | Supabase Auth `user_id` | No change — one Discord identity per user globally |
| `user_credentials` | Supabase Auth `user_id` | Must add `tenant_id` — credentials are per-user-per-tenant |
| `direct_message_sessions` | `(platform, platform_user_id)` | Must add `guild_id`/`tenant_id` — DM sessions need per-guild boundaries |
| `scheduled_tasks` | `(user_discord_id, guild_id)` | Already scoped by `guild_id` — add `tenant_id` FK for indexing |
| `admin_impersonation_sessions` | Supabase Auth `user_id` | No change — admin panel is platform-wide |
| `conversation_skills` | `conversation_id` (Discord channel/thread) | Must add `guild_id`/`tenant_id` |
| `session_templates` | `created_by_discord_id` | No change — templates are global |
| `discord_channel_mapping` | `server_id` | Already scoped by server; add `tenant_id` FK |
| `bluedot_transcripts` | None (single-tenant) | Not applicable — Bluedot is per-user, not per-guild |

New tables required for multi-tenancy (not currently in ORM):
- `tenants` — tenant record with bot token, guild ID, subscription status
- `tenant_members` — user↔tenant membership
- `tenant_api_keys` — per-tenant Anthropic/OpenAI keys (Vault-backed)
- `tenant_service_connections` — per-tenant OAuth tokens and API keys for integrations
- `tenant_subscriptions` — Stripe billing state

See [database/schema.md](../database/schema.md) for full new table specs.
