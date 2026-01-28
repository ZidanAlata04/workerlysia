import { env } from "cloudflare:workers";
import { Elysia } from "elysia";

export interface CacheOptions {
  /**
   * Time to live in seconds (minimum 60)
   * @default 60
   */
  ttl?: number;
  /**
   * Key prefix for cache entries
   * @default "cache"
   */
  prefix?: string;
}

const MIN_TTL = 60;
const DEFAULT_TTL = 60;
const DEFAULT_PREFIX = "cache";

const getCacheKey = (
  prefix: string,
  path: string,
  searchParams: URLSearchParams
): string => {
  const sortedParams = new URLSearchParams(
    [...searchParams.entries()].toSorted((a, b) => a[0].localeCompare(b[0]))
  );
  const queryPart = sortedParams.toString()
    ? `?${sortedParams.toString()}`
    : "";
  return `${prefix}:${path}${queryPart}`;
};

/**
 * Cache plugin for Elysia using Cloudflare KV
 *
 * @example
 * ```ts
 * app
 *   .use(cachePlugin())
 *   .get('/data', () => fetchExpensiveData(), { cache: 300 })
 * ```
 */
export const cachePlugin = (options: CacheOptions = {}) => {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const defaultTtl = options.ttl ?? DEFAULT_TTL;

  return new Elysia({ name: "cache" })
    .derive({ as: "global" }, ({ request }) => {
      const url = new URL(request.url);
      return {
        cacheKey: getCacheKey(prefix, url.pathname, url.searchParams),
      };
    })
    .macro({
      cache: (ttl?: number | boolean) => ({
        async afterHandle({ cacheKey, set, responseValue }) {
          if (!ttl) {
            return;
          }

          const requestedTtl = typeof ttl === "number" ? ttl : defaultTtl;
          const actualTtl = Math.max(MIN_TTL, requestedTtl);
          const contentType = set.headers["content-type"] ?? "application/json";

          try {
            await env.KV.put(
              cacheKey,
              JSON.stringify({
                body: JSON.stringify(responseValue),
                contentType,
              }),
              { expirationTtl: actualTtl }
            );
          } catch {
            // Fail open: cache write errors should not affect the response
          }
        },
        async beforeHandle({ cacheKey, set }) {
          if (!ttl) {
            return;
          }

          try {
            const cached = await env.KV.get(cacheKey);
            if (cached) {
              const parsed = JSON.parse(cached) as {
                body: string;
                contentType: string;
              };
              set.headers["x-cache"] = "HIT";
              set.headers["content-type"] = parsed.contentType;
              return JSON.parse(parsed.body) as unknown;
            }
          } catch {
            // Fail open: cache read/parse errors should not affect the request
          }
          set.headers["x-cache"] = "MISS";
        },
      }),
    });
};
