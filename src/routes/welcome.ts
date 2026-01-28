import { Elysia, t } from "elysia";

export const welcomeRoute = new Elysia().get(
  "/",
  () => ({
    docs: "/docs",
    message: "Welcome to Workerlysia API",
    version: "1.0.0",
  }),
  {
    detail: {
      summary: "Welcome",
      tags: ["General"],
    },
    response: {
      200: t.Object({
        docs: t.String(),
        message: t.String(),
        version: t.String(),
      }),
    },
  }
);
