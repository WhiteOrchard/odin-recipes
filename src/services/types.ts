/**
 * Service Layer Types
 *
 * Common types used across all service functions
 */

/**
 * Result type for single-item service operations
 */
export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Result type for list service operations
 */
export interface ServiceListResult<T> {
  data: T[];
  error: Error | null;
  count?: number;
}

/**
 * Options for list queries
 */
export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Helper to create a successful service result
 */
export function success<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

/**
 * Helper to create a successful list result
 */
export function successList<T>(data: T[], count?: number): ServiceListResult<T> {
  return { data, error: null, count };
}

/**
 * Helper to create an error service result
 */
export function failure<T>(error: Error | string): ServiceResult<T> {
  const err = typeof error === 'string' ? new Error(error) : error;
  return { data: null, error: err };
}

/**
 * Helper to create an error list result
 */
export function failureList<T>(error: Error | string): ServiceListResult<T> {
  const err = typeof error === 'string' ? new Error(error) : error;
  return { data: [], error: err };
}
