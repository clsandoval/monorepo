-- Seed data for daimon-saas local development
-- Creates: 3 test users, 3 tenants (free/starter/pro), discord connections,
--          API keys, service connections, subscriptions
--
-- Test users (password: Daimon123! for all):
--   free@daimon.test    — free plan, configured, Discord connected
--   starter@daimon.test — starter plan, active, Discord disconnected
--   pro@daimon.test     — pro plan, active, Discord error

DO $$
DECLARE
    -- User IDs
    v_user_free     UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
    v_user_starter  UUID := 'aaaaaaaa-0000-0000-0000-000000000002';
    v_user_pro      UUID := 'aaaaaaaa-0000-0000-0000-000000000003';

    -- Tenant IDs
    v_tenant_free    UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
    v_tenant_starter UUID := 'bbbbbbbb-0000-0000-0000-000000000002';
    v_tenant_pro     UUID := 'bbbbbbbb-0000-0000-0000-000000000003';

    -- Vault secret IDs (populated by vault.create_secret calls below)
    v_discord_free_vault_id       UUID;
    v_discord_starter_vault_id    UUID;
    v_discord_pro_vault_id        UUID;

    v_api_key_free_anthropic      UUID;
    v_api_key_starter_anthropic   UUID;
    v_api_key_starter_openai      UUID;
    v_api_key_pro_anthropic       UUID;
    v_api_key_pro_openai          UUID;

    v_svc_github_starter          UUID;
    v_svc_google_pro_access       UUID;
    v_svc_google_pro_refresh      UUID;
    v_svc_linear_pro              UUID;
    v_svc_toggl_pro               UUID;

