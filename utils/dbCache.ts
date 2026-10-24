interface DbCacheEntry<T> {
  data: T;
  storedAt: number;
}

/** Short-lived cache for list/aggregate queries. */
const DEFAULT_MAX_AGE_MS = 30_000;

const cache = new Map<string, DbCacheEntry<unknown>>();

const CACHE_PREFIXES = {
  services: "services:",
  payments: "payments:",
  dashboard: "dashboard:",
} as const;

function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Stable keys shared by the hooks that read and invalidate cached queries. */
export const dbCacheKeys = {
  allServices: "services:all",
  servicesByDate: (date: string): string => `services:date:${date}`,
  serviceDatesByMonth: (year: number, month: number): string =>
    `services:dates:${formatMonthKey(year, month)}`,
  paymentsByDate: (date: string): string => `payments:date:${date}`,
  paymentDatesByMonth: (year: number, month: number): string =>
    `payments:dates:${formatMonthKey(year, month)}`,
  dashboard: (year: number, month: number): string =>
    `dashboard:${formatMonthKey(year, month)}`,
} as const;

/** Returns a cached value when it is still fresh; stale entries are discarded. */
export function readDbCache<T>(
  key: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS
): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (Date.now() - entry.storedAt > maxAgeMs) {
    cache.delete(key);
    return undefined;
  }

  return entry.data as T;
}

/** Stores the latest successful query result for a short period. */
export function writeDbCache<T>(key: string, data: T): void {
  cache.set(key, { data, storedAt: Date.now() });
}

/** Removes all entries whose keys start with any of the supplied prefixes. */
export function invalidateDbCache(
  prefixes: string | readonly string[]
): void {
  const prefixList = typeof prefixes === "string" ? [prefixes] : prefixes;

  for (const key of cache.keys()) {
    if (prefixList.some((prefix) => key.startsWith(prefix))) {
      cache.delete(key);
    }
  }
}

/** Invalidates service lists and the dashboard after a service mutation. */
export function invalidateServiceDataCache(): void {
  invalidateDbCache([CACHE_PREFIXES.services, CACHE_PREFIXES.dashboard]);
}

/** Invalidates payment lists and the dashboard after a payment mutation. */
export function invalidatePaymentDataCache(): void {
  invalidateDbCache([CACHE_PREFIXES.payments, CACHE_PREFIXES.dashboard]);
}
