import type { UrlParams } from "#/url/index.js"
import type { UnaryFunction } from "#/utils/index.js"
import type { ZodType } from "zod"


export type Headers = Record<string, string>

type BaseQueryProps = {
	endpoint: string
	params?: UrlParams
	headers?: Record<string, string>
}

export type RequestHandler = UnaryFunction<BaseQueryProps>

export type GetProps<R> = BaseQueryProps & {
	responseSchema: ZodType<R>
	responseHandler?: UnaryFunction<R>
}

export type CreateOrEditProps<T, R = void> = BaseQueryProps & ({
	responseSchema: ZodType<R>
	responseHandler?: UnaryFunction<R>
} | {
	responseSchema?: undefined
	responseHandler?: undefined
}) & ({
	body: T
	bodySchema: ZodType<T>
} | {
	body?: undefined
	bodySchema?: undefined
})

export type DeleteProps<R> = BaseQueryProps & {
	requestHandler?: RequestHandler
} & ({
	responseSchema: ZodType<R>
	responseHandler?: UnaryFunction<R>
} | {
	responseSchema?: undefined
	responseHandler?: undefined
})

export type Query<A extends unknown[], R> = (...args: A) => Promise<R>

export type ZodFetcherProps = {
	key: string
	baseUrl: string
	globalRequestHandler?: RequestHandler
}
