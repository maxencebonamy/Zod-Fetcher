import { expect, test, vi } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"
import { z } from "zod"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error"
import { fakeResponse } from "#/utils/utils.test.js"


global.fetch = vi.fn()


test("patch request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_patch1",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_patch1").patch({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	const result = await updateUser()
	expect(result).toEqual({ id: 1 })
})

test("patch request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_patch2",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_patch2").patch({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(updateUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected number, received string")
	)
})

test("patch request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_patch3",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_patch3").patch({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	await expect(updateUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.FETCH, "500 Internal Server Error")
	)
})

test("patch request with custom response handler", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_patch4",
		baseUrl: "https://example.com/api"
	})
	const updateUser = ZodFetcher.use("example_patch4").patch({
		endpoint: "/users",
		body: { id: 1 },
		responseSchema: z.object({ id: z.number() }),
		bodySchema: z.object({ id: z.number() })
	})
	const result = await updateUser()
	expect(result).toEqual({ id: 1 })
})
