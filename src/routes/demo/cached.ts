import { Elysia } from "elysia";

import { cachePlugin } from "../../plugins/cache";

export const cachedRoutes = new Elysia({ prefix: "/demo" })
  .use(cachePlugin())
  .get(
    "/cached",
    () => ({
      data: "This response is cached",
      generatedAt: new Date().toISOString(),
      random: Math.random(),
    }),
    {
      // 60 second TTL (KV minimum)
      cache: 60,
      detail: {
        summary: "Cached endpoint (60s TTL)",
        tags: ["Demo"],
      },
    }
  )
  .get(
    "/cached-long",
    () => ({
      data: "This response is cached for longer",
      generatedAt: new Date().toISOString(),
      random: Math.random(),
    }),
    {
      // 5 minute TTL
      cache: 300,
      detail: {
        summary: "Cached endpoint (5min TTL)",
        tags: ["Demo"],
      },
    }
  )
  .get(
    "/not-cached",
    () => ({
      data: "This response is NOT cached",
      generatedAt: new Date().toISOString(),
      random: Math.random(),
    }),
    {
      detail: {
        summary: "Non-cached endpoint",
        tags: ["Demo"],
      },
    }
  );
