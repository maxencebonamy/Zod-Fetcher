# Zod Fetcher

*A simple utility to automatically wrap fetches with Zod schemas, for both request and response.*

Thanks to Zod Fetcher, you can define services by passing the endpoint and the response schema, and it will take care of the rest, **avoiding boilerplate code**.
Of course, you can also define params, request schemas, response handlers, and global request handlers, to **customize the behavior** of your services.
All of this is done with TypeScript, so **all the types are inferred by the Zod schemas** you provide.


## Setup

1. Install the package
```bash
npm install zod-fetcher
```

2. Create a client in the main file of your project, and set the base URL of the API you want to consume.
```typescript
// Import the createZodFetcher function
import { createZodFetcher } from "zod-fetcher"

// Create a new client
createZodFetcher({
	key: "example",
	baseUrl: "https://jsonplaceholder.typicode.com"
})
```

## Usage

1. Create a service using the client you created, and your Zod schemas.

```typescript
// Import the ZodFetcher client
import { ZodFetcher } from "zod-fetcher"
// Import your Zod schemas
import { postSchema } from "./schemas"

// The return type of this function will be inferred by the responseSchema
const getAllPosts = ZodFetcher.use("example").get({
	endpoint: "/posts",
	responseSchema: postSchema.array()
})

// You can also use a function to pass parameters to the request
const getPostById = ZodFetcher.use("example").get((id: number) => ({
	endpoint: "/posts",
	responseSchema: postSchema.array()
}))
```

2. Import the service and call it to make the request.

```typescript
// Import the services
import { getAllPosts } from "./services"

// Call the service
const posts = await getAllPosts()

// Or pass parameters to the service if needed
const post = await getPostById(1)
```


## API

### `createZodFetcher`

Creates a new ZodFetcher client.

```typescript
createZodFetcher({
	// A unique key to identify the client
	key: "example",
	// The base URL of the API
	baseUrl: "https://jsonplaceholder.typicode.com",
	// A global request handler that will be called before every request
	globalRequestHandler: req => {
		// Add the Authorization header to every request except the login endpoint
		if (req.endpoint !== "/login") {
			req.headers = {
				...req.headers,
				Authorization: `Bearer ${localStorage.getItem("token")}`
			}
		}
		// Return the modified request
		return req
	}
})
```

### `ZodFetcher.use`

Returns a ZodFetcher client.

```typescript
const client = ZodFetcher.use("example")
```

### `ZodFetcher.get`

Creates a new GET request.

```typescript
const getAllPosts = ZodFetcher.use("example").get({
	// The endpoint of the request
	endpoint: "/posts",
	// The parameters of the request
	params: {
		page: 1,
	}
	// The Zod schema for the response
	responseSchema: postSchema.array(),
	// A response handler that will be called after the request
	responseHandler: res => {
		// Log the response
		console.log(res)
		// Return the response
		return res
	}
})
```

### `ZodFetcher.post`, `ZodFetcher.put`, `ZodFetcher.patch`

Creates a new POST, PUT or PATCH request.

```typescript
const createPost = ZodFetcher.use("example").post({
	// The endpoint of the request
	endpoint: "/posts",
	// The body of the request
	body: {
		title: "foo",
		body: "bar",
		userId: 1
	},
	// The Zod schema for the request body
	bodySchema: postSchema,
	// The Zod schema for the response
	responseSchema: postSchema
})
```

### `ZodFetcher.delete`

Creates a new DELETE request.

```typescript
const deletePostById = ZodFetcher.use("example").delete((id: number) => ({
	// The endpoint of the request
	endpoint: `/posts/${id}`
}))
```
