export type PropertyType = 'penthouse' | 'villa' | 'estate' | 'mansion' | 'chateau' | 'townhouse';
export type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'listed';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  country: string;
  price: number;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  description: string;
  amenities: string[];
  images: string[];
  coordinates: { lat: number; lng: number };
  rating: number;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  propertyId: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'pending' | 'expired';
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  estimatedCost?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'viewing' | 'inspection' | 'maintenance' | 'lease-renewal' | 'meeting';
  propertyId?: string;
  description: string;
  color: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  avgRentPerSqft: number;
  monthlyData: MonthlyFinancial[];
}

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardStats {
  totalProperties: number;
  totalValue: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  upcomingRenewals: number;
}
