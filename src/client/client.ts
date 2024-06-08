import type { GetProps, CreateOrEditProps, DeleteProps, RequestHandler, Query, ZodFetcherProps } from "#/client/client.type.js"
import { ZodFetcherError, ZodFetcherErrorType } from "#/error"
import { buildUrl } from "#/url/index.js"
import { fetchWithError, type MaybeFunction } from "#/utils/index.js"
import { validate } from "#/validation/index.js"


export class ZodFetcher {

	private static _clients: Record<string, ZodFetcher> = {}

	public static use(key: string): ZodFetcher {
		const client = ZodFetcher._clients[key]
		if (!client) {
			throw Error(`Client with key ${key} does not exist`)
		}
		return client
	}


	private baseUrl: string

	private globalRequestHandler?: RequestHandler


	constructor({ key, baseUrl, globalRequestHandler }: ZodFetcherProps) {
		if (ZodFetcher._clients[key]) {
			throw Error(`Client with key ${key} already exists`)
		}

		this.baseUrl = baseUrl
		this.globalRequestHandler = globalRequestHandler
		ZodFetcher._clients[key] = this
	}


	public get<A extends unknown[], R>(props: MaybeFunction<A, GetProps<R>>): Query<A, R> {
		this.checkBaseUrl()
		return async (...args: A) => {
			if (typeof props === "function") props = props(...args)
			if (this.globalRequestHandler) props = { ...props, ...this.globalRequestHandler?.(props) }

			const { endpoint, responseSchema, headers, params, responseHandler } = props
			const url = buildUrl(this.baseUrl, endpoint, params)
			const data = await fetchWithError(url, { method: "GET", headers: headers || {} })

			let validatedData = validate(responseSchema, data)
			if (responseHandler) validatedData = responseHandler(validatedData)
			return validatedData
		}
	}

	public post<A extends unknown[], T, R = void>(props: MaybeFunction<A, CreateOrEditProps<T, R>>): Query<A, R> {
		return this.createOrEdit<A, T, R>("POST", props)
	}

	public put<A extends unknown[], T, R = void>(props: MaybeFunction<A, CreateOrEditProps<T, R>>): Query<A, R> {
		return this.createOrEdit<A, T, R>("PUT", props)
	}

	public patch<A extends unknown[], T, R = void>(props: MaybeFunction<A, CreateOrEditProps<T, R>>): Query<A, R> {
		return this.createOrEdit<A, T, R>("PATCH", props)
	}

	public delete<A extends unknown[], R>(props: MaybeFunction<A, DeleteProps<R>>): Query<A, R> {
		this.checkBaseUrl()
		return async (...args: A) => {
			if (typeof props === "function") props = props(...args)
			if (this.globalRequestHandler) props = { ...props, ...this.globalRequestHandler?.(props) }

			const { endpoint, responseSchema, headers, params, responseHandler } = props
			const url = buildUrl(this.baseUrl, endpoint, params)
			const data = await fetchWithError(url, { method: "DELETE", headers: headers || {} })

			if (responseSchema) {
				let validatedData = validate(responseSchema, data)
				if (responseHandler) validatedData = responseHandler(validatedData)
				return validatedData
			}

			return undefined as R
		}
	}


	private createOrEdit<A extends unknown[], T, R = void>(
		method: "POST" | "PUT" | "PATCH",
		props: MaybeFunction<A, CreateOrEditProps<T, R>>
	): Query<A, R> {
		this.checkBaseUrl()
		return async (...args: A) => {
			if (typeof props === "function") props = props(...args)
			if (this.globalRequestHandler) props = { ...props, ...this.globalRequestHandler?.(props) }

			const { endpoint, headers, params, responseSchema, responseHandler } = props
			const url = buildUrl(this.baseUrl, endpoint, params)

			let body: string | undefined
			if (props.bodySchema) {
				const validatedBody = validate(props.bodySchema, props.body)
				body = JSON.stringify(validatedBody)
			}

			const data = await fetchWithError(url, { method, headers: headers || {}, body })

			if (responseSchema) {
				let validatedData = validate(responseSchema, data)
				if (responseHandler) validatedData = responseHandler(validatedData)
				return validatedData
			}

			return undefined as R
		}
	}


	private checkBaseUrl(): void {
		if (this.baseUrl === undefined) {
			throw new ZodFetcherError(ZodFetcherErrorType.BASE_URL, "The base url is undefined")
		}
	}

}

export const createZodFetcher = (props: ZodFetcherProps): ZodFetcher => new ZodFetcher(props)
