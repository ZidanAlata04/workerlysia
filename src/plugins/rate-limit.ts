import { env } from "cloudflare:workers";
import { Elysia } from "elysia";

export interface RateLimitOptions {
  /**
   * Maximum requests per window
   * @default 100
   */
  max?: number;
  /**
   * Time window in seconds (minimum 60)
   * @default 60
   */
  window?: number;
  /**
   * Key prefix for rate limit entries
   * @default "ratelimit"
   */
  prefix?: string;
  /**
   * Function to generate identifier (defaults to IP address)
   */
  keyGenerator?: (request: Request) => string;
}

interface RateLimitConfig {
  max: number;
  window: number;
}

interface RateLimitResult {
  current: number;
  exceeded: boolean;
  key: string;
  retryAfter: number;
}

const MIN_TTL = 60;
const DEFAULT_MAX = 100;
const DEFAULT_WINDOW = 60;
const DEFAULT_PREFIX = "ratelimit";

const getClientIp = (request: Request): string =>
  request.headers.get("cf-connecting-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "unknown";

const getRateLimitKey = (
  prefix: string,
  identifier: string,
  path: string
): string => `${prefix}:${identifier}:${path}`;

const checkRateLimit = async (
  rateLimitKey: string,
  max: number,
  window: number
): Promise<RateLimitResult> => {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % window);
  const key = `${rateLimitKey}:${windowStart}`;

  try {
    const currentStr = await env.KV.get(key);
    const parsed = currentStr ? Number.parseInt(currentStr, 10) : 0;
    const current = Number.isNaN(parsed) ? 0 : parsed;

    return {
      current,
      exceeded: current >= max,
      key,
      retryAfter: windowStart + window - now,
    };
  } catch {
    // Fail open: if KV read fails, allow the request
    return {
      current: 0,
      exceeded: false,
      key,
      retryAfter: windowStart + window - now,
    };
  }
};

/**
 * Rate limit plugin for Elysia using Cloudflare KV
 *
 * @example
 * ```ts
 * app
 *   .use(rateLimitPlugin())
 *   .get('/api/data', () => getData(), { rateLimit: { max: 10, window: 60 } })
 * ```
 */
export const rateLimitPlugin = (options: RateLimitOptions = {}) => {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const defaultMax = options.max ?? DEFAULT_MAX;
  const defaultWindow = options.window ?? DEFAULT_WINDOW;
  const keyGenerator = options.keyGenerator ?? getClientIp;

  return new Elysia({ name: "rate-limit" })
    .derive({ as: "global" }, ({ request }) => {
      const url = new URL(request.url);
      const identifier = keyGenerator(request);
      return {
        rateLimitIdentifier: identifier,
        rateLimitKey: getRateLimitKey(prefix, identifier, url.pathname),
      };
    })
    .macro({
      rateLimit: (config?: RateLimitConfig | boolean) => ({
        async beforeHandle({ rateLimitKey, status, set }) {
          if (!config) {
            return;
          }

          const max = typeof config === "object" ? config.max : defaultMax;
          const window =
            typeof config === "object" ? config.window : defaultWindow;
          const result = await checkRateLimit(rateLimitKey, max, window);

          set.headers["x-ratelimit-limit"] = String(max);
          set.headers["x-ratelimit-reset"] = String(result.retryAfter);

          if (result.exceeded) {
            set.headers["x-ratelimit-remaining"] = "0";
            set.headers["retry-after"] = String(result.retryAfter);
            return status(429, {
              error: "Too Many Requests",
              message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            });
          }

          set.headers["x-ratelimit-remaining"] = String(
            max - result.current - 1
          );

          try {
            await env.KV.put(result.key, String(result.current + 1), {
              expirationTtl: Math.max(MIN_TTL, window),
            });
          } catch {
            // Fail open: if counter increment fails, request still proceeds
          }
        },
      }),
    });
};
