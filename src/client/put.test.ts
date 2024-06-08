import { expect, test, vi } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"
import { z } from "zod"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error"
import { fakeResponse } from "#/utils/utils.test.js"


global.fetch = vi.fn()


test("put request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_put1",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_put1").put({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	const result = await updateUser()
	expect(result).toEqual({ id: 1 })
})

test("put request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_put2",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_put2").put({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(updateUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected number, received string")
	)
})

test("put request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_put3",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_put3").put({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(updateUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.FETCH, "500 Internal Server Error")
	)
})

test("put request with response handler", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_put4",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_put4").put({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() }),
		responseHandler: data => ({ ...data, id: data.id + 1 })
	})
	const result = await updateUser()
	expect(result).toEqual({ id: 2 })
})
