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

Open [http://localhost:8789/docs](http://localhost:8789/docs) to see the API docs - Scalar UI 🎉

Access the OpenAPI specification:

- **JSON**: [http://localhost:8789/docs/openapi.json](http://localhost:8789/docs/openapi.json)

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
├── routes/               # 📍 API route handlers
│   └── tasks/
│       ├── create-task.ts
│       ├── delete-task.ts
│       ├── get-task.ts
│       └── list-tasks.ts
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

Configure bindings (KV, D1, R2, etc.) in `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [{ "binding": "MY_KV", "id": "xxx" }],
  "d1_databases": [
    { "binding": "MY_DB", "database_name": "my-db", "database_id": "xxx" },
  ],
}
```

Generate types after adding bindings:

```bash
bun run cf-typegen
```

Access bindings in your routes via the Elysia context.

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
