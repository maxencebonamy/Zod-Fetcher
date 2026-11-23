# Zod Fetcher

A utility to wrap fetch calls with Zod schemas, for both requests and responses.

Define a service by passing an endpoint and a response schema: Zod Fetcher builds the URL, sends the request, validates the body and the response, and infers the return type from your schemas. It is meant for TypeScript projects that consume REST APIs and want to avoid repeating fetch boilerplate.

## Table of contents

- [Zod Fetcher](#zod-fetcher)
	- [Table of contents](#table-of-contents)
	- [How it works](#how-it-works)
	- [Tech stack](#tech-stack)
	- [Repository structure](#repository-structure)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
	- [Usage](#usage)
	- [Running locally](#running-locally)
	- [Useful scripts](#useful-scripts)
	- [API](#api)
	- [Tests and quality](#tests-and-quality)
	- [License](#license)

## How it works

1. **Client creation**: `createZodFetcher` registers a client under a unique key, with a base URL and an optional global request handler.
2. **Service definition**: `ZodFetcher.use(key)` returns the client. Its `get`, `post`, `put`, `patch` and `delete` methods take either a props object or a function returning one, and return an async function.
3. **Request building**: the base URL, the endpoint and the optional `params` are combined into the final URL. The global request handler, if any, is applied to the props first.
4. **Body validation**: for `post`, `put` and `patch`, the `body` is validated against `bodySchema` and sent as JSON.
5. **Response validation**: the response is validated against `responseSchema`, then passed to `responseHandler` if one is set. The return type of the service is inferred from the schema.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Language | TypeScript |
| Validation | Zod 3 |
| Build | tsup (ESM and CommonJS outputs, type declarations) |
| Tests | Vitest, `@vitest/coverage-v8` |
| Lint | ESLint, `@maxencebonamy/eslint-plugin` |
| Package manager | pnpm |

## Repository structure

```
.
├── src/
│   ├── client/        ZodFetcher class, client types and tests per HTTP method
│   ├── error/         ZodFetcherError and error types
│   ├── url/           URL and query string building
│   ├── utils/         fetch wrapper and shared helper types
│   ├── validation/    Zod validation helper
│   └── index.ts       Public entry point
├── tsup.config.json   Build configuration
└── vitest.config.ts   Test configuration
```

Each folder in `src/` exposes its content through an `index.ts`, keeps its types in a `*.type.ts` file and its tests next to the code in `*.test.ts`. Internal imports use the `#/` alias, which points to `src/`.

## Prerequisites

- [Node.js](https://nodejs.org/) 14 or later (`engines` field)
- [pnpm](https://pnpm.io/) 6 or later

## Installation

To use the package in a project:

```bash
npm install zod-fetcher zod
```

To work on the repository:

```bash
git clone git@github.com:maxencebonamy/Zod-Fetcher.git
cd Zod-Fetcher
pnpm install
```

## Usage

Create a client once, in the main file of your project:

```typescript
import { createZodFetcher } from "zod-fetcher"

createZodFetcher({
	key: "example",
	baseUrl: "https://jsonplaceholder.typicode.com"
})
```

Define services from that client and your Zod schemas:

```typescript
import { ZodFetcher } from "zod-fetcher"
import { postSchema } from "./schemas"

// The return type is inferred from responseSchema
const getAllPosts = ZodFetcher.use("example").get({
	endpoint: "/posts",
	responseSchema: postSchema.array()
})

// A function lets the service take arguments
const getPostById = ZodFetcher.use("example").get((id: number) => ({
	endpoint: `/posts/${id}`,
	responseSchema: postSchema
}))
```

Call the services:

```typescript
const posts = await getAllPosts()
const post = await getPostById(1)
```

A request body is validated before it is sent:

```typescript
const createPost = ZodFetcher.use("example").post({
	endpoint: "/posts",
	body: { title: "foo", body: "bar", userId: 1 },
	bodySchema: postSchema,
	responseSchema: postSchema
})
```

A global request handler can modify every request of a client, for example to add a header:

```typescript
createZodFetcher({
	key: "secured",
	baseUrl: "https://api.example.com",
	globalRequestHandler: req => ({
		...req,
		headers: { ...req.headers, Authorization: `Bearer ${token}` }
	})
})
```

## Running locally

The library has no server. Build it with:

```bash
pnpm run build
```

The output is written to `dist/` (`index.js`, `index.cjs` and type declarations).

## Useful scripts

| Command | Effect |
| --- | --- |
| `pnpm run build` | Build the package with tsup |
| `pnpm run build:prod` | Lint, test, then build |
| `pnpm run lint` | Lint the repository |
| `pnpm run lint:fix` | Lint the repository with auto-fix |
| `pnpm run test` | Run the tests once |
| `pnpm run test:watch` | Run the tests in watch mode |
| `pnpm run test:coverage` | Run the tests with coverage |

## API

| Export | Description |
| --- | --- |
| `createZodFetcher(props)` | Create and register a client. `props`: `key`, `baseUrl`, optional `globalRequestHandler` |
| `ZodFetcher.use(key)` | Return the client registered under `key`. Throws if it does not exist |
| `client.get(props)` | Create a GET service. `props`: `endpoint`, `params`, `headers`, `responseSchema`, `responseHandler` |
| `client.post(props)`, `client.put(props)`, `client.patch(props)` | Create a POST, PUT or PATCH service. Same props as `get`, plus `body` and `bodySchema`. The response schema is optional |
| `client.delete(props)` | Create a DELETE service. The response schema is optional |
| `GetProps`, `CreateOrEditProps`, `DeleteProps` | Exported types for the props of each method |

`createZodFetcher` throws if a client with the same key already exists.

## Tests and quality

```bash
pnpm run test
pnpm run lint
```

Tests use Vitest and live next to the source files in `src/`.

## License

This project is licensed under the [MIT License](LICENSE).
