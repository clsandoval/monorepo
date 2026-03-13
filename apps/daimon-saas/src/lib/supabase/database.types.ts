export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      discord_connections: {
        Row: {
          bot_user_id: string | null
          bot_username: string | null
          created_at: string
          error_message: string | null
          guild_id: string
          id: string
          last_heartbeat: string | null
          status: Database["public"]["Enums"]["discord_connection_status"]
          tenant_id: string
          token_hint: string
          updated_at: string
          vault_secret_id: string
        }
        Insert: {
          bot_user_id?: string | null
          bot_username?: string | null
          created_at?: string
          error_message?: string | null
          guild_id: string
          id?: string
          last_heartbeat?: string | null
          status?: Database["public"]["Enums"]["discord_connection_status"]
          tenant_id: string
          token_hint: string
          updated_at?: string
          vault_secret_id: string
        }
        Update: {
          bot_user_id?: string | null
          bot_username?: string | null
          created_at?: string
          error_message?: string | null
          guild_id?: string
          id?: string
          last_heartbeat?: string | null
          status?: Database["public"]["Enums"]["discord_connection_status"]
          tenant_id?: string
          token_hint?: string
          updated_at?: string
          vault_secret_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discord_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      tenant_api_keys: {
        Row: {
          created_at: string
          id: string
          key_hint: string
          key_type: Database["public"]["Enums"]["api_key_type"]
          status: string
          tenant_id: string
          updated_at: string
          validated_at: string | null
          vault_secret_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hint: string
          key_type: Database["public"]["Enums"]["api_key_type"]
          status?: string
          tenant_id: string
          updated_at?: string
          validated_at?: string | null
          vault_secret_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hint?: string
          key_type?: Database["public"]["Enums"]["api_key_type"]
          status?: string
          tenant_id?: string
          updated_at?: string
          validated_at?: string | null
          vault_secret_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["tenant_member_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_member_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["tenant_member_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_messages: {
        Row: {
          channel_id: string
          created_at: string
          guild_id: string
          id: string
          message_type: string
          tenant_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          guild_id: string
          id?: string
          message_type?: string
          tenant_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          guild_id?: string
          id?: string
          message_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_service_connections: {
        Row: {
          auth_type: Database["public"]["Enums"]["service_auth_type"]
          connected_at: string
          connected_by_user_id: string | null
          error_message: string | null
          id: string
          last_used_at: string | null
          metadata: Json
          refresh_vault_secret_id: string | null
          scopes: string[]
          service: string
          status: Database["public"]["Enums"]["service_connection_status"]
          tenant_id: string
          token_expires_at: string | null
          updated_at: string
          vault_secret_id: string
        }
        Insert: {
          auth_type: Database["public"]["Enums"]["service_auth_type"]
          connected_at?: string
          connected_by_user_id?: string | null
          error_message?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json
          refresh_vault_secret_id?: string | null
          scopes?: string[]
          service: string
          status?: Database["public"]["Enums"]["service_connection_status"]
          tenant_id: string
          token_expires_at?: string | null
          updated_at?: string
          vault_secret_id: string
        }
        Update: {
          auth_type?: Database["public"]["Enums"]["service_auth_type"]
          connected_at?: string
          connected_by_user_id?: string | null
          error_message?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json
          refresh_vault_secret_id?: string | null
          scopes?: string[]
          service?: string
          status?: Database["public"]["Enums"]["service_connection_status"]
          tenant_id?: string
          token_expires_at?: string | null
          updated_at?: string
          vault_secret_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_service_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          billing_interval: string
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          plan: Database["public"]["Enums"]["tenant_plan"]
          raw_event: Json
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_event_id: string
          stripe_price_id: string
          stripe_product_id: string
          stripe_subscription_id: string
          tenant_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          ended_at?: string | null
          id?: string
          plan: Database["public"]["Enums"]["tenant_plan"]
          raw_event?: Json
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_event_id: string
          stripe_price_id: string
          stripe_product_id: string
          stripe_subscription_id: string
          tenant_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          raw_event?: Json
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_event_id?: string
          stripe_price_id?: string
          stripe_product_id?: string
          stripe_subscription_id?: string
          tenant_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_tool_calls: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          success: boolean
          tenant_id: string
          tool_name: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          success?: boolean
          tenant_id: string
          tool_name: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          success?: boolean
          tenant_id?: string
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_tool_calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["tenant_plan"]
          status: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          status?: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          status?: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_decrypted_secret: { Args: { secret_id: string }; Returns: string }
    }
    Enums: {
      api_key_type: "anthropic" | "openai"
      discord_connection_status:
        | "pending"
        | "connecting"
        | "connected"
        | "disconnected"
        | "error"
        | "suspended"
      service_auth_type: "oauth" | "api_key"
      service_connection_status: "connected" | "expired" | "revoked" | "error"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
        | "unpaid"
      tenant_member_role: "owner" | "admin" | "member"
      tenant_plan: "free" | "starter" | "pro"
      tenant_status: "pending" | "configured" | "active" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      api_key_type: ["anthropic", "openai"],
      discord_connection_status: [
        "pending",
        "connecting",
        "connected",
        "disconnected",
        "error",
        "suspended",
      ],
      service_auth_type: ["oauth", "api_key"],
      service_connection_status: ["connected", "expired", "revoked", "error"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "paused",
        "unpaid",
      ],
      tenant_member_role: ["owner", "admin", "member"],
      tenant_plan: ["free", "starter", "pro"],
      tenant_status: ["pending", "configured", "active", "suspended"],
    },
  },
} as const

