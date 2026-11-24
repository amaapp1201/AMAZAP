export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  next_auth: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          oauth_token: string | null
          oauth_token_secret: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string | null
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId?: string | null
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string | null
        }
        Insert: {
          expires: string
          id?: string
          sessionToken: string
          userId?: string | null
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          archived_at: string | null
          email: string | null
          emailVerified: string | null
          id: string
          image: string | null
          is_admin: boolean
          name: string
          password: string
          team_id: number | null
        }
        Insert: {
          archived_at?: string | null
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          is_admin: boolean
          name: string
          password: string
          team_id?: number | null
        }
        Update: {
          archived_at?: string | null
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          is_admin?: boolean
          name?: string
          password?: string
          team_id?: number | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          expires: string
          identifier: string | null
          token: string
        }
        Insert: {
          expires: string
          identifier?: string | null
          token: string
        }
        Update: {
          expires?: string
          identifier?: string | null
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      action_categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: number
          is_single_selection: boolean
          name: string
          order_id: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: number
          is_single_selection?: boolean
          name: string
          order_id?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: number
          is_single_selection?: boolean
          name?: string
          order_id?: number
        }
        Relationships: []
      }
      actions: {
        Row: {
          archived_at: string | null
          category_id: number
          created_at: string
          id: number
          name: string
          order_id: number
          point: number
        }
        Insert: {
          archived_at?: string | null
          category_id: number
          created_at?: string
          id?: number
          name: string
          order_id?: number
          point: number
        }
        Update: {
          archived_at?: string | null
          category_id?: number
          created_at?: string
          id?: number
          name?: string
          order_id?: number
          point?: number
        }
        Relationships: [
          {
            foreignKeyName: "actions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "action_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_actions_snapshot: {
        Row: {
          action_id: number
          category_id: number
          created_at: string
          event_id: number
          name: string
          order_id: number
          point: number
        }
        Insert: {
          action_id: number
          category_id: number
          created_at?: string
          event_id: number
          name: string
          order_id: number
          point: number
        }
        Update: {
          action_id?: number
          category_id?: number
          created_at?: string
          event_id?: number
          name?: string
          order_id?: number
          point?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_action_snapshot_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_action_snapshot_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "action_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_actions_snapshot_event_id_category_id_fkey"
            columns: ["event_id", "category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["event_id", "category_id"]
          },
          {
            foreignKeyName: "event_actions_snapshot_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_actions_snapshot_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          category_id: number
          created_at: string
          event_id: number
          is_single_selection_snapshot: boolean
          name_snapshot: string | null
          order_id_snapshot: number | null
        }
        Insert: {
          category_id: number
          created_at?: string
          event_id: number
          is_single_selection_snapshot?: boolean
          name_snapshot?: string | null
          order_id_snapshot?: number | null
        }
        Update: {
          category_id?: number
          created_at?: string
          event_id?: number
          is_single_selection_snapshot?: boolean
          name_snapshot?: string | null
          order_id_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "action_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_teams: {
        Row: {
          created_at: string
          event_id: number
          name_snapshot: string | null
          team_id: number
        }
        Insert: {
          created_at?: string
          event_id?: number
          name_snapshot?: string | null
          team_id?: number
        }
        Update: {
          created_at?: string
          event_id?: number
          name_snapshot?: string | null
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      event_users_snapshot: {
        Row: {
          created_at: string
          event_id: number
          name: string | null
          team_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          name?: string | null
          team_id?: number | null
          user_id?: string
        }
        Update: {
          created_at?: string
          event_id?: number
          name?: string | null
          team_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_users_snapshot_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_users_snapshot_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_users_snapshot_event_id_team_id_fkey"
            columns: ["event_id", "team_id"]
            isOneToOne: false
            referencedRelation: "event_teams"
            referencedColumns: ["event_id", "team_id"]
          },
          {
            foreignKeyName: "event_users_snapshot_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_users_snapshot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_teams_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          endAt: string | null
          id: number
          is_team_rank_visible: boolean
          is_user_rank_visible: boolean
          name: string
          startAt: string | null
          status: Database["public"]["Enums"]["event_status_enum"]
        }
        Insert: {
          created_at?: string
          endAt?: string | null
          id?: number
          is_team_rank_visible?: boolean
          is_user_rank_visible?: boolean
          name: string
          startAt?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"]
        }
        Update: {
          created_at?: string
          endAt?: string | null
          id?: number
          is_team_rank_visible?: boolean
          is_user_rank_visible?: boolean
          name?: string
          startAt?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"]
        }
        Relationships: []
      }
      record_actions: {
        Row: {
          action_id: number
          created_at: string
          record_id: number
        }
        Insert: {
          action_id: number
          created_at?: string
          record_id?: number
        }
        Update: {
          action_id?: number
          created_at?: string
          record_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "record_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_actions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          date: string
          event_id: number
          id: number
          last_action_point_cumulative: number
          last_step_cumulative: number
          snapshot_team_id: number
          today_action_point_summary: number
          today_step_summary: number
          user_id: string
        }
        Insert: {
          date: string
          event_id: number
          id?: number
          last_action_point_cumulative?: number
          last_step_cumulative?: number
          snapshot_team_id: number
          today_action_point_summary?: number
          today_step_summary?: number
          user_id: string
        }
        Update: {
          date?: string
          event_id?: number
          id?: number
          last_action_point_cumulative?: number
          last_step_cumulative?: number
          snapshot_team_id?: number
          today_action_point_summary?: number
          today_step_summary?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_snapshot_team_id_fkey"
            columns: ["snapshot_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          archived_at: string | null
          created_at: string
          id: number
          name: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      event_view: {
        Row: {
          created_at: string | null
          endAt: string | null
          event_categories: Json | null
          event_teams: Json | null
          id: number | null
          is_rank_visible: boolean | null
          name: string | null
          startAt: string | null
          status: Database["public"]["Enums"]["event_status_enum"] | null
        }
        Insert: {
          created_at?: string | null
          endAt?: string | null
          event_categories?: never
          event_teams?: never
          id?: number | null
          is_rank_visible?: boolean | null
          name?: string | null
          startAt?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"] | null
        }
        Update: {
          created_at?: string | null
          endAt?: string | null
          event_categories?: never
          event_teams?: never
          id?: number | null
          is_rank_visible?: boolean | null
          name?: string | null
          startAt?: string | null
          status?: Database["public"]["Enums"]["event_status_enum"] | null
        }
        Relationships: []
      }
      user_teams_view: {
        Row: {
          archived_at: string | null
          is_admin: boolean | null
          team_id: number | null
          team_name: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bulk_update_action_categories: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      bulk_update_actions: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
      get_team_action_point_summary: {
        Args: {
          p_event_id: number
        }
        Returns: {
          team_id: number
          team_name: string
          total_action_point: number
          total_step: number
        }[]
      }
      get_user_action_point_summary: {
        Args: {
          p_event_id: number
        }
        Returns: {
          user_id: number
          user_name: string
          team_name: string
          total_action_point: number
          total_step: number
        }[]
      }
      insert_event_actions_snapshot: {
        Args: {
          p_event_id: number
        }
        Returns: undefined
      }
      insert_event_users_snapshot: {
        Args: {
          p_event_id: number
        }
        Returns: undefined
      }
      update_event_category_snapshot: {
        Args: {
          p_event_id: number
        }
        Returns: undefined
      }
      update_event_teams_snapshot: {
        Args: {
          p_event_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      event_status_enum: "active" | "planning" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
