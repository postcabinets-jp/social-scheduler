export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          current_workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: string;
          ai_provider: string | null;
          ai_api_key_enc: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          plan?: string;
          ai_provider?: string | null;
          ai_api_key_enc?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          plan?: string;
          ai_provider?: string | null;
          ai_api_key_enc?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      social_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          platform: string;
          platform_user_id: string;
          display_name: string;
          username: string | null;
          avatar_url: string | null;
          access_token_enc: string;
          refresh_token_enc: string | null;
          token_expires_at: string | null;
          is_active: boolean;
          last_synced_at: string | null;
          follower_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          platform: string;
          platform_user_id: string;
          display_name: string;
          username?: string | null;
          avatar_url?: string | null;
          access_token_enc: string;
          refresh_token_enc?: string | null;
          token_expires_at?: string | null;
          is_active?: boolean;
          last_synced_at?: string | null;
          follower_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          platform?: string;
          platform_user_id?: string;
          display_name?: string;
          username?: string | null;
          avatar_url?: string | null;
          access_token_enc?: string;
          refresh_token_enc?: string | null;
          token_expires_at?: string | null;
          is_active?: boolean;
          last_synced_at?: string | null;
          follower_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          workspace_id: string;
          created_by: string;
          status: string;
          content: string | null;
          scheduled_at: string | null;
          published_at: string | null;
          campaign_id: string | null;
          ai_generated: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          created_by: string;
          status?: string;
          content?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          campaign_id?: string | null;
          ai_generated?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          created_by?: string;
          status?: string;
          content?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          campaign_id?: string | null;
          ai_generated?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };
      post_channels: {
        Row: {
          id: string;
          post_id: string;
          social_account_id: string;
          content_override: string | null;
          status: string;
          platform_post_id: string | null;
          published_at: string | null;
          error_message: string | null;
          retry_count: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          social_account_id: string;
          content_override?: string | null;
          status?: string;
          platform_post_id?: string | null;
          published_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
        };
        Update: {
          id?: string;
          post_id?: string;
          social_account_id?: string;
          content_override?: string | null;
          status?: string;
          platform_post_id?: string | null;
          published_at?: string | null;
          error_message?: string | null;
          retry_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_channels_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_channels_social_account_id_fkey";
            columns: ["social_account_id"];
            isOneToOne: false;
            referencedRelation: "social_accounts";
            referencedColumns: ["id"];
          }
        ];
      };
      media_assets: {
        Row: {
          id: string;
          workspace_id: string;
          uploaded_by: string;
          type: string;
          filename: string;
          storage_path: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          duration_sec: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          uploaded_by: string;
          type: string;
          filename: string;
          storage_path: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          duration_sec?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          uploaded_by?: string;
          type?: string;
          filename?: string;
          storage_path?: string;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          duration_sec?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      post_media: {
        Row: {
          post_id: string;
          media_asset_id: string;
          sort_order: number;
        };
        Insert: {
          post_id: string;
          media_asset_id: string;
          sort_order?: number;
        };
        Update: {
          post_id?: string;
          media_asset_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      analytics_snapshots: {
        Row: {
          id: string;
          social_account_id: string;
          snapshot_date: string;
          follower_count: number | null;
          post_count: number | null;
          total_impressions: number | null;
          total_engagements: number | null;
          total_reach: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          social_account_id: string;
          snapshot_date: string;
          follower_count?: number | null;
          post_count?: number | null;
          total_impressions?: number | null;
          total_engagements?: number | null;
          total_reach?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          social_account_id?: string;
          snapshot_date?: string;
          follower_count?: number | null;
          post_count?: number | null;
          total_impressions?: number | null;
          total_engagements?: number | null;
          total_reach?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      post_analytics: {
        Row: {
          id: string;
          post_channel_id: string;
          fetched_at: string;
          impressions: number | null;
          reach: number | null;
          likes: number | null;
          comments: number | null;
          shares: number | null;
          clicks: number | null;
          saves: number | null;
          video_views: number | null;
        };
        Insert: {
          id?: string;
          post_channel_id: string;
          fetched_at?: string;
          impressions?: number | null;
          reach?: number | null;
          likes?: number | null;
          comments?: number | null;
          shares?: number | null;
          clicks?: number | null;
          saves?: number | null;
          video_views?: number | null;
        };
        Update: {
          id?: string;
          post_channel_id?: string;
          fetched_at?: string;
          impressions?: number | null;
          reach?: number | null;
          likes?: number | null;
          comments?: number | null;
          shares?: number | null;
          clicks?: number | null;
          saves?: number | null;
          video_views?: number | null;
        };
        Relationships: [];
      };
      approval_requests: {
        Row: {
          id: string;
          post_id: string;
          requested_by: string;
          reviewed_by: string | null;
          status: string;
          comment: string | null;
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          requested_by: string;
          reviewed_by?: string | null;
          status?: string;
          comment?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          requested_by?: string;
          reviewed_by?: string | null;
          status?: string;
          comment?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "approval_requests_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
      post_templates: {
        Row: {
          id: string;
          workspace_id: string;
          created_by: string;
          name: string;
          content: string;
          platforms: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          created_by: string;
          name: string;
          content: string;
          platforms?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          created_by?: string;
          name?: string;
          content?: string;
          platforms?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
