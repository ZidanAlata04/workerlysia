import { Elysia } from "elysia";

import { Task } from "../../schemas/task";

export const createTaskRoute = new Elysia().post(
  "/tasks",
  ({ body: _body }) => ({
    completed: false,
    description: "this needs to be done",
    due_date: new Date().toISOString().slice(0, 10),
    name: "my task",
    slug: "my-task",
  }),
  {
    body: Task,
    detail: {
      summary: "Create a new Task",
      tags: ["Tasks"],
    },
    response: {
      200: Task,
    },
  }
);
