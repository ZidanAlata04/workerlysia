import { env } from "cloudflare:workers";
import { Elysia, t } from "elysia";

export const bucketRoutes = new Elysia({ prefix: "/bucket" })
  .get(
    "/",
    async ({ status }) => {
      try {
        const listed = await env.BUCKET.list();
        return {
          objects: listed.objects.map((obj) => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
          })),
        };
      } catch (error) {
        return status(500, {
          error: "Failed to list objects",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "List all objects",
        tags: ["R2"],
      },
    }
  )
  .get(
    "/:key",
    async ({ params, status }) => {
      try {
        const object = await env.BUCKET.get(params.key);
        if (!object) {
          return status(404, { error: "Object not found" });
        }
        const buffer = await object.arrayBuffer();
        const base64 = btoa(String.fromCodePoint(...new Uint8Array(buffer)));
        return {
          content: base64,
          encoding: "base64",
          key: params.key,
          size: object.size,
        };
      } catch (error) {
        return status(500, {
          error: "Failed to get object",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Get object by key",
        tags: ["R2"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  )
  .put(
    "/:key",
    async ({ body, params, status }) => {
      try {
        await env.BUCKET.put(params.key, body.content);
        return { key: params.key, size: body.content.length };
      } catch (error) {
        return status(500, {
          error: "Failed to upload object",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      body: t.Object({ content: t.String() }),
      detail: {
        summary: "Upload object",
        tags: ["R2"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  )
  .delete(
    "/:key",
    async ({ params, status }) => {
      try {
        await env.BUCKET.delete(params.key);
        return { deleted: params.key };
      } catch (error) {
        return status(500, {
          error: "Failed to delete object",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Delete object",
        tags: ["R2"],
      },
      params: t.Object({ key: t.String({ minLength: 1 }) }),
    }
  );
