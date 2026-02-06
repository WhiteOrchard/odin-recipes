import { supabase, isDemoMode } from '../lib/supabase';
import { getCollection, getById as getDemoById, upsert, removeItem } from './demoStore';
import { maintenanceFromDb, maintenanceToDb } from './mappers';
import { success, failure } from './types';
import type { MaintenanceRequest } from '../types';
import type { ServiceResult, ServiceListResult } from './types';
import type { Database } from '../types/database';

type MaintenanceRow = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceInsert = Database['public']['Tables']['maintenance_requests']['Insert'];

/**
 * Get all maintenance requests
 */
export async function getAll(): Promise<ServiceListResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<MaintenanceRow>('maintenance_requests');
      const requests = rows.map(maintenanceFromDb);
      return { data: requests, error: null, count: requests.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('maintenance_requests')
    .select('*', { count: 'exact' })
    .returns<MaintenanceRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const requests = (data || []).map(maintenanceFromDb);
  return { data: requests, error: null, count: count || requests.length };
}

/**
 * Get maintenance requests by property ID
 */
export async function getByPropertyId(propertyId: string): Promise<ServiceListResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<MaintenanceRow>('maintenance_requests');
      const filtered = rows.filter(row => row.property_id === propertyId);
      const requests = filtered.map(maintenanceFromDb);
      return { data: requests, error: null, count: requests.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('maintenance_requests')
    .select('*', { count: 'exact' })
    .eq('property_id', propertyId)
    .returns<MaintenanceRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const requests = (data || []).map(maintenanceFromDb);
  return { data: requests, error: null, count: count || requests.length };
}

/**
 * Get maintenance requests by status
 */
export async function getByStatus(status: MaintenanceRequest['status']): Promise<ServiceListResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<MaintenanceRow>('maintenance_requests');
      const filtered = rows.filter(row => row.status === status);
      const requests = filtered.map(maintenanceFromDb);
      return { data: requests, error: null, count: requests.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('maintenance_requests')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .returns<MaintenanceRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const requests = (data || []).map(maintenanceFromDb);
  return { data: requests, error: null, count: count || requests.length };
}

/**
 * Get maintenance request by ID
 */
export async function getById(id: string): Promise<ServiceResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const row = getDemoById<MaintenanceRow>('maintenance_requests', id);
      if (!row) {
        return failure('Maintenance request not found');
      }
      return success(maintenanceFromDb(row));
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('id', id)
    .returns<MaintenanceRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Maintenance request not found');
  }

  return success(maintenanceFromDb(data));
}

/**
 * Create new maintenance request
 */
export async function create(request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const { generateId } = await import('./demoStore');
      const now = new Date().toISOString();
      const newRequest: MaintenanceRequest = {
        ...request,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const row = maintenanceToDb(newRequest) as MaintenanceRow;
      upsert('maintenance_requests', row);
      return success(newRequest);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = maintenanceToDb(request) as MaintenanceInsert;
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert(row)
    .select()
    .returns<MaintenanceRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Failed to create maintenance request');
  }

  return success(maintenanceFromDb(data));
}

/**
 * Update existing maintenance request
 */
export async function update(id: string, updates: Partial<Omit<MaintenanceRequest, 'id' | 'createdAt'>>): Promise<ServiceResult<MaintenanceRequest>> {
  if (isDemoMode) {
    try {
      const existing = getDemoById<MaintenanceRow>('maintenance_requests', id);
      if (!existing) {
        return failure('Maintenance request not found');
      }

      const current = maintenanceFromDb(existing);
      const updated: MaintenanceRequest = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const row = maintenanceToDb(updated) as MaintenanceRow;
      upsert('maintenance_requests', row);
      return success(updated);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = maintenanceToDb({ ...updates, updatedAt: new Date().toISOString() }) as Partial<MaintenanceRow>;
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(row)
    .eq('id', id)
    .select()
    .returns<MaintenanceRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Maintenance request not found');
  }

  return success(maintenanceFromDb(data));
}

/**
 * Delete maintenance request
 */
export async function deleteMaintenanceRequest(id: string): Promise<ServiceResult<void>> {
  if (isDemoMode) {
    try {
      const removed = removeItem('maintenance_requests', id);
      if (!removed) {
        return failure('Maintenance request not found');
      }
      return success(undefined as void);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { error } = await supabase
    .from('maintenance_requests')
    .delete()
    .eq('id', id);

  if (error) {
    return failure(error);
  }

  return success(undefined as void);
}
