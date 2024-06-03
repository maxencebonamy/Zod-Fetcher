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


test("put request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_put1")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_put1").put({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	const result = await updateUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("put request without body", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_put2")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_put2").put({
		endpoint: "/users/1",
		responseSchema: z.object({ id: z.number() })
	})
	const result = await updateUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("put request with body validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_put3")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_put3").put({
		endpoint: "/users/1",
		// @ts-expect-error Testing invalid body
		body: { name: 1 },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(updateUser.fetch()).rejects.toThrowError("Validation error: Expected string, received number")
})

test("put request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_put4")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_put4").put({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(updateUser.fetch()).rejects.toThrowError("Fetch error: Internal Server Error")
})

test("put request without response schema", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_put5")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_put5").put({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() })
	})
	const result = await updateUser.fetch()
	expect(result).toBeUndefined()
})


test("patch request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_patch1")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_patch1").patch({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	const result = await updateUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("patch request without body", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_patch2")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_patch2").patch({
		endpoint: "/users/1",
		responseSchema: z.object({ id: z.number() })
	})
	const result = await updateUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("patch request with body validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_patch3")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_patch3").patch({
		endpoint: "/users/1",
		// @ts-expect-error Testing invalid body
		body: { name: 1 },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(updateUser.fetch()).rejects.toThrowError("Validation error: Expected string, received number")
})

test("patch request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_patch4")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_patch4").patch({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() }),
		responseSchema: z.object({ id: z.number() })
	})
	await expect(updateUser.fetch()).rejects.toThrowError("Fetch error: Internal Server Error")
})

test("patch request without response schema", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_patch5")
		.baseUrl("https://example.com/api")
	const updateUser = ZodFetchClient.use("example_patch5").patch({
		endpoint: "/users/1",
		body: { name: "John" },
		bodySchema: z.object({ name: z.string() })
	})
	const result = await updateUser.fetch()
	expect(result).toBeUndefined()
})


test("delete request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_delete1")
		.baseUrl("https://example.com/api")
	const deleteUser = ZodFetchClient.use("example_delete1").delete({ endpoint: "/users/1", responseSchema: z.object({ id: z.number() }) })
	const result = await deleteUser.fetch()
	expect(result).toEqual({ id: 1 })
})

test("delete request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_delete2")
		.baseUrl("https://example.com/api")
	const deleteUser = ZodFetchClient.use("example_delete2").delete({ endpoint: "/users/1", responseSchema: z.object({ id: z.number() }) })
	await expect(deleteUser.fetch()).rejects.toThrowError("Fetch error: Internal Server Error")
})

test("delete request without response schema", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_delete3")
		.baseUrl("https://example.com/api")
	const deleteUser = ZodFetchClient.use("example_delete3").delete({ endpoint: "/users/1" })
	const result = await deleteUser.fetch()
	expect(result).toBeUndefined()
})

test("delete request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	new ZodFetchClient("example_delete4")
		.baseUrl("https://example.com/api")
	const deleteUser = ZodFetchClient.use("example_delete4").delete({ endpoint: "/users/1", responseSchema: z.object({ id: z.number() }) })
	await expect(deleteUser.fetch()).rejects.toThrowError("Validation error: Expected number, received string")
})
