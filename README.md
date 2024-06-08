# Zod REST Fetch

This little tool is a simple REST client that can be used to fetch data from REST APIs, and allows you to validate both the request and the response, in a transparent way.

## Installation

```bash
npm install zod-rest-fetch
```

## Usage

1. Create a client in the main file of your project, and set the base URL of the API you want to consume.

```typescript
import { createZodFetchClient } from "zod-rest-fetch"

createZodFetchClient("example").baseUrl("https://jsonplaceholder.typicode.com")
```

2. Make requests using the client you created, and your Zod schemas.

```typescript
import { ZodFetchClient } from "zod-rest-fetch"
import { z } from "zod"

const postSchema = z.object({
	userId: z.number(),
	id: z.number(),
	title: z.string(),
	body: z.string()
})

const getAllPosts = ZodFetchClient.use("example").get({
	endpoint: "/posts",
	responseSchema: postSchema.array()
})

const getPostById = ZodFetchClient.use("example").get((id: number) => ({
	endpoint: `/posts/${id}`,
	responseSchema: postSchema
}))
```

3. Use the request functions to make the requests.

```typescript
const posts = await getAllPosts.fetch()
const post = await getPostById.fetch(1)
```