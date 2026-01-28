# ⚡ Workerlysia

A modern starter kit for building **type-safe APIs** with [Elysia](https://elysiajs.com/) on [Cloudflare Workers](https://workers.cloudflare.com/).

[![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-1.4+-blue)](https://elysiajs.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

- 🚀 **Elysia Framework** - Ergonomic, type-safe web framework with end-to-end type safety
- ☁️ **Cloudflare Workers** - Deploy to the edge with zero cold starts
- 📖 **OpenAPI 3.1** - Auto-generated API documentation at `/docs`
- 🔒 **Type Safety** - Full TypeScript support with strict mode
- ✅ **Request Validation** - Schema-based validation using TypeBox
- 🔌 **KV-Powered Plugins** - Built-in cache and rate limiting using Cloudflare KV
- 🛠️ **Ultracite** - Zero-config linting & formatting (Oxlint + Oxfmt)
- 🪝 **Git Hooks** - Husky + Commitlint for automated quality checks
- ⚡ **Bun Runtime** - Fast package manager and test runner

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works great)

### Setup

```bash
# Clone the repository
git clone https://github.com/DobroslavRadosavljevic/workerlysia.git
cd workerlysia

# Install dependencies
bun install

# Set up environment variables (optional)
cp .env.example .env

# Start development server
bun run dev
```

Open [http://localhost:8787/docs](http://localhost:8787/docs) to see the API docs - Scalar UI 🎉

Access the OpenAPI specification:

- **JSON**: [http://localhost:8787/docs/openapi.json](http://localhost:8787/docs/openapi.json)

### Deploy

```bash
# Login to Cloudflare (first time only)
bunx wrangler login

# Deploy to production
bun run deploy
```

## 📁 Project Structure

```
src/
├── index.ts              # 🏠 App entrypoint - registers routes & plugins
├── plugins/              # 🔌 Reusable Elysia plugins
│   ├── cache.ts          # Response caching with KV
│   └── rate-limit.ts     # Rate limiting with KV
├── routes/               # 📍 API route handlers
│   ├── demo/             # Demo routes for plugins
│   ├── storage/          # KV, D1, R2 example routes
│   └── tasks/            # Task CRUD routes
└── schemas/              # 📐 Validation schemas (TypeBox)
    └── task.ts
```

## 📜 Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `bun run dev`        | 🔧 Start local development server    |
| `bun run deploy`     | 🚀 Deploy to Cloudflare Workers      |
| `bun run lint`       | 🔍 Check code for issues             |
| `bun run format`     | ✨ Auto-fix formatting & lint issues |
| `bun run typecheck`  | 📋 Run TypeScript type checking      |
| `bun run cf-typegen` | 📝 Generate Cloudflare binding types |

## 🪝 Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [Commitlint](https://commitlint.js.org/) for automated checks:

| Hook         | Action                             |
| ------------ | ---------------------------------- |
| `pre-commit` | 🔍 Runs linting and type checking  |
| `commit-msg` | 📝 Validates commit message format |

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add user authentication       # ✅ New feature
fix: resolve login bug              # ✅ Bug fix
docs: update API documentation      # ✅ Documentation
chore: update dependencies          # ✅ Maintenance
refactor: simplify route handler    # ✅ Code refactor
```

## 🏗️ Adding New Routes

1. **Create a schema** in `src/schemas/`:

```typescript
// src/schemas/user.ts
import { t } from "elysia";

export const User = t.Object({
  id: t.String(),
  name: t.String({ examples: ["John Doe"] }),
  email: t.String({ format: "email" }),
});
```

2. **Create a route** in `src/routes/`:

```typescript
// src/routes/users/get-user.ts
import { Elysia, t } from "elysia";
import { User } from "../../schemas/user";

export const getUserRoute = new Elysia().get(
  "/users/:id",
  ({ params }) => {
    // Your logic here
    return { id: params.id, name: "John", email: "john@example.com" };
  },
  {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "Get user by ID",
      tags: ["Users"],
    },
    response: { 200: User },
  }
);
```

3. **Register the route** in `src/index.ts`:

```typescript
import { getUserRoute } from "./routes/users/get-user";

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    openapi({
      /* ... */
    })
  )
  .use(getUserRoute) // 👈 Add your route
  .compile();
```

## ☁️ Cloudflare Bindings

This starter includes pre-configured bindings for KV, D1, and R2. To set up your own:

```bash
# Login to Cloudflare (first time only)
bunx wrangler login
```

### KV (Key-Value Storage)

```bash
bunx wrangler kv namespace create KV
```

Update `wrangler.jsonc` with the generated `id`:

```jsonc
{
  "kv_namespaces": [{ "binding": "KV", "id": "your-namespace-id" }],
}
```

**Usage:**

```typescript
export const myRoute = new Elysia().get("/kv-example", async ({ env }) => {
  await env.KV.put("key", "value");
  const value = await env.KV.get("key");
  return { value };
});
```

### D1 (SQL Database)

```bash
bunx wrangler d1 create my-database
```

Update `wrangler.jsonc` with the generated `database_id`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "your-database-id",
    },
  ],
}
```

**Usage:**

```typescript
export const myRoute = new Elysia().get("/db-example", async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM users").all();
  return { users: results };
});
```

### R2 (Object Storage)

```bash
bunx wrangler r2 bucket create my-bucket
```

Update `wrangler.jsonc`:

```jsonc
{
  "r2_buckets": [{ "binding": "BUCKET", "bucket_name": "my-bucket" }],
}
```

**Usage:**

```typescript
export const myRoute = new Elysia().get("/r2-example", async ({ env }) => {
  await env.BUCKET.put("file.txt", "Hello, World!");
  const object = await env.BUCKET.get("file.txt");
  return { content: await object?.text() };
});
```

### Regenerate Types

Always run this after modifying bindings in `wrangler.jsonc`:

```bash
bun run cf-typegen
```

## 🔌 Plugins

This starter includes two KV-powered plugins that can be enabled per-route using Elysia macros.

### Cache Plugin

Cache responses in Cloudflare KV with configurable TTL.

```typescript
import { cachePlugin } from "./plugins/cache";

new Elysia()
  .use(cachePlugin())
  .get("/data", () => fetchExpensiveData(), {
    cache: 300, // Cache for 300 seconds
  })
  .get("/no-cache", () => getData()); // No caching (macro not defined)
```

**Response headers:**

- `x-cache: HIT` - Served from cache
- `x-cache: MISS` - Fresh response, now cached

### Rate Limit Plugin

Limit requests per client using Cloudflare KV.

```typescript
import { rateLimitPlugin } from "./plugins/rate-limit";

new Elysia()
  .use(rateLimitPlugin())
  .get("/api/data", () => getData(), {
    rateLimit: { max: 100, window: 60 }, // 100 requests per 60 seconds
  })
  .get("/public", () => getPublic()); // No rate limiting (macro not defined)
```

**Response headers:**

- `x-ratelimit-limit` - Maximum requests allowed
- `x-ratelimit-remaining` - Requests remaining in window
- `x-ratelimit-reset` - Seconds until window resets
- `retry-after` - Seconds to wait (when rate limited)

**Note:** Cloudflare KV has a minimum TTL of 60 seconds.

## 📚 Resources

- 📖 [Elysia Documentation](https://elysiajs.com/introduction.html)
- ☁️ [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- 🔧 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- 📐 [TypeBox Schema](https://github.com/sinclairzx81/typebox)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- 🐛 [Report bugs](https://github.com/DobroslavRadosavljevic/workerlysia/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/DobroslavRadosavljevic/workerlysia/issues/new?template=feature_request.md)
- 📖 Improve documentation
- 🔧 Submit pull requests

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
```

This project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## 🔒 Security

Found a vulnerability? Please review our [Security Policy](SECURITY.md) for reporting guidelines.

## 💖 Support

If you find this project useful, consider giving it a ⭐ on GitHub!

## 📄 License

MIT License - feel free to use this starter for your own projects!

---

<p align="center">
  Built with 💜 using <a href="https://elysiajs.com/">Elysia</a> and <a href="https://workers.cloudflare.com/">Cloudflare Workers</a>
</p>
