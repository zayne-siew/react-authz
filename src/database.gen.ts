export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assertion: {
        Row: {
          assertions: string | null
          authorization_model_id: string
          store: string
        }
        Insert: {
          assertions?: string | null
          authorization_model_id: string
          store: string
        }
        Update: {
          assertions?: string | null
          authorization_model_id?: string
          store?: string
        }
        Relationships: []
      }
      authorization_model: {
        Row: {
          authorization_model_id: string
          schema_version: string
          serialized_protobuf: string | null
          store: string
          type: string
          type_definition: string | null
        }
        Insert: {
          authorization_model_id: string
          schema_version?: string
          serialized_protobuf?: string | null
          store: string
          type: string
          type_definition?: string | null
        }
        Update: {
          authorization_model_id?: string
          schema_version?: string
          serialized_protobuf?: string | null
          store?: string
          type?: string
          type_definition?: string | null
        }
        Relationships: []
      }
      changelog: {
        Row: {
          _user: string
          condition_context: string | null
          condition_name: string | null
          inserted_at: string
          object_id: string
          object_type: string
          operation: number
          relation: string
          store: string
          ulid: string
        }
        Insert: {
          _user: string
          condition_context?: string | null
          condition_name?: string | null
          inserted_at: string
          object_id: string
          object_type: string
          operation: number
          relation: string
          store: string
          ulid: string
        }
        Update: {
          _user?: string
          condition_context?: string | null
          condition_name?: string | null
          inserted_at?: string
          object_id?: string
          object_type?: string
          operation?: number
          relation?: string
          store?: string
          ulid?: string
        }
        Relationships: []
      }
      goose_db_version: {
        Row: {
          id: number
          is_applied: boolean
          tstamp: string
          version_id: number
        }
        Insert: {
          id?: number
          is_applied: boolean
          tstamp?: string
          version_id: number
        }
        Update: {
          id?: number
          is_applied?: boolean
          tstamp?: string
          version_id?: number
        }
        Relationships: []
      }
      store: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at: string
          deleted_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tuple: {
        Row: {
          _user: string
          condition_context: string | null
          condition_name: string | null
          inserted_at: string
          object_id: string
          object_type: string
          relation: string
          store: string
          ulid: string
          user_type: string
        }
        Insert: {
          _user: string
          condition_context?: string | null
          condition_name?: string | null
          inserted_at: string
          object_id: string
          object_type: string
          relation: string
          store: string
          ulid: string
          user_type: string
        }
        Update: {
          _user?: string
          condition_context?: string | null
          condition_name?: string | null
          inserted_at?: string
          object_id?: string
          object_type?: string
          relation?: string
          store?: string
          ulid?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
