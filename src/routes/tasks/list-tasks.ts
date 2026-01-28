import { Elysia, t } from "elysia";

import { Task } from "../../schemas/task";

export const listTasksRoute = new Elysia().get(
  "/tasks",
  ({ query: _query }) => [
    {
      completed: false,
      due_date: "2025-01-05",
      name: "Clean my room",
      slug: "clean-room",
    },
    {
      completed: true,
      description: "Lorem Ipsum",
      due_date: "2022-12-24",
      name: "Build something awesome with Cloudflare Workers",
      slug: "cloudflare-workers",
    },
  ],
  {
    detail: {
      summary: "List Tasks",
      tags: ["Tasks"],
    },
    query: t.Object({
      isCompleted: t.Optional(
        t.Boolean({ description: "Filter by completed flag" })
      ),
      page: t.Number({ default: 1, description: "Page number" }),
    }),
    response: {
      200: t.Array(Task),
    },
  }
);
