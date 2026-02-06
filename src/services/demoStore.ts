/**
 * Demo Store - localStorage CRUD Engine
 *
 * Provides localStorage-based data persistence for demo mode.
 * Seeds data from mockData.ts on first load.
 */

const DEMO_STORE_PREFIX = 'concrete_demo_';
const INITIALIZED_KEY = `${DEMO_STORE_PREFIX}initialized`;

/**
 * Get a collection from localStorage
 */
export function getCollection<T>(key: string): T[] {
  const storageKey = `${DEMO_STORE_PREFIX}${key}`;
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
}

/**
 * Set a collection in localStorage
 */
export function setCollection<T>(key: string, data: T[]): void {
  const storageKey = `${DEMO_STORE_PREFIX}${key}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

/**
 * Get a single item by ID
 */
export function getById<T extends { id: string }>(key: string, id: string): T | null {
  const collection = getCollection<T>(key);
  return collection.find((item) => item.id === id) ?? null;
}

/**
 * Upsert (create or update) an item in a collection
 */
export function upsert<T extends { id: string }>(key: string, item: T): T {
  const collection = getCollection<T>(key);
  const index = collection.findIndex((i) => i.id === item.id);

  if (index >= 0) {
    collection[index] = item;
  } else {
    collection.push(item);
  }

  setCollection(key, collection);
  return item;
}

/**
 * Remove an item from a collection
 */
export function removeItem<T extends { id: string }>(key: string, id: string): boolean {
  const collection = getCollection<T>(key);
  const filtered = collection.filter((item) => item.id !== id);

  if (filtered.length === collection.length) {
    return false; // Item not found
  }

  setCollection(key, filtered);
  return true;
}

/**
 * Clear a specific collection
 */
export function clearCollection(key: string): void {
  const storageKey = `${DEMO_STORE_PREFIX}${key}`;
  localStorage.removeItem(storageKey);
}

/**
 * Clear all demo data
 */
export function clearAllData(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DEMO_STORE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Check if demo data has been initialized
 */
export function isInitialized(): boolean {
  return localStorage.getItem(INITIALIZED_KEY) === 'true';
}

/**
 * Mark demo data as initialized
 */
export function markInitialized(): void {
  localStorage.setItem(INITIALIZED_KEY, 'true');
}

/**
 * Initialize demo data from mockData
 * This should be called once on first app load in demo mode
 */
export async function initializeDemoData(): Promise<void> {
  if (isInitialized()) {
    return;
  }

  try {
    // Import mockData dynamically to avoid bundling it unnecessarily
    const { properties, tenants, maintenanceRequests, calendarEvents } = await import('../data/mockData');

    // Seed collections
    setCollection('properties', properties);
    setCollection('tenants', tenants);
    setCollection('maintenance_requests', maintenanceRequests);
    setCollection('calendar_events', calendarEvents);
    setCollection('payments', []);

    // Mark as initialized
    markInitialized();

    console.log('[DemoStore] Demo data initialized from mockData');
  } catch (error) {
    console.error('[DemoStore] Failed to initialize demo data:', error);
  }
}

/**
 * Generate a new ID for demo mode (simple UUID-like)
 */
export function generateId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
