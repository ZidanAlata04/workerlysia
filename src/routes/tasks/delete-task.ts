import { Elysia, t } from "elysia";

export const deleteTaskRoute = new Elysia().delete(
  "/tasks/:taskSlug",
  ({ params: _params }) => ({
    success: true,
  }),
  {
    detail: {
      summary: "Delete a Task",
      tags: ["Tasks"],
    },
    params: t.Object({
      taskSlug: t.String({ description: "Task slug" }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
      }),
    },
  }
);
