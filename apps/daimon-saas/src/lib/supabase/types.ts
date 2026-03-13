import type { Database } from './database.types'

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type TenantMember = Database['public']['Tables']['tenant_members']['Row']
export type TenantMemberInsert = Database['public']['Tables']['tenant_members']['Insert']
export type TenantMemberUpdate = Database['public']['Tables']['tenant_members']['Update']

export type DiscordConnection = Database['public']['Tables']['discord_connections']['Row']
export type DiscordConnectionInsert = Database['public']['Tables']['discord_connections']['Insert']
export type DiscordConnectionUpdate = Database['public']['Tables']['discord_connections']['Update']

export type TenantApiKey = Database['public']['Tables']['tenant_api_keys']['Row']
export type TenantApiKeyInsert = Database['public']['Tables']['tenant_api_keys']['Insert']
export type TenantApiKeyUpdate = Database['public']['Tables']['tenant_api_keys']['Update']

export type TenantServiceConnection = Database['public']['Tables']['tenant_service_connections']['Row']
export type TenantServiceConnectionInsert = Database['public']['Tables']['tenant_service_connections']['Insert']
export type TenantServiceConnectionUpdate = Database['public']['Tables']['tenant_service_connections']['Update']

export type TenantSubscription = Database['public']['Tables']['tenant_subscriptions']['Row']
export type TenantSubscriptionInsert = Database['public']['Tables']['tenant_subscriptions']['Insert']
export type TenantSubscriptionUpdate = Database['public']['Tables']['tenant_subscriptions']['Update']

export type StripeWebhookEvent = Database['public']['Tables']['stripe_webhook_events']['Row']
export type StripeWebhookEventInsert = Database['public']['Tables']['stripe_webhook_events']['Insert']

export type TenantMessage = Database['public']['Tables']['tenant_messages']['Row']
export type TenantMessageInsert = Database['public']['Tables']['tenant_messages']['Insert']

export type TenantToolCall = Database['public']['Tables']['tenant_tool_calls']['Row']
export type TenantToolCallInsert = Database['public']['Tables']['tenant_tool_calls']['Insert']

export type TenantPlan = Database['public']['Enums']['tenant_plan']
export type TenantStatus = Database['public']['Enums']['tenant_status']
export type TenantMemberRole = Database['public']['Enums']['tenant_member_role']
export type DiscordConnectionStatus = Database['public']['Enums']['discord_connection_status']
export type ApiKeyType = Database['public']['Enums']['api_key_type']
export type ServiceAuthType = Database['public']['Enums']['service_auth_type']
export type ServiceConnectionStatus = Database['public']['Enums']['service_connection_status']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