BEGIN

    -- ─── AUTH USERS ──────────────────────────────────────────────────────────
    -- bcrypt hash of "Daimon123!" (rounds=10)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
    ) VALUES
    (
        v_user_free,
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'free@daimon.test',
        '$2a$10$wjRvWUxkDpYvqmPMI./ZH.ljUeV20YqHbxsI0ZiwnEOLhZPhd5dNS',
        NOW(), '', '', '', '',
        NOW(), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"name":"Free Tester"}'::jsonb,
        FALSE
    ),
    (
        v_user_starter,
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'starter@daimon.test',
        '$2a$10$wjRvWUxkDpYvqmPMI./ZH.ljUeV20YqHbxsI0ZiwnEOLhZPhd5dNS',
        NOW(), '', '', '', '',
        NOW(), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"name":"Starter Tester"}'::jsonb,
        FALSE
    ),
    (
        v_user_pro,
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'pro@daimon.test',
        '$2a$10$wjRvWUxkDpYvqmPMI./ZH.ljUeV20YqHbxsI0ZiwnEOLhZPhd5dNS',
        NOW(), '', '', '', '',
        NOW(), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"name":"Pro Tester"}'::jsonb,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;

    -- ─── AUTH IDENTITIES ─────────────────────────────────────────────────────
    -- Required by GoTrue v2+ for email/password sign-in
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        created_at,
        updated_at,
        last_sign_in_at
    ) VALUES
    (
        v_user_free,
        v_user_free,
        'free@daimon.test',
        'email',
        jsonb_build_object('sub', v_user_free::text, 'email', 'free@daimon.test', 'email_verified', TRUE, 'provider', 'email'),
        NOW(), NOW(), NOW()
    ),
    (
        v_user_starter,
        v_user_starter,
        'starter@daimon.test',
        'email',
        jsonb_build_object('sub', v_user_starter::text, 'email', 'starter@daimon.test', 'email_verified', TRUE, 'provider', 'email'),
        NOW(), NOW(), NOW()
    ),
    (
        v_user_pro,
        v_user_pro,
        'pro@daimon.test',
        'email',
        jsonb_build_object('sub', v_user_pro::text, 'email', 'pro@daimon.test', 'email_verified', TRUE, 'provider', 'email'),
        NOW(), NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- ─── VAULT SECRETS ───────────────────────────────────────────────────────
    -- Discord bot tokens (fake; bot cannot connect in local dev — status reflects test scenarios)
    v_discord_free_vault_id := vault.create_secret(
        'Bot.AAABBBCCC111.test_token_free_tenant_local_dev_seed',
        'discord_token_free',
        'Fake Discord bot token for free tenant — local dev only'
    );
    v_discord_starter_vault_id := vault.create_secret(
        'Bot.DDDEEEFFF222.test_token_starter_tenant_local_dev_seed',
        'discord_token_starter',
        'Fake Discord bot token for starter tenant — local dev only'
    );
    v_discord_pro_vault_id := vault.create_secret(
        'Bot.GGGHHHIII333.test_token_pro_tenant_local_dev_seed',
        'discord_token_pro',
        'Fake Discord bot token for pro tenant — local dev only'
    );

    -- Anthropic API keys
    v_api_key_free_anthropic := vault.create_secret(
        'sk-ant-api03-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'anthropic_key_free',
        'Fake Anthropic API key for free tenant — local dev only'
    );
    v_api_key_starter_anthropic := vault.create_secret(
        'sk-ant-api03-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        'anthropic_key_starter',
        'Fake Anthropic API key for starter tenant — local dev only'
    );
    v_api_key_pro_anthropic := vault.create_secret(
        'sk-ant-api03-CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        'anthropic_key_pro',
        'Fake Anthropic API key for pro tenant — local dev only'
    );

    -- OpenAI API keys (optional; starter and pro have these configured)
    v_api_key_starter_openai := vault.create_secret(
        'sk-proj-DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        'openai_key_starter',
        'Fake OpenAI API key for starter tenant — local dev only'
    );
    v_api_key_pro_openai := vault.create_secret(
        'sk-proj-EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
        'openai_key_pro',
        'Fake OpenAI API key for pro tenant — local dev only'
    );

    -- Service connection tokens/keys
    v_svc_github_starter := vault.create_secret(
        'gho_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFf',
        'github_token_starter',
        'Fake GitHub OAuth token for starter tenant — local dev only'
    );
    v_svc_google_pro_access := vault.create_secret(
        'ya29.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGg',
        'google_access_token_pro',
        'Fake Google OAuth access token for pro tenant — local dev only'
    );
    v_svc_google_pro_refresh := vault.create_secret(
        '1//HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHh',
        'google_refresh_token_pro',
        'Fake Google OAuth refresh token for pro tenant — local dev only'
    );
    v_svc_linear_pro := vault.create_secret(
        'lin_oauth_IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIi',
        'linear_token_pro',
        'Fake Linear OAuth token for pro tenant — local dev only'
    );
    v_svc_toggl_pro := vault.create_secret(
        'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJjjjjjjjjjjjjjjjjjjjjjjjjjj',
        'toggl_api_key_pro',
        'Fake Toggl API key for pro tenant — local dev only'
    );

    -- ─── TENANTS ─────────────────────────────────────────────────────────────
    -- Plans are pre-set here; subscription inserts below trigger plan cascade
    -- which will confirm/update them.
    INSERT INTO public.tenants (id, name, owner_id, plan, status, stripe_customer_id) VALUES
    (
        v_tenant_free,
        'Free Workspace',
        v_user_free,
        'free',
        'configured',
        NULL
    ),
    (
        v_tenant_starter,
        'Starter Workspace',
        v_user_starter,
        'starter',
        'active',
        'cus_test_starter_xxxxxxxxxx'
    ),
    (
        v_tenant_pro,
        'Pro Workspace',
        v_user_pro,
        'pro',
        'active',
        'cus_test_pro_xxxxxxxxxxxxxx'
    )
    ON CONFLICT (id) DO NOTHING;

    -- ─── TENANT MEMBERS ──────────────────────────────────────────────────────
    -- At launch each tenant has exactly one member (the owner)
    INSERT INTO public.tenant_members (tenant_id, user_id, role) VALUES
    (v_tenant_free,    v_user_free,    'owner'),
    (v_tenant_starter, v_user_starter, 'owner'),
    (v_tenant_pro,     v_user_pro,     'owner')
    ON CONFLICT (tenant_id, user_id) DO NOTHING;

    -- ─── DISCORD CONNECTIONS ─────────────────────────────────────────────────
    -- free    → connected  (bot online, heartbeat recent)
    -- starter → disconnected (bot cleanly disconnected)
    -- pro     → error (invalid token error message)
    INSERT INTO public.discord_connections (
        id,
        tenant_id,
        vault_secret_id,
        guild_id,
        token_hint,
        status,
        bot_user_id,
        bot_username,
        last_heartbeat,
        error_message
    ) VALUES
    (
        gen_random_uuid(),
        v_tenant_free,
        v_discord_free_vault_id,
        '123456789012345678',   -- 18-digit Discord snowflake
        'Bot.AAAB...1234',
        'connected',
        '987654321098765432',
        'DaimonBot',
        NOW() - INTERVAL '30 seconds',
        NULL
    ),
    (
        gen_random_uuid(),
        v_tenant_starter,
        v_discord_starter_vault_id,
        '234567890123456789',
        'Bot.DDDE...5678',
        'disconnected',
        '876543210987654321',
        'DaimonBot',
        NOW() - INTERVAL '2 hours',
        NULL
    ),
    (
        gen_random_uuid(),
        v_tenant_pro,
        v_discord_pro_vault_id,
        '345678901234567890',
        'Bot.GGGH...9012',
        'error',
        NULL,
        NULL,
        NULL,
        'Discord API returned 401 Unauthorized — bot token is invalid or revoked'
    )
    ON CONFLICT (tenant_id) DO NOTHING;

    -- ─── TENANT API KEYS ─────────────────────────────────────────────────────
    -- free    → Anthropic only (required)
    -- starter → Anthropic + OpenAI
    -- pro     → Anthropic + OpenAI
    INSERT INTO public.tenant_api_keys (
        id, tenant_id, key_type, vault_secret_id, key_hint, status, validated_at
    ) VALUES
    -- Free: Anthropic only
    (
        gen_random_uuid(), v_tenant_free, 'anthropic',
        v_api_key_free_anthropic,
        'sk-ant-a...a1b2', 'active',
        NOW() - INTERVAL '7 days'
    ),
    -- Starter: Anthropic
    (
        gen_random_uuid(), v_tenant_starter, 'anthropic',
        v_api_key_starter_anthropic,
        'sk-ant-a...c3d4', 'active',
        NOW() - INTERVAL '4 days'
    ),
    -- Starter: OpenAI (optional)
    (
        gen_random_uuid(), v_tenant_starter, 'openai',
        v_api_key_starter_openai,
        'sk-proj...e5f6', 'active',
        NOW() - INTERVAL '4 days'
    ),
    -- Pro: Anthropic
    (
        gen_random_uuid(), v_tenant_pro, 'anthropic',
        v_api_key_pro_anthropic,
        'sk-ant-a...g7h8', 'active',
        NOW() - INTERVAL '2 days'
    ),
    -- Pro: OpenAI (optional)
    (
        gen_random_uuid(), v_tenant_pro, 'openai',
        v_api_key_pro_openai,
        'sk-proj...i9j0', 'active',
        NOW() - INTERVAL '2 days'
    )
    ON CONFLICT (tenant_id, key_type) DO NOTHING;

    -- ─── TENANT SERVICE CONNECTIONS ──────────────────────────────────────────
    -- starter → GitHub (connected)
    -- pro     → Google (connected), Linear (connected), Toggl (connected)
    INSERT INTO public.tenant_service_connections (
        id,
        tenant_id,
        service,
        auth_type,
        vault_secret_id,
        refresh_vault_secret_id,
        token_expires_at,
        scopes,
        metadata,
        status,
        connected_by_user_id,
        connected_at,
        last_used_at
    ) VALUES
    -- Starter: GitHub OAuth (connected)
    (
        gen_random_uuid(),
        v_tenant_starter,
        'github',
        'oauth',
        v_svc_github_starter,
        NULL,                          -- GitHub does not use refresh tokens
        NULL,                          -- GitHub tokens do not expire
        ARRAY['repo', 'read:user', 'read:org'],
        '{"github_user_id": "11223344", "github_login": "starterdemo", "github_name": "Starter Demo User"}'::jsonb,
        'connected',
        v_user_starter,
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '1 hour'
    ),
    -- Pro: Google OAuth (connected, token expires in ~1 hour — near expiry for refresh test)
    (
        gen_random_uuid(),
        v_tenant_pro,
        'google',
        'oauth',
        v_svc_google_pro_access,
        v_svc_google_pro_refresh,
        NOW() + INTERVAL '55 minutes',
        ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar.readonly'],
        '{"google_user_id": "103456789012345678901", "google_email": "pro@example.com", "google_name": "Pro Demo User"}'::jsonb,
        'connected',
        v_user_pro,
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '30 minutes'
    ),
    -- Pro: Linear OAuth (connected)
    (
        gen_random_uuid(),
        v_tenant_pro,
        'linear',
        'oauth',
        v_svc_linear_pro,
        NULL,                          -- Linear does not use refresh tokens
        NULL,
        ARRAY['read', 'write'],
        '{"linear_user_id": "lin-user-abc123def456", "linear_email": "pro@example.com", "linear_org_id": "lin-org-xyz789ghi012"}'::jsonb,
        'connected',
        v_user_pro,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '2 hours'
    ),
    -- Pro: Toggl API key (connected)
    (
        gen_random_uuid(),
        v_tenant_pro,
        'toggl',
        'api_key',
        v_svc_toggl_pro,
        NULL,                          -- API keys have no refresh token
        NULL,                          -- API keys do not expire
        ARRAY[]::TEXT[],               -- No OAuth scopes for API key services
        '{"toggl_user_id": "9876543", "toggl_email": "pro@example.com", "toggl_workspace_id": "1234567", "toggl_workspace_name": "Pro Workspace"}'::jsonb,
        'connected',
        v_user_pro,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '4 hours'
    )
    ON CONFLICT (tenant_id, service) DO NOTHING;

    -- ─── TENANT SUBSCRIPTIONS ────────────────────────────────────────────────
    -- free    → no subscription row (tenant remains on free plan)
    -- starter → active monthly subscription (plan cascade sets tenants.plan = 'starter')
    -- pro     → trialing monthly subscription (plan cascade sets tenants.plan = 'pro')
    --
    -- Note: past_due state is exercised via Stripe webhook simulation in API tests.
    INSERT INTO public.tenant_subscriptions (
        id,
        tenant_id,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        stripe_product_id,
        plan,
        status,
        billing_interval,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        stripe_event_id,
        raw_event
    ) VALUES
    -- Starter: active monthly subscription
    (
        gen_random_uuid(),
        v_tenant_starter,
        'sub_test_starter_active_000000001',
        'cus_test_starter_xxxxxxxxxx',
        'price_test_starter_monthly_0001',
        'prod_test_starter_00000000001',
        'starter',
        'active',
        'month',
        NOW() - INTERVAL '16 days',
        NOW() + INTERVAL '14 days',
        NULL,
        NULL,
        'evt_test_starter_sub_created_001',
        '{}'::jsonb
    ),
    -- Pro: trialing subscription (14-day trial)
    (
        gen_random_uuid(),
        v_tenant_pro,
        'sub_test_pro_trialing_00000001',
        'cus_test_pro_xxxxxxxxxxxxxx',
        'price_test_pro_monthly_000001',
        'prod_test_pro_0000000000001',
        'pro',
        'trialing',
        'month',
        NOW() - INTERVAL '6 days',
        NOW() + INTERVAL '24 days',
        NOW() - INTERVAL '6 days',
        NOW() + INTERVAL '8 days',
        'evt_test_pro_sub_trialing_0001',
        '{}'::jsonb
    )
    ON CONFLICT (tenant_id) DO NOTHING;

    RAISE NOTICE 'Seed complete: 3 users, 3 tenants (free/starter/pro), discord connections (connected/disconnected/error), API keys, service connections, subscriptions (active/trialing)';

END $$;
