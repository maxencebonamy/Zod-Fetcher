import { expect, test, vi } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"
import { z } from "zod"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error"
import { fakeResponse } from "#/utils/utils.test.js"


global.fetch = vi.fn()


test("get request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_get1",
		baseUrl: "https://example.com/api"
	})
	const getUser = ZodFetcher.use("example_get1").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	const result = await getUser()
	expect(result).toEqual({ id: 1 })
})

test("get request with params", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_get2",
		baseUrl: "https://example.com/api"
	})
	const getUser = ZodFetcher.use("example_get2").get({ endpoint: "/users", params: { id: 1 }, responseSchema: z.object({ id: z.number() }) })
	const result = await getUser()
	expect(result).toEqual({ id: 1 })
})

test("get request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_get3",
		baseUrl: "https://example.com/api"
	})
	const getUser = ZodFetcher.use("example_get3").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(getUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected number, received string")
	)
})

test("get request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_get4",
		baseUrl: "https://example.com/api"
	})
	const getUser = ZodFetcher.use("example_get4").get({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(getUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.FETCH, "500 Internal Server Error")
	)
})

test("get request with response handler", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_get5",
		baseUrl: "https://example.com/api"
	})
	const getUser = ZodFetcher.use("example_get5").get({
		endpoint: "/users",
		responseSchema: z.object({ id: z.number() }),
		responseHandler: data => ({ ...data, id: data.id + 1 })
	})
	const result = await getUser()
	expect(result).toEqual({ id: 2 })
})
