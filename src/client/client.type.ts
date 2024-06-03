import type { UrlParams } from "#/url/url.type.js"
import type { ZodSchema } from "zod"

export type Headers = Record<string, string>


export type BaseQueryProps = {
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
