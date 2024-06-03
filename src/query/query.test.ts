import { expect, test } from "vitest"
import { Query } from "#/query/index.js"


test("query with promise", async () => {
	const query = new Query(() => Promise.resolve("hello"))
	expect(query).toBeDefined()
	expect(query).toBeInstanceOf(Query)
	expect(query).toHaveProperty("fetch")

	const result = await query.fetch()
	expect(result).toBe("hello")
})
