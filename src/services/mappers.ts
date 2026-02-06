/**
 * Type Mappers
 *
 * Bidirectional conversion between database types (snake_case)
 * and frontend types (camelCase)
 */

import type { Property, Tenant, MaintenanceRequest, CalendarEvent, PaymentRecord } from '../types';
import type { Database } from '../types/database';

// Database table row types (will be added in database.ts)
type PropertyRow = Database['public']['Tables']['properties']['Row'];
type TenantRow = Database['public']['Tables']['tenants']['Row'];
type MaintenanceRow = Database['public']['Tables']['maintenance_requests']['Row'];
type CalendarRow = Database['public']['Tables']['calendar_events']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];

/**
 * Property mappers
 */
export function propertyFromDb(row: PropertyRow): Property {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Property['type'],
    status: row.status as Property['status'],
    address: row.address,
    city: row.city,
    country: row.country,
    price: row.price,
    monthlyRent: row.monthly_rent,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqft: row.sqft,
    yearBuilt: row.year_built,
    description: row.description,
    amenities: row.amenities,
    images: row.images,
    coordinates: {
      lat: row.lat,
      lng: row.lng,
    },
    rating: row.rating,
    tenantId: (row as Record<string, unknown>).tenant_id as string ?? undefined,
  };
}

export function propertyToDb(property: Partial<Property>): Partial<PropertyRow> {
  return {
    id: property.id,
    name: property.name,
    type: property.type,
    status: property.status,
    address: property.address,
    city: property.city,
    country: property.country,
    price: property.price,
    monthly_rent: property.monthlyRent,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    year_built: property.yearBuilt,
    description: property.description,
    amenities: property.amenities,
    images: property.images,
    lat: property.coordinates?.lat,
    lng: property.coordinates?.lng,
    rating: property.rating,
    // tenantId mapped separately if needed
  };
}

/**
 * Tenant mappers
 */
export function tenantFromDb(row: TenantRow, paymentHistory: PaymentRecord[] = []): Tenant {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar_initials,
    propertyId: row.property_id,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    monthlyRent: row.monthly_rent,
    deposit: row.deposit,
    status: row.status as Tenant['status'],
    paymentHistory,
  };
}

export function tenantToDb(tenant: Partial<Tenant>): Partial<TenantRow> {
  return {
    id: tenant.id,
    first_name: tenant.firstName,
    last_name: tenant.lastName,
    email: tenant.email,
    phone: tenant.phone,
    avatar_initials: tenant.avatar,
    property_id: tenant.propertyId,
    lease_start: tenant.leaseStart,
    lease_end: tenant.leaseEnd,
    monthly_rent: tenant.monthlyRent,
    deposit: tenant.deposit,
    status: tenant.status,
  };
}

/**
 * Payment mappers
 */
export function paymentFromDb(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    status: row.status as PaymentRecord['status'],
    method: row.method,
  };
}

export function paymentToDb(payment: Partial<PaymentRecord>): Partial<PaymentRow> {
  return {
    id: payment.id,
    date: payment.date,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
  };
}

/**
 * Maintenance Request mappers
 */
export function maintenanceFromDb(row: MaintenanceRow): MaintenanceRequest {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    title: row.title,
    description: row.description,
    priority: row.priority as MaintenanceRequest['priority'],
    status: row.status as MaintenanceRequest['status'],
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedTo: row.assigned_to ?? undefined,
    estimatedCost: row.estimated_cost ?? undefined,
  };
}

export function maintenanceToDb(request: Partial<MaintenanceRequest>): Partial<MaintenanceRow> {
  return {
    id: request.id,
    property_id: request.propertyId,
    tenant_id: request.tenantId,
    title: request.title,
    description: request.description,
    priority: request.priority,
    status: request.status,
    category: request.category,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    assigned_to: request.assignedTo ?? null,
    estimated_cost: request.estimatedCost ?? null,
  };
}

/**
 * Calendar Event mappers
 */
export function calendarEventFromDb(row: CalendarRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type as CalendarEvent['type'],
    propertyId: row.property_id ?? undefined,
    description: row.description,
    color: row.color,
  };
}

export function calendarEventToDb(event: Partial<CalendarEvent>): Partial<CalendarRow> {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    type: event.type,
    property_id: event.propertyId ?? null,
    description: event.description,
    color: event.color,
  };
}
