import { Elysia } from "elysia";

import { rateLimitPlugin } from "../../plugins/rate-limit";

export const rateLimitedRoutes = new Elysia({ prefix: "/demo" })
  .use(rateLimitPlugin())
  .get(
    "/rate-limited",
    () => ({
      message: "This endpoint is rate limited",
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: "Rate limited endpoint (5 req/min)",
        tags: ["Demo"],
      },
      // 5 requests per minute
      rateLimit: { max: 5, window: 60 },
    }
  )
  .get(
    "/rate-limited-strict",
    () => ({
      message: "This endpoint has strict rate limiting",
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: "Strictly rate limited endpoint (3 req/60s)",
        tags: ["Demo"],
      },
      // 3 requests per 60 seconds (KV minimum TTL)
      rateLimit: { max: 3, window: 60 },
    }
  )
  .get(
    "/no-limit",
    () => ({
      message: "This endpoint has no rate limit",
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: "No rate limit endpoint",
        tags: ["Demo"],
      },
    }
  );
