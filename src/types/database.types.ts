// Archivo generado por EnCompa-iaBack/scripts/gen-types.mjs. NO editar a mano.


export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"image_path": string | null,"is_active": boolean,"moments": (Database["public"]['Enums']["day_moment"])[],"name": string,"parent_id": string | null,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"is_active"?: boolean,"moments"?: (Database["public"]['Enums']["day_moment"])[],"name": string,"parent_id"?: string | null,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"is_active"?: boolean,"moments"?: (Database["public"]['Enums']["day_moment"])[],"name"?: string,"parent_id"?: string | null,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories_with_moments"
      referencedColumns: ["id"]
    }
                  ]
                },"gallery_items": {
                  Row: {
                    "category": string,"created_at": string,"description": string | null,"id": string,"is_published": boolean,"media_path": string,"media_type": string,"poster_path": string | null,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_published"?: boolean,"media_path": string,"media_type": string,"poster_path"?: string | null,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_published"?: boolean,"media_path"?: string,"media_type"?: string,"poster_path"?: string | null,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"products": {
                  Row: {
                    "category_id": string,"created_at": string,"description": string | null,"id": string,"image_path": string | null,"ingredients": string | null,"is_available": boolean,"is_featured": boolean,"name": string,"price": number | null,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"ingredients"?: string | null,"is_available"?: boolean,"is_featured"?: boolean,"name": string,"price"?: number | null,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"ingredients"?: string | null,"is_available"?: boolean,"is_featured"?: boolean,"name"?: string,"price"?: number | null,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories_with_moments"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"role": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"role": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"role"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_content": {
                  Row: {
                    "content": string | null,"created_at": string,"id": string,"image_path": string | null,"items": Json | null,"quote": string | null,"section": string,"subtitle": string | null,"title": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"image_path"?: string | null,"items"?: Json | null,"quote"?: string | null,"section": string,"subtitle"?: string | null,"title"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"image_path"?: string | null,"items"?: Json | null,"quote"?: string | null,"section"?: string,"subtitle"?: string | null,"title"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "address": string | null,"business_name": string,"created_at": string,"facebook_url": string | null,"google_maps_directions_url": string | null,"google_maps_embed_url": string | null,"hero_media_path": string | null,"id": string,"instagram_url": string | null,"logo_path": string | null,"opening_hours": Json | null,"phone": string | null,"singleton": boolean,"tiktok_url": string | null,"updated_at": string,"whatsapp": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"business_name": string,"created_at"?: string,"facebook_url"?: string | null,"google_maps_directions_url"?: string | null,"google_maps_embed_url"?: string | null,"hero_media_path"?: string | null,"id"?: string,"instagram_url"?: string | null,"logo_path"?: string | null,"opening_hours"?: Json | null,"phone"?: string | null,"singleton"?: boolean,"tiktok_url"?: string | null,"updated_at"?: string,"whatsapp"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"business_name"?: string,"created_at"?: string,"facebook_url"?: string | null,"google_maps_directions_url"?: string | null,"google_maps_embed_url"?: string | null,"hero_media_path"?: string | null,"id"?: string,"instagram_url"?: string | null,"logo_path"?: string | null,"opening_hours"?: Json | null,"phone"?: string | null,"singleton"?: boolean,"tiktok_url"?: string | null,"updated_at"?: string,"whatsapp"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"tour_images": {
                  Row: {
                    "area": string,"created_at": string,"description": string | null,"id": string,"image_path": string,"is_published": boolean,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "area": string,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path": string,"is_published"?: boolean,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "area"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string,"is_published"?: boolean,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"training_images": {
                  Row: {
                    "alt_text": string,"created_at": string,"id": string,"image_path": string,"sort_order": number,"training_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text": string,"created_at"?: string,"id"?: string,"image_path": string,"sort_order"?: number,"training_id": string,"updated_at"?: string
                  }
                  Update: {
                    "alt_text"?: string,"created_at"?: string,"id"?: string,"image_path"?: string,"sort_order"?: number,"training_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "training_images_training_id_fkey"
      columns: ["training_id"]
isOneToOne: false
      referencedRelation: "trainings"
      referencedColumns: ["id"]
    }
                  ]
                },"trainings": {
                  Row: {
                    "certificate_image_path": string | null,"certificate_name": string | null,"cover_image_path": string | null,"created_at": string,"description": string | null,"id": string,"instructor": string | null,"is_published": boolean,"organization": string | null,"slug": string,"sort_order": number,"subtitle": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "certificate_image_path"?: string | null,"certificate_name"?: string | null,"cover_image_path"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"instructor"?: string | null,"is_published"?: boolean,"organization"?: string | null,"slug": string,"sort_order"?: number,"subtitle"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "certificate_image_path"?: string | null,"certificate_name"?: string | null,"cover_image_path"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"instructor"?: string | null,"is_published"?: boolean,"organization"?: string | null,"slug"?: string,"sort_order"?: number,"subtitle"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "categories_with_moments": {
                  Row: {
                    "description": string | null,"effective_moments": (Database["public"]['Enums']["day_moment"])[] | null,"id": string,"image_path": string | null,"is_active": boolean,"moments": (Database["public"]['Enums']["day_moment"])[],"name": string,"parent_id": string | null,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories_with_moments"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "day_moment": "morning"|"midday"|"evening"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "day_moment": ["morning", "midday", "evening"]
          }
        }
} as const
