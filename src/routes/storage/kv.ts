import { env } from "cloudflare:workers";
import { Elysia, t } from "elysia";

export const kvRoutes = new Elysia({ prefix: "/kv" })
  .get(
    "/:key",
    async ({ params, status }) => {
      try {
        const value = await env.KV.get(params.key);
        if (!value) {
          return status(404, { error: "Key not found" });
        }
        return { key: params.key, value };
      } catch (error) {
        return status(500, {
          error: "Failed to retrieve key",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Get value by key",
        tags: ["KV"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  )
  .put(
    "/:key",
    async ({ body, params, status }) => {
      try {
        await env.KV.put(params.key, body.value);
        return { key: params.key, value: body.value };
      } catch (error) {
        return status(500, {
          error: "Failed to store key",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      body: t.Object({ value: t.String() }),
      detail: {
        summary: "Set value for key",
        tags: ["KV"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  )
  .delete(
    "/:key",
    async ({ params, status }) => {
      try {
        await env.KV.delete(params.key);
        return { deleted: params.key };
      } catch (error) {
        return status(500, {
          error: "Failed to delete key",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Delete key",
        tags: ["KV"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  );
