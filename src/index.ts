import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

import { createTaskRoute } from "./routes/tasks/create-task";
import { deleteTaskRoute } from "./routes/tasks/delete-task";
import { getTaskRoute } from "./routes/tasks/get-task";
import { listTasksRoute } from "./routes/tasks/list-tasks";
import { welcomeRoute } from "./routes/welcome";

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    openapi({
      documentation: {
        info: {
          title: "Tasks API",
          version: "1.0.0",
        },
      },
      path: "/docs",
    })
  )
  .use(welcomeRoute)
  .use(listTasksRoute)
  .use(createTaskRoute)
  .use(getTaskRoute)
  .use(deleteTaskRoute)
  .compile();

export default app;
