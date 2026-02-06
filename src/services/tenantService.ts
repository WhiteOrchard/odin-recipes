import { supabase, isDemoMode } from '../lib/supabase';
import { getCollection, getById as getDemoById, upsert, removeItem } from './demoStore';
import { tenantFromDb, tenantToDb } from './mappers';
import { success, failure } from './types';
import { getByTenantId as getPaymentsByTenantId } from './paymentService';
import type { Tenant } from '../types';
import type { ServiceResult, ServiceListResult } from './types';
import type { Database } from '../types/database';

type TenantRow = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];

/**
 * Get all tenants with their payment history
 */
export async function getAll(): Promise<ServiceListResult<Tenant>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<TenantRow>('tenants');
      const tenants = await Promise.all(
        rows.map(async (row) => {
          const { data: payments } = await getPaymentsByTenantId(row.id);
          return tenantFromDb(row, payments);
        })
      );
      return { data: tenants, error: null, count: tenants.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('tenants')
    .select('*', { count: 'exact' })
    .returns<TenantRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const tenants = await Promise.all(
    (data || []).map(async (row) => {
      const { data: payments } = await getPaymentsByTenantId(row.id);
      return tenantFromDb(row, payments);
    })
  );

  return { data: tenants, error: null, count: count || tenants.length };
}

/**
 * Get tenant by ID with payment history
 */
export async function getById(id: string): Promise<ServiceResult<Tenant>> {
  if (isDemoMode) {
    try {
      const row = getDemoById<TenantRow>('tenants', id);
      if (!row) {
        return failure('Tenant not found');
      }
      const { data: payments } = await getPaymentsByTenantId(id);
      return success(tenantFromDb(row, payments));
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .returns<TenantRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Tenant not found');
  }

  const { data: payments } = await getPaymentsByTenantId(id);
  return success(tenantFromDb(data, payments));
}

/**
 * Get tenants by property ID
 */
export async function getByPropertyId(propertyId: string): Promise<ServiceListResult<Tenant>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<TenantRow>('tenants');
      const filtered = rows.filter(row => row.property_id === propertyId);
      const tenants = await Promise.all(
        filtered.map(async (row) => {
          const { data: payments } = await getPaymentsByTenantId(row.id);
          return tenantFromDb(row, payments);
        })
      );
      return { data: tenants, error: null, count: tenants.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('tenants')
    .select('*', { count: 'exact' })
    .eq('property_id', propertyId)
    .returns<TenantRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const tenants = await Promise.all(
    (data || []).map(async (row) => {
      const { data: payments } = await getPaymentsByTenantId(row.id);
      return tenantFromDb(row, payments);
    })
  );

  return { data: tenants, error: null, count: count || tenants.length };
}

/**
 * Create new tenant
 */
export async function create(tenant: Omit<Tenant, 'id' | 'paymentHistory'>): Promise<ServiceResult<Tenant>> {
  if (isDemoMode) {
    try {
      const { generateId } = await import('./demoStore');
      const newTenant: Tenant = {
        ...tenant,
        id: generateId(),
        paymentHistory: [],
      };
      const row = tenantToDb(newTenant) as TenantRow;
      upsert('tenants', row);
      return success(newTenant);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = tenantToDb(tenant) as TenantInsert;
  const { data, error } = await supabase
    .from('tenants')
    .insert(row)
    .select()
    .returns<TenantRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Failed to create tenant');
  }

  return success(tenantFromDb(data, []));
}

/**
 * Update existing tenant
 */
export async function update(id: string, updates: Partial<Omit<Tenant, 'paymentHistory'>>): Promise<ServiceResult<Tenant>> {
  if (isDemoMode) {
    try {
      const existing = getDemoById<TenantRow>('tenants', id);
      if (!existing) {
        return failure('Tenant not found');
      }

      const { data: payments } = await getPaymentsByTenantId(id);
      const current = tenantFromDb(existing, payments);
      const updated = { ...current, ...updates };
      const row = tenantToDb(updated) as TenantRow;
      upsert('tenants', row);
      return success(updated);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = tenantToDb(updates) as Partial<TenantRow>;
  const { data, error } = await supabase
    .from('tenants')
    .update(row)
    .eq('id', id)
    .select()
    .returns<TenantRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Tenant not found');
  }

  const { data: payments } = await getPaymentsByTenantId(id);
  return success(tenantFromDb(data, payments));
}

/**
 * Delete tenant
 */
export async function deleteTenant(id: string): Promise<ServiceResult<void>> {
  if (isDemoMode) {
    try {
      const removed = removeItem('tenants', id);
      if (!removed) {
        return failure('Tenant not found');
      }
      return success(undefined as void);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id);

  if (error) {
    return failure(error);
  }

  return success(undefined as void);
}
