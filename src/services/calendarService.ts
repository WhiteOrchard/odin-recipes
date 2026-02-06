import { supabase, isDemoMode } from '../lib/supabase';
import { getCollection, getById as getDemoById, upsert, removeItem } from './demoStore';
import { calendarEventFromDb, calendarEventToDb } from './mappers';
import { success, failure } from './types';
import type { CalendarEvent } from '../types';
import type { ServiceResult, ServiceListResult } from './types';
import type { Database } from '../types/database';

type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row'];
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];

/**
 * Get all calendar events
 */
export async function getAll(): Promise<ServiceListResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<CalendarEventRow>('calendar_events');
      const events = rows.map(calendarEventFromDb);
      return { data: events, error: null, count: events.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('calendar_events')
    .select('*', { count: 'exact' })
    .returns<CalendarEventRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const events = (data || []).map(calendarEventFromDb);
  return { data: events, error: null, count: count || events.length };
}

/**
 * Get calendar events by property ID
 */
export async function getByPropertyId(propertyId: string): Promise<ServiceListResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<CalendarEventRow>('calendar_events');
      const filtered = rows.filter(row => row.property_id === propertyId);
      const events = filtered.map(calendarEventFromDb);
      return { data: events, error: null, count: events.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('calendar_events')
    .select('*', { count: 'exact' })
    .eq('property_id', propertyId)
    .returns<CalendarEventRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const events = (data || []).map(calendarEventFromDb);
  return { data: events, error: null, count: count || events.length };
}

/**
 * Get calendar events by date range
 */
export async function getByDateRange(startDate: string, endDate: string): Promise<ServiceListResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const rows = getCollection<CalendarEventRow>('calendar_events');
      const filtered = rows.filter(row => row.date >= startDate && row.date <= endDate);
      const events = filtered.map(calendarEventFromDb);
      return { data: events, error: null, count: events.length };
    } catch (error) {
      return { data: [], error: error as Error, count: 0 };
    }
  }

  const { data, error, count } = await supabase
    .from('calendar_events')
    .select('*', { count: 'exact' })
    .gte('date', startDate)
    .lte('date', endDate)
    .returns<CalendarEventRow[]>();

  if (error) {
    return { data: [], error, count: 0 };
  }

  const events = (data || []).map(calendarEventFromDb);
  return { data: events, error: null, count: count || events.length };
}

/**
 * Get calendar event by ID
 */
export async function getById(id: string): Promise<ServiceResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const row = getDemoById<CalendarEventRow>('calendar_events', id);
      if (!row) {
        return failure('Calendar event not found');
      }
      return success(calendarEventFromDb(row));
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .returns<CalendarEventRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Calendar event not found');
  }

  return success(calendarEventFromDb(data));
}

/**
 * Create new calendar event
 */
export async function create(event: Omit<CalendarEvent, 'id'>): Promise<ServiceResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const { generateId } = await import('./demoStore');
      const newEvent: CalendarEvent = {
        ...event,
        id: generateId(),
      };
      const row = calendarEventToDb(newEvent) as CalendarEventRow;
      upsert('calendar_events', row);
      return success(newEvent);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = calendarEventToDb(event) as CalendarEventInsert;
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(row)
    .select()
    .returns<CalendarEventRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Failed to create calendar event');
  }

  return success(calendarEventFromDb(data));
}

/**
 * Update existing calendar event
 */
export async function update(id: string, updates: Partial<CalendarEvent>): Promise<ServiceResult<CalendarEvent>> {
  if (isDemoMode) {
    try {
      const existing = getDemoById<CalendarEventRow>('calendar_events', id);
      if (!existing) {
        return failure('Calendar event not found');
      }

      const updated = { ...calendarEventFromDb(existing), ...updates };
      const row = calendarEventToDb(updated) as CalendarEventRow;
      upsert('calendar_events', row);
      return success(updated);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const row = calendarEventToDb(updates) as Partial<CalendarEventRow>;
  const { data, error } = await supabase
    .from('calendar_events')
    .update(row)
    .eq('id', id)
    .select()
    .returns<CalendarEventRow>()
    .single();

  if (error) {
    return failure(error);
  }

  if (!data) {
    return failure('Calendar event not found');
  }

  return success(calendarEventFromDb(data));
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<ServiceResult<void>> {
  if (isDemoMode) {
    try {
      const removed = removeItem('calendar_events', id);
      if (!removed) {
        return failure('Calendar event not found');
      }
      return success(undefined as void);
    } catch (error) {
      return failure(error as Error);
    }
  }

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    return failure(error);
  }

  return success(undefined as void);
}
