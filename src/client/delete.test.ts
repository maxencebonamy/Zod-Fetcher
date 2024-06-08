import { expect, test, vi } from "vitest"
import { ZodFetcher, createZodFetcher } from "#/client/index.js"
import { z } from "zod"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error"
import { fakeResponse } from "#/utils/utils.test.js"


global.fetch = vi.fn()


test("delete request", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_delete1",
		baseUrl: "https://example.com/api"
	})
	const deleteUser = ZodFetcher.use("example_delete1").delete({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	const result = await deleteUser()
	expect(result).toEqual({ id: 1 })
})

test("delete request with validation error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: "1" }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_delete2",
		baseUrl: "https://example.com/api"
	})
	const deleteUser = ZodFetcher.use("example_delete2").delete({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(deleteUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected number, received string")
	)
})

test("delete request with fetch error", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_delete3",
		baseUrl: "https://example.com/api"
	})
	const deleteUser = ZodFetcher.use("example_delete3").delete({ endpoint: "/users", responseSchema: z.object({ id: z.number() }) })
	await expect(deleteUser()).rejects.toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.FETCH, "500 Internal Server Error")
	)
})

test("delete request with custom response handler", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ text: JSON.stringify({ id: 1 }) })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	createZodFetcher({
		key: "example_delete4",
		baseUrl: "https://example.com/api"
	})
	const deleteUser = ZodFetcher.use("example_delete4").delete({
		endpoint: "/users",
		responseSchema: z.object({ id: z.number() }),
		responseHandler: data => ({ ...data, id: data.id + 1 })
	})
	const result = await deleteUser()
	expect(result).toEqual({ id: 2 })
})
