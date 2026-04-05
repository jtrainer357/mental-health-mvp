interface CacheEntry<T> {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry<any>>()

export function getCached<T>(key: string, ttlMs: number, fetchFn: () => T): T {
  const now = Date.now()
  const entry = store.get(key)
  if (entry && entry.expiry > now) {
    return entry.data as T
  }
  const data = fetchFn()
  store.set(key, { data, expiry: now + ttlMs })
  return data
}

export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear()
    return
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key)
  }
}
