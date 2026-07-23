import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  statusCode: number;
  contentType: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const cache = new Map<string, CacheEntry>();

const PUBLIC_ROUTES = ['^/properties', '^/search', '^/categories', '^/health'];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => new RegExp(pattern).test(path));
}

function isGetRequest(req: Request): boolean {
  return req.method === 'GET';
}

function getCacheKey(req: Request): string {
  return `${req.originalUrl}`;
}

export function responseCache(req: Request, res: Response, next: NextFunction) {
  // Only cache GET requests on public routes
  if (!isGetRequest(req) || !isPublicRoute(req.originalUrl)) {
    return next();
  }

  const key = getCacheKey(req);
  const entry = cache.get(key);

  if (entry && entry.expiresAt > Date.now()) {
    res.set('Cache-Control', `max-age=60`);
    res.set('X-Cache', 'HIT');
    return res.status(entry.statusCode).type(entry.contentType).json(entry.body);
  }

  // Override the json/send methods to capture the response for caching
  const originalJson = res.json.bind(res);
  res.json = ((body: any) => {
    cache.set(key, {
      body,
      statusCode: res.statusCode,
      contentType: res.get('Content-Type') || 'application/json',
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    res.set('Cache-Control', 'max-age=60');
    res.set('X-Cache', 'MISS');
    // Trim the cache if it gets too large (LRU-style: drop oldest 100 entries)
    if (cache.size > 1000) {
      const entries = [...cache.entries()].map(([k, v]) => ({ k, expiresAt: v.expiresAt }));
      entries.sort((a, b) => a.expiresAt - b.expiresAt);
      for (let i = 0; i < 100; i++) {
        cache.delete(entries[i].k);
      }
    }
    return originalJson(body);
  }) as Response['json'];

  next();
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    const re = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (re.test(key)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
