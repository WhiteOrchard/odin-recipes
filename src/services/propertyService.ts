import { supabase, isDemoMode } from '../lib/supabase';
import { getCollection, getById as getDemoById, upsert, removeItem } from './demoStore';
import { propertyFromDb, propertyToDb } from './mappers';
import { success, failure } from './types';
import type { Property } from '../types';
import type { ServiceResult, ServiceListResult } from './types';
import type { Database } from '../types/database';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

/**
 * Get all properties
 */
export async function getAll(): Promise<ServiceListResult<Property>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<PropertyRow>('properties');
      const properties = rows.map(propertyFromDb);
      return { data: properties, error: null, count: properties.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .returns<PropertyRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const properties = (data || []).map(propertyFromDb);
  return { data: properties, error: null, count: count || properties.length };
}

/**
 * Get property by ID
 */
export async function getById(id: string): Promise<ServiceResult<Property>> {
  if (isDemoMode) {
    try {
      const row = getDemoById<PropertyRow>('properties', id);
      if (!row) {
        return failure('Property not found');
      }
      return success(propertyFromDb(row));
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .returns<PropertyRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Property not found');
  }

  return success(propertyFromDb(data));
}

/**
 * Create new property
 */
export async function create(property: Omit<Property, 'id'>): Promise<ServiceResult<Property>> {
  if (isDemoMode) {
    try {
      const { generateId } = await import('./demoStore');
      const newProperty: Property = {
        ...property,
        id: generateId(),
      };
      const row = propertyToDb(newProperty) as PropertyRow;
      upsert('properties', row);
      return success(newProperty);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = propertyToDb(property) as PropertyInsert;
  const { data, error } = await supabase
    .from('properties')
    .insert(row)
    .select()
    .returns<PropertyRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Failed to create property');
  }

  return success(propertyFromDb(data));
}

/**
 * Update existing property
 */
export async function update(id: string, updates: Partial<Property>): Promise<ServiceResult<Property>> {
  if (isDemoMode) {
    try {
      const existing = getDemoById<PropertyRow>('properties', id);
      if (!existing) {
        return failure('Property not found');
      }

      const updated = { ...propertyFromDb(existing), ...updates };
      const row = propertyToDb(updated) as PropertyRow;
      upsert('properties', row);
      return success(updated);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = propertyToDb(updates) as Partial<PropertyRow>;
  const { data, error } = await supabase
    .from('properties')
    .update(row)
    .eq('id', id)
    .select()
    .returns<PropertyRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Property not found');
  }

  return success(propertyFromDb(data));
}

/**
 * Delete property
 */
export async function deleteProperty(id: string): Promise<ServiceResult<void>> {
  if (isDemoMode) {
    try {
      const removed = removeItem('properties', id);
      if (!removed) {
        return failure('Property not found');
      }
      return success(undefined as void);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    return failure(error);
  }

  return success(undefined as void);
}
