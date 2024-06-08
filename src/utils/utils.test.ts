import { expect, test, vi } from "vitest"
import { fetchWithError } from "#/utils/utils.js"
import { ZodFetcherError, ZodFetcherErrorType } from "#/error/index.js"

type FakeResponseRequest = {
	ok?: boolean
	text?: string
	status?: number
	statusText?: string
}

export const fakeResponse = ({ ok = true, text = "", status = 200, statusText = "" }: FakeResponseRequest): Response => {
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


test("fetchWithError ok", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: true, text: "ok" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	const result = await fetchWithError("https://example.com/api", {})
	expect(result).toBe("ok")
})

test("fetchWithError not ok", async () => {
	vi.resetAllMocks()
	const mockResponse = fakeResponse({ ok: false, status: 400, statusText: "Bad Request" })
	vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

	try {
		await fetchWithError("https://example.com/api", {})
	} catch (error) {
		expect(error).toBeInstanceOf(ZodFetcherError)
		expect((error as ZodFetcherError).message).toBe("400 Bad Request")
		expect((error as ZodFetcherError).type).toBe(ZodFetcherErrorType.FETCH)
	}
})

test("fetchWithError error", async () => {
	vi.resetAllMocks()
	vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"))

	try {
		await fetchWithError("https://example.com/api", {})
	} catch (error) {
		expect(error).toBeInstanceOf(ZodFetcherError)
		expect((error as ZodFetcherError).message).toBe("Network Error")
		expect((error as ZodFetcherError).type).toBe(ZodFetcherErrorType.FETCH)
	}
})
