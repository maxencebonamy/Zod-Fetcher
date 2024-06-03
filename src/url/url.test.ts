import { expect, test } from "vitest"
import { buildUrl } from "#/url/index.js"


test("url with only base", () => {
	const base = "https://example.com/api"
	const route = ""
	const result = buildUrl({ base, endpoint: route })
	expect(result).toBe("https://example.com/api")
})

test("url with only route", () => {
	const base = ""
	const route = "/users"
	const result = buildUrl({ base, endpoint: route })
	expect(result).toBe("/users")
})

test("url with base and route", () => {
	const base = "https://example.com/api"
	const route = "/users"
	const result = buildUrl({ base, endpoint: route })
	expect(result).toBe("https://example.com/api/users")
})

test("url with base, route, and params", () => {
	const base = "https://example.com/api"
	const route = "/users"
	const params = { page: "1", limit: "10" }
	const result = buildUrl({ base, endpoint: route, params })
	expect(result).toBe("https://example.com/api/users?page=1&limit=10")
})

test("url with base, route, and empty params", () => {
	const base = "https://example.com/api"
	const route = "/users"
	const params = {}
	const result = buildUrl({ base, endpoint: route, params })
	expect(result).toBe("https://example.com/api/users")
})

test("url with base, route, and undefined params", () => {
	const base = "https://example.com/api"
	const route = "/users"
	const params = undefined
	const result = buildUrl({ base, endpoint: route, params })
	expect(result).toBe("https://example.com/api/users")
})
