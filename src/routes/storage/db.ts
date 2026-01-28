import { env } from "cloudflare:workers";
import { Elysia, t } from "elysia";

export const dbRoutes = new Elysia({ prefix: "/db" })
  .post(
    "/init",
    async ({ status }) => {
      try {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`
        ).run();
        return { message: "Table created" };
      } catch (error) {
        return status(500, {
          error: "Failed to initialize database",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Initialize database table",
        tags: ["D1"],
      },
    }
  )
  .get(
    "/notes",
    async ({ status }) => {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM notes ORDER BY created_at DESC"
        ).all();
        return { notes: results };
      } catch (error) {
        return status(500, {
          error: "Failed to list notes",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "List all notes",
        tags: ["D1"],
      },
    }
  )
  .post(
    "/notes",
    async ({ body, status }) => {
      try {
        const result = await env.DB.prepare(
          "INSERT INTO notes (content) VALUES (?)"
        )
          .bind(body.content)
          .run();
        return { content: body.content, id: result.meta.last_row_id };
      } catch (error) {
        return status(500, {
          error: "Failed to create note",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      body: t.Object({ content: t.String({ minLength: 1 }) }),
      detail: {
        summary: "Create a note",
        tags: ["D1"],
      },
    }
  )
  .delete(
    "/notes/:id",
    async ({ params, status }) => {
      const id = Number.parseInt(params.id, 10);
      if (Number.isNaN(id)) {
        return status(400, {
          error: "Invalid ID",
          message: "ID must be a valid integer",
        });
      }

      try {
        const result = await env.DB.prepare("DELETE FROM notes WHERE id = ?")
          .bind(id)
          .run();

        if (result.meta.changes === 0) {
          return status(404, {
            error: "Not found",
            message: `Note with ID ${id} not found`,
          });
        }

        return { deleted: id };
      } catch (error) {
        return status(500, {
          error: "Failed to delete note",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    {
      detail: {
        summary: "Delete a note",
        tags: ["D1"],
      },
      params: t.Object({ id: t.String() }),
    }
  );
