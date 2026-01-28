# Workerlysia

A **Cloudflare Worker** API built with **Elysia** framework and **Bun** runtime.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: [Elysia](https://elysiajs.com/) with CloudflareAdapter
- **Package Manager**: Bun
- **Language**: TypeScript (strict mode)
- **API Documentation**: OpenAPI via `@elysiajs/openapi` (available at `/docs`)
- **Linting/Formatting**: Ultracite (Oxlint + Oxfmt)
- **Git Hooks**: Husky + Commitlint (Conventional Commits)

## Commands

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `bun run dev`        | Start local development server      |
| `bun run deploy`     | Deploy to Cloudflare Workers        |
| `bun run lint`       | Check code for issues               |
| `bun run format`     | Auto-fix formatting and lint issues |
| `bun run typecheck`  | Run TypeScript type checking        |
| `bun run cf-typegen` | Generate Cloudflare Worker types    |

## Project Structure

```
src/
├── index.ts           # App entrypoint - registers routes and plugins
├── routes/            # API route handlers (one file per endpoint)
│   └── tasks/
│       ├── create-task.ts
│       ├── delete-task.ts
│       ├── get-task.ts
│       └── list-tasks.ts
└── schemas/           # Elysia type schemas for validation
    └── task.ts
```

## Conventions

### Route Files

- Each route is a separate Elysia instance exported from its own file
- Routes are composed in `src/index.ts` using `.use()`
- Always include `detail` with `summary` and `tags` for OpenAPI documentation

```typescript
export const myRoute = new Elysia().get(
  "/path",
  ({ query }) => {
    /* handler */
  },
  {
    query: MyQuerySchema,
    detail: {
      summary: "Description for OpenAPI",
      tags: ["TagName"],
    },
    response: {
      200: ResponseSchema,
    },
  }
);
```

### Schemas

- Define schemas in `src/schemas/` using Elysia's `t` (TypeBox)
- Use descriptive examples and format hints for OpenAPI documentation

```typescript
import { t } from "elysia";

export const MySchema = t.Object({
  name: t.String({ examples: ["example"] }),
  date: t.String({ format: "date" }),
  optional: t.Optional(t.String()),
});
```

### Cloudflare Bindings

- Worker bindings (KV, D1, R2, etc.) are configured in `wrangler.jsonc`
- Types are generated with `bun run cf-typegen` into `worker-configuration.d.ts`
- Access bindings via the Elysia context (configured through CloudflareAdapter)

## Git Hooks

This project uses Husky and Commitlint for automated quality checks:

| Hook         | Action                         |
| ------------ | ------------------------------ |
| `pre-commit` | Runs `lint` and `typecheck`    |
| `commit-msg` | Validates Conventional Commits |

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
chore: maintenance tasks
refactor: code refactoring
```

## Development Workflow

1. Start dev server: `bun run dev`
2. View API docs: `http://localhost:8789/docs`
3. Make changes (hot reload enabled)
4. Commit (hooks run automatically)
5. Deploy: `bun run deploy`

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun run format` (or `bun x ultracite fix`)
- **Check for issues**: `bun run lint` (or `bun x ultracite check`)
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Validate and sanitize user input
- Use Elysia's schema validation for all request bodies and query parameters
- Never expose sensitive data in error responses

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Route structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun run format` before committing to ensure compliance.
