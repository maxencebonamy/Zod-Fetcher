import type { UrlParams } from "#/url/url.type.js"
import type { ZodSchema } from "zod"

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type Headers = Record<string, string>

type BaseQueryProps = {
	endpoint: string
	params?: UrlParams
	headers?: Headers
}

export type GetProps<R> = BaseQueryProps & {
	responseSchema: ZodSchema<R>
}

export type PostProps<T, R = void> = BaseQueryProps & {
	responseSchema?: ZodSchema<R>
} & ({
	body: T
	bodySchema: ZodSchema<T>
} | {
	body?: undefined
	bodySchema?: undefined
})

export type PutProps<T, R = void> = PostProps<T, R>

export type PatchProps<T, R = void> = PostProps<T, R>

export type DeleteProps<R> = BaseQueryProps & {
	responseSchema?: ZodSchema<R>
}

export type MutateWithValidationProps<T, R = void> = {
	method: "POST" | "PUT" | "PATCH"
} & (PostProps<T, R> | PutProps<T, R> | PatchProps<T, R>)
