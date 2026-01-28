import { Elysia, t } from "elysia";

import { Task } from "../../schemas/task";

export const getTaskRoute = new Elysia().get(
  "/tasks/:taskSlug",
  ({ params, status }) => {
    const { taskSlug } = params;

    // Implement your own object fetch here
    const exists = true;

    if (!exists) {
      return status(404, {
        error: "Object not found",
        success: false,
      });
    }

    return {
      completed: false,
      description: "this needs to be done",
      due_date: new Date().toISOString().slice(0, 10),
      name: "my task",
      slug: taskSlug,
    };
  },
  {
    detail: {
      summary: "Get a single Task by slug",
      tags: ["Tasks"],
    },
    params: t.Object({
      taskSlug: t.String({ description: "Task slug" }),
    }),
    response: {
      200: Task,
      404: t.Object({
        error: t.String(),
        success: t.Boolean(),
      }),
    },
  }
);
