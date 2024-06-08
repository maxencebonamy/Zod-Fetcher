import { expect, test } from "vitest"
import { z } from "zod"
import { validate } from "#/validation/index.js"
import { ZodFetcherErrorType, ZodFetcherError } from "#/error/index.js"


test("validate a valid value", () => {
	const schema = z.string()
	const value = "hello"
	const result = validate({ schema, value })
	expect(result).toBe(value)
})

test("validate an invalid value", () => {
	const schema = z.string()
	const value = 123
	expect(() => validate({ schema, value })).toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected string, received number")
	)
})

test("validate a valid value with a custom error message", () => {
	const schema = z.string().refine(value => value.length > 5, {
		message: "value must be longer than 5 characters"
	})
	const value = "hello world"
	const result = validate({ schema, value })
	expect(result).toBe(value)
})

test("validate an invalid value with a custom error message", () => {
	const schema = z.string().refine(value => value.length > 5, {
		message: "value must be longer than 5 characters"
	})
	const value = "hello"
	expect(() => validate({ schema, value })).toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "value must be longer than 5 characters")
	)
})

test("validate a valid value with a custom error message and path", () => {
	const schema = z.object({
		name: z.string().refine(value => value.length > 5, {
			message: "name must be longer than 5 characters"
		})
	})
	const value = { name: "hello world" }
	const result = validate({ schema, value })
	expect(result).toStrictEqual(value)
})

test("validate an invalid value with a custom error message and path", () => {
	const schema = z.object({
		name: z.string().refine(value => value.length > 5, {
			message: "name must be longer than 5 characters"
		})
	})
	const value = { name: "hello" }
	expect(() => validate({ schema, value })).toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "name must be longer than 5 characters")
	)
})

test("validate a valid value as an object string", () => {
	const schema = z.object({ name: z.string() })
	const value = JSON.stringify({ name: "hello" })
	const result = validate({ schema, value })
	expect(result).toStrictEqual({ name: "hello" })
})

test("validate an invalid value as an object string", () => {
	const schema = z.object({ name: z.string() })
	const value = JSON.stringify({ name: 123 })
	expect(() => validate({ schema, value })).toThrowError(
		new ZodFetcherError(ZodFetcherErrorType.VALIDATION, "Expected string, received number")
	)
})
