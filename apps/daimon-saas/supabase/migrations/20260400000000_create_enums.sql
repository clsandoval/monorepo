-- Migration: 20260400000000_create_enums.sql
-- Purpose: Create all PostgreSQL enum types required by Daimon SaaS tables
-- Safety: Additive only — creates new types, does not modify existing types

BEGIN;

DO $$ BEGIN
    -- Plan tier for tenants
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_plan') THEN
        CREATE TYPE public.tenant_plan AS ENUM ('free', 'starter', 'pro');
    END IF;

    -- Overall tenant lifecycle status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
        CREATE TYPE public.tenant_status AS ENUM (
            'pending', 'configured', 'active', 'suspended'
        );
    END IF;

    -- Role within a tenant workspace
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_member_role') THEN
        CREATE TYPE public.tenant_member_role AS ENUM ('owner', 'admin', 'member');
    END IF;

    -- Discord connection state machine
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discord_connection_status') THEN
        CREATE TYPE public.discord_connection_status AS ENUM (
            'pending', 'connecting', 'connected', 'disconnected', 'error', 'suspended'
        );
    END IF;

    -- Third-party service connection health
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_connection_status') THEN
        CREATE TYPE public.service_connection_status AS ENUM (
            'connected', 'expired', 'revoked', 'error'
        );
    END IF;

    -- Stripe subscription lifecycle
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE public.subscription_status AS ENUM (
            'trialing', 'active', 'past_due', 'canceled',
            'incomplete', 'incomplete_expired', 'paused', 'unpaid'
        );
    END IF;

    -- AI provider API key type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'api_key_type') THEN
        CREATE TYPE public.api_key_type AS ENUM ('anthropic', 'openai');
    END IF;

    -- Service connection auth method
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_auth_type') THEN
        CREATE TYPE public.service_auth_type AS ENUM ('oauth', 'api_key');
    END IF;
END $$;

COMMIT;
