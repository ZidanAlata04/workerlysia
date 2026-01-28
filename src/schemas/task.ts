import { t } from "elysia";

export const Task = t.Object({
  completed: t.Boolean({ default: false }),
  description: t.Optional(t.String()),
  due_date: t.String({ format: "date" }),
  name: t.String({ examples: ["lorem"] }),
  slug: t.String(),
});
