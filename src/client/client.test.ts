import { expect, test } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"


test("new client variable", () => {
	const client = createZodFetcher({
		key: "example1",
		baseUrl: "https://example.com/api"
	})
	expect(client).toBeDefined()
	expect(client).toBeInstanceOf(ZodFetcher)
	expect(client).toHaveProperty("baseUrl", "https://example.com/api")
})

test("new client registered", () => {
	createZodFetcher({
		key: "example2",
		baseUrl: "https://example.com/api"
	})

	const client = ZodFetcher.use("example2")
	expect(client).toBeDefined()
	expect(client).toBeInstanceOf(ZodFetcher)
	expect(client).toHaveProperty("baseUrl", "https://example.com/api")
})

test("new client already registered", () => {
	createZodFetcher({
		key: "example3",
		baseUrl: "https://example.com/api"
	})

	expect(() => {
		createZodFetcher({
			key: "example3",
			baseUrl: "https://example.com/api"
		})
	}).toThrowError("Client with key example3 already exists")
})
