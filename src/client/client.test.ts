import { expect, test, vi } from "vitest"
import { ZodFetchClient } from "#/client/index.js"
import { z } from "zod"

type FakeResponseRequest = {
	ok?: boolean
	text?: string
	status?: number
	statusText?: string
}

const fakeResponse = ({ ok = true, text = "", status = 200, statusText = "" }: FakeResponseRequest): Response => {
	return {
		text: () => Promise.resolve(text),
		ok,
		status,
		statusText,
		headers: new Headers(),
		redirected: false,
		type: "basic",
		url: "",
		body: null,
		bodyUsed: false,
		clone: () => new Response(),
		arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
		blob: () => Promise.resolve(new Blob([])),
		formData: () => Promise.resolve(new FormData()),
		json: () => Promise.resolve(null)
	}
}

global.fetch = vi.fn()


test("new client variable", () => {
	const client = new ZodFetchClient("example")
		.baseUrl("https://example.com/api")
	expect(client).toBeDefined()
	expect(client).toBeInstanceOf(ZodFetchClient)
	expect(client).toHaveProperty("_baseUrl", "https://example.com/api")
})

test("new client registered", () => {
	new ZodFetchClient("example2")
		.baseUrl("https://example.com/api")

	const client = ZodFetchClient.use("example2")
	expect(client).toBeDefined()
	expect(client).toBeInstanceOf(ZodFetchClient)
	expect(client).toHaveProperty("_baseUrl", "https://example.com/api")
})

test("new client already registered", () => {
	new ZodFetchClient("example3")
		.baseUrl("https://example.com/api")

	expect(() => {
		new ZodFetchClient("example3")
			.baseUrl("https://example.com/api")
	}).toThrowError("Client with key example3 already exists")
})


test("get request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_get1")
		.baseUrl("https://example.com/api")
	const getUser = ZodFetchClient.use("example_get1").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	const result = await getUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("get request with params", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_get2")
		.baseUrl("https://example.com/api")
	const getUser = ZodFetchClient.use("example_get2").get({ endpoint: "/users", params: { id: 1 }, responseSchema: z.object({ id: z.number() }) })
	const result = await getUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("get request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_get3")
		.baseUrl("https://example.com/api")
	const getUser = ZodFetchClient.use("example_get3").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(getUser.fetch()).rejects.toThrowError("Validation error: Expected number, received string")
})

test("get request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_get4")
		.baseUrl("https://example.com/api")
	const getUser = ZodFetchClient.use("example_get4").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(getUser.fetch()).rejects.toThrowError("Fetch error: Internal Server Error")
})


test("post request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_post1")
		.baseUrl("https://example.com/api")
	const createUser = ZodFetchClient.use("example_post1").post({
		endpoint: "/users",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	const result = await createUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("post request without body", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_post2")
		.baseUrl("https://example.com/api")
	const createUser = ZodFetchClient.use("example_post2").post({
		endpoint: "/users",
		responseSchema: z.object({ id: z.number() })
	})
	const result = await createUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("post request with body validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_post3")
		.baseUrl("https://example.com/api")
	const createUser = ZodFetchClient.use("example_post3").post({
		endpoint: "/users",
		// @ts-expect-error Testing invalid body
		body: { name: 1 },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(createUser.fetch()).rejects.toThrowError("Validation error: Expected string, received number")
})

test("post request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_post4")
		.baseUrl("https://example.com/api")
	const createUser = ZodFetchClient.use("example_post4").post({
		endpoint: "/users",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(createUser.fetch()).rejects.toThrowError("Fetch error: Internal Server Error")
})

test("post request without response schema", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_post5")
		.baseUrl("https://example.com/api")
	const createUser = ZodFetchClient.use("example_post5").post({
		endpoint: "/users",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() })
	})
	const result = await createUser.fetch()
	expect(result).toBeUndefined()
})
