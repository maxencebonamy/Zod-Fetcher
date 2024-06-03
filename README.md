# Zod REST Fetch

This little tool is a simple REST client that can be used to fetch data from REST APIs, and allows you to validate both the request and the response, in a transparent way.

## Installation

```bash
npm install zod-rest-fetch
```

## Usage

```typescript
import { ZodRestFetch } from "zod-rest-fetch";

const client = new ZodRestFetch("example").baseUrl("https://jsonplaceholder.typicode.com");

const response = await client.get({
	endpoint: "/posts",
	
});
}

```