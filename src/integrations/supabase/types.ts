export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          id: string
          passenger_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_point_id: string | null
          platform_fee: number
          ride_id: string
          seats_booked: number
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          passenger_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_point_id?: string | null
          platform_fee: number
          ride_id: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          passenger_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_point_id?: string | null
          platform_fee?: number
          ride_id?: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pickup_point_id_fkey"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          expires_at: string
          otp_code: string
          sent_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          otp_code: string
          sent_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          otp_code?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pickup_points: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          ride_id: string
          sequence_order: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          ride_id: string
          sequence_order?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          ride_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pickup_points_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url: string | null
          created_at: string | null
          dl_status: Database["public"]["Enums"]["verification_status"] | null
          email: string | null
          email_notifications_enabled: boolean | null
          fuel_points: number | null
          full_name: string | null
          gender: string | null
          id: string
          is_aadhaar_verified: boolean | null
          is_dl_verified: boolean | null
          is_phone_verified: boolean | null
          is_suspended: boolean | null
          notifications_enabled: boolean | null
          phone: string | null
          push_notifications_enabled: boolean | null
          rating: number | null
          referral_code: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          suspended_at: string | null
          suspension_reason: string | null
          total_rides: number | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          aadhaar_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url?: string | null
          created_at?: string | null
          dl_status?: Database["public"]["Enums"]["verification_status"] | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          fuel_points?: number | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_aadhaar_verified?: boolean | null
          is_dl_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_suspended?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          push_notifications_enabled?: boolean | null
          rating?: number | null
          referral_code?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          suspended_at?: string | null
          suspension_reason?: string | null
          total_rides?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          aadhaar_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          avatar_url?: string | null
          created_at?: string | null
          dl_status?: Database["public"]["Enums"]["verification_status"] | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          fuel_points?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_aadhaar_verified?: boolean | null
          is_dl_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_suspended?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          push_notifications_enabled?: boolean | null
          rating?: number | null
          referral_code?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          suspended_at?: string | null
          suspension_reason?: string | null
          total_rides?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      promo_code_usage: {
        Row: {
          booking_id: string | null
          created_at: string
          discount_applied: number
          id: string
          promo_code_id: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          discount_applied: number
          id?: string
          promo_code_id: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          discount_applied?: number
          id?: string
          promo_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          is_first_ride_only: boolean | null
          max_discount: number | null
          min_ride_amount: number | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          is_first_ride_only?: boolean | null
          max_discount?: number | null
          min_ride_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          is_first_ride_only?: boolean | null
          max_discount?: number | null
          min_ride_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_type: string | null
          endpoint: string
          fcm_token: string | null
          id: string
          p256dh: string
          platform: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_type?: string | null
          endpoint: string
          fcm_token?: string | null
          id?: string
          p256dh: string
          platform?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_type?: string | null
          endpoint?: string
          fcm_token?: string | null
          id?: string
          p256dh?: string
          platform?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          rated_id: string
          rater_id: string
          rater_type: string
          rating: number
          review: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          rated_id: string
          rater_id: string
          rater_type: string
          rating: number
          review?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          rated_id?: string
          rater_id?: string
          rater_type?: string
          rating?: number
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_rides: {
        Row: {
          car_model: string | null
          car_number: string | null
          created_at: string
          departure_time: string
          destination: string
          driver_id: string
          id: string
          instant_approval: boolean | null
          is_active: boolean | null
          is_chatty: boolean | null
          is_music_allowed: boolean | null
          is_pet_friendly: boolean | null
          is_smoking_allowed: boolean | null
          is_women_only: boolean | null
          max_two_back_seat: boolean | null
          next_publish_date: string | null
          origin: string
          price_per_seat: number
          recurrence_days: number[] | null
          recurrence_type: string
          seats_available: number
          updated_at: string
        }
        Insert: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string
          departure_time: string
          destination: string
          driver_id: string
          id?: string
          instant_approval?: boolean | null
          is_active?: boolean | null
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          next_publish_date?: string | null
          origin: string
          price_per_seat: number
          recurrence_days?: number[] | null
          recurrence_type: string
          seats_available?: number
          updated_at?: string
        }
        Update: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string
          departure_time?: string
          destination?: string
          driver_id?: string
          id?: string
          instant_approval?: boolean | null
          is_active?: boolean | null
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          next_publish_date?: string | null
          origin?: string
          price_per_seat?: number
          recurrence_days?: number[] | null
          recurrence_type?: string
          seats_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referred_reward: number | null
          referrer_id: string
          referrer_reward: number | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referred_reward?: number | null
          referrer_id: string
          referrer_reward?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referred_reward?: number | null
          referrer_id?: string
          referrer_reward?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          report_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          report_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_audit_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          id: string
          reported_ride_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          reported_ride_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          reported_ride_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_ride_id_fkey"
            columns: ["reported_ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          car_model: string | null
          car_number: string | null
          created_at: string | null
          departure_time: string
          destination: string
          distance_km: number | null
          driver_id: string
          id: string
          instant_approval: boolean | null
          is_chatty: boolean | null
          is_music_allowed: boolean | null
          is_pet_friendly: boolean | null
          is_smoking_allowed: boolean | null
          is_women_only: boolean | null
          max_two_back_seat: boolean | null
          origin: string
          price_per_seat: number
          seats_available: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          departure_time: string
          destination: string
          distance_km?: number | null
          driver_id: string
          id?: string
          instant_approval?: boolean | null
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          origin: string
          price_per_seat: number
          seats_available: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          departure_time?: string
          destination?: string
          distance_km?: number | null
          driver_id?: string
          id?: string
          instant_approval?: boolean | null
          is_chatty?: boolean | null
          is_music_allowed?: boolean | null
          is_pet_friendly?: boolean | null
          is_smoking_allowed?: boolean | null
          is_women_only?: boolean | null
          max_two_back_seat?: boolean | null
          origin?: string
          price_per_seat?: number
          seats_available?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          destination: string
          id: string
          name: string | null
          notify_enabled: boolean | null
          origin: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          name?: string | null
          notify_enabled?: boolean | null
          origin: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          name?: string | null
          notify_enabled?: boolean | null
          origin?: string
          user_id?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          alert_type: string
          booking_id: string | null
          created_at: string
          id: string
          latitude: number | null
          location_text: string | null
          longitude: number | null
          resolved_at: string | null
          ride_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          alert_type: string
          booking_id?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_alerts_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_review_document: {
        Args: {
          p_action: string
          p_doc_id: string
          p_doc_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      book_ride_atomic:
        | {
            Args: {
              p_passenger_id: string
              p_pickup_point_id?: string
              p_ride_id: string
              p_seats_requested: number
            }
            Returns: string
          }
        | {
            Args: {
              p_passenger_id: string
              p_pickup_point_id?: string
              p_platform_fee: number
              p_ride_id: string
              p_seats_requested: number
              p_total_price: number
            }
            Returns: string
          }
      can_access_booking_chat: {
        Args: { p_booking_id: string; p_user_id: string }
        Returns: boolean
      }
      cancel_booking_atomic: {
        Args: { p_booking_id: string; p_user_id: string }
        Returns: boolean
      }
      complete_ride: {
        Args: { p_driver_id: string; p_ride_id: string }
        Returns: boolean
      }
      get_admin_analytics: {
        Args: { p_days?: number }
        Returns: {
          active_users: number
          date: string
          new_users: number
          total_bookings: number
          total_revenue: number
          total_rides: number
        }[]
      }
      get_booking_driver_id: { Args: { p_booking_id: string }; Returns: string }
      get_document_signed_url: { Args: { p_doc_id: string }; Returns: string }
      get_driver_earnings: {
        Args: { p_driver_id: string }
        Returns: {
          cancelled_bookings: number
          month_earnings: number
          today_earnings: number
          total_bookings: number
          total_earnings: number
          total_rides: number
          total_seats_sold: number
          week_earnings: number
        }[]
      }
      get_driver_earnings_breakdown: {
        Args: { p_days?: number; p_driver_id: string }
        Returns: {
          bookings_count: number
          date: string
          earnings: number
          rides_count: number
          seats_sold: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ride_driver: {
        Args: { p_ride_id: string; p_user_id: string }
        Returns: boolean
      }
      is_ride_passenger: {
        Args: { p_ride_id: string; p_user_id: string }
        Returns: boolean
      }
      send_phone_otp: {
        Args: { p_otp_code: string; p_user_id: string }
        Returns: boolean
      }
      start_ride: {
        Args: { p_driver_id: string; p_ride_id: string }
        Returns: boolean
      }
      verify_phone_otp: {
        Args: { p_otp_code: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status: "pending" | "confirmed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_tier: "free" | "premium"
      verification_status: "pending" | "verified" | "rejected"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      booking_status: ["pending", "confirmed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_tier: ["free", "premium"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
