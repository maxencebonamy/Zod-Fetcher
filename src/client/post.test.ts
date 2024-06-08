import { expect, test, vi } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"
import { z } from "zod"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error"
import { fakeResponse } from "#/utils/utils.test.js"


global.fetch = vi.fn()


test("post request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_post1",
		baseUrl: "https://example.com/api"
	})
	const createUser = ZodFetcher.use("example_post1").post({ endpoint: "/users", body: { id: 1 }, responseSchema: z.object({ id: z.number() }) })
	const result = await createUser()
	expect(result).toEqual({ id: 1 })
})

test("post request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_post2",
		baseUrl: "https://example.com/api"
	})
	const createUser = ZodFetcher.use("example_post2").post({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(createUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected number, received string")
	)
})

test("post request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_post3",
		baseUrl: "https://example.com/api"
	})
	const createUser = ZodFetcher.use("example_post3").post({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(createUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.FETCH, "500 Internal Server Error")
	)
})

test("post request with response handler", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_post5",
		baseUrl: "https://example.com/api"
	})
	const createUser = ZodFetcher.use("example_post5").post({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() }),
		responseHandler: res => ({ ...res, id: res.id + 1 })
	})
	const result = await createUser()
	expect(result).toEqual({ id: 2 })
})

test("post request without response schema", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_post6",
		baseUrl: "https://example.com/api"
	})
	const createUser = ZodFetcher.use("example_post6").post({
		endpoint: "/users",
		body: { id: 1 },
		bodySchema: z.object({ id: z.number() })
	})
	const result = await createUser()
	expect(result).toBeUndefined()
})
