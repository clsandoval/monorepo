// TypeScript enums matching PostgreSQL enum types in 20260400000000_create_enums.sql

export enum TenantPlan {
  Free = 'free',
  Starter = 'starter',
  Pro = 'pro',
}

export enum TenantStatus {
  Pending = 'pending',
  Configured = 'configured',
  Active = 'active',
  Suspended = 'suspended',
}

export enum TenantMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export enum DiscordConnectionStatus {
  Pending = 'pending',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Suspended = 'suspended',
}

export enum ServiceConnectionStatus {
  Connected = 'connected',
  Expired = 'expired',
  Revoked = 'revoked',
  Error = 'error',
}

export enum SubscriptionStatus {
  Trialing = 'trialing',
  Active = 'active',
  PastDue = 'past_due',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  Paused = 'paused',
  Unpaid = 'unpaid',
}

export enum ApiKeyType {
  Anthropic = 'anthropic',
  OpenAI = 'openai',
}

export enum ServiceAuthType {
  OAuth = 'oauth',
  ApiKey = 'api_key',
}
