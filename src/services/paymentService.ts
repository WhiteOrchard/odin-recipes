import { supabase, isDemoMode } from '../lib/supabase';
import { getCollection, getById as getDemoById, upsert, removeItem } from './demoStore';
import { paymentFromDb, paymentToDb } from './mappers';
import { success, failure } from './types';
import type { PaymentRecord } from '../types';
import type { ServiceResult, ServiceListResult } from './types';
import type { Database } from '../types/database';

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

/**
 * Get all payments
 */
export async function getAll(): Promise<ServiceListResult<PaymentRecord>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<PaymentRow>('payments');
      const payments = rows.map(paymentFromDb);
      return { data: payments, error: null, count: payments.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .returns<PaymentRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const payments = (data || []).map(paymentFromDb);
  return { data: payments, error: null, count: count || payments.length };
}

/**
 * Get payments by tenant ID
 */
export async function getByTenantId(tenantId: string): Promise<ServiceListResult<PaymentRecord>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<PaymentRow>('payments');
      const filtered = rows.filter(row => row.tenant_id === tenantId);
      const payments = filtered.map(paymentFromDb);
      return { data: payments, error: null, count: payments.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .returns<PaymentRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const payments = (data || []).map(paymentFromDb);
  return { data: payments, error: null, count: count || payments.length };
}

/**
 * Get payment by ID
 */
export async function getById(id: string): Promise<ServiceResult<PaymentRecord>> {
  if (isDemoMode) {
    try {
      const row = getDemoById<PaymentRow>('payments', id);
      if (!row) {
        return failure('Payment not found');
      }
      return success(paymentFromDb(row));
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .returns<PaymentRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Payment not found');
  }

  return success(paymentFromDb(data));
}

/**
 * Create new payment
 */
export async function create(payment: Omit<PaymentRecord, 'id'>): Promise<ServiceResult<PaymentRecord>> {
  if (isDemoMode) {
    try {
      const { generateId } = await import('./demoStore');
      const newPayment: PaymentRecord = {
        ...payment,
        id: generateId(),
      };
      const row = paymentToDb(newPayment) as PaymentRow;
      upsert('payments', row);
      return success(newPayment);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = paymentToDb(payment) as PaymentInsert;
  const { data, error } = await supabase
    .from('payments')
    .insert(row)
    .select()
    .returns<PaymentRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Failed to create payment');
  }

  return success(paymentFromDb(data));
}

/**
 * Update existing payment
 */
export async function update(id: string, updates: Partial<PaymentRecord>): Promise<ServiceResult<PaymentRecord>> {
  if (isDemoMode) {
    try {
      const existing = getDemoById<PaymentRow>('payments', id);
      if (!existing) {
        return failure('Payment not found');
      }

      const updated = { ...paymentFromDb(existing), ...updates };
      const row = paymentToDb(updated) as PaymentRow;
      upsert('payments', row);
      return success(updated);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = paymentToDb(updates) as Partial<PaymentRow>;
  const { data, error } = await supabase
    .from('payments')
    .update(row)
    .eq('id', id)
    .select()
    .returns<PaymentRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Payment not found');
  }

  return success(paymentFromDb(data));
}

/**
 * Delete payment
 */
export async function deletePayment(id: string): Promise<ServiceResult<void>> {
  if (isDemoMode) {
    try {
      const removed = removeItem('payments', id);
      if (!removed) {
        return failure('Payment not found');
      }
      return success(undefined as void);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    return failure(error);
  }

  return success(undefined as void);
}
