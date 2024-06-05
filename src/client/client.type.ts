import type { UrlParams } from "#/url/url.type.js"
import type { ZodType } from "zod"

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type Headers = Record<string, string>

type BaseQueryProps = {
	endpoint: string
	params?: UrlParams
	headers?: Headers
}

export type GetProps<R> = BaseQueryProps & {
	responseSchema: ZodType<R>
}

export type CreateOrEditProps<T, R = void> = BaseQueryProps & {
	responseSchema?: ZodType<R>
} & ({
	body: T
	bodySchema: ZodType<T>
} | {
	body?: undefined
	bodySchema?: undefined
})

export type DeleteProps<R> = BaseQueryProps & {
	responseSchema?: ZodType<R>
}

export type RequestHandler = (props: BaseQueryProps) => BaseQueryProps
