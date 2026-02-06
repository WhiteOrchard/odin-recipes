export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          type: string;
          status: string;
          address: string;
          city: string;
          country: string;
          price: number;
          monthly_rent: number;
          bedrooms: number;
          bathrooms: number;
          sqft: number;
          year_built: number;
          description: string;
          amenities: string[];
          images: string[];
          lat: number;
          lng: number;
          rating: number;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      tenants: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          avatar_initials: string;
          property_id: string;
          lease_start: string;
          lease_end: string;
          monthly_rent: number;
          deposit: number;
          status: string;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      maintenance_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          property_id: string;
          tenant_id: string;
          title: string;
          description: string;
          priority: string;
          status: string;
          category: string;
          assigned_to: string | null;
          estimated_cost: number | null;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['maintenance_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['maintenance_requests']['Insert']>;
      };
      calendar_events: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          date: string;
          time: string;
          type: string;
          property_id: string | null;
          description: string;
          color: string;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          created_at: string;
          tenant_id: string;
          date: string;
          amount: number;
          status: string;
          method: string;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
