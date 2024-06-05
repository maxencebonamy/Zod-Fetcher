import type { GetProps, CreateOrEditProps, DeleteProps, RequestHandler } from "#/client/client.type.js"
import { ZodFetchErrorType, ZodFetchError } from "#/error/index.js"
import { Query } from "#/query/index.js"
import { buildUrl } from "#/url/index.js"
import { validate } from "#/validation/index.js"


export class ZodFetchClient {

	private static _clients: Record<string, ZodFetchClient> = {}

	public static use(key: string): ZodFetchClient {
		const client = ZodFetchClient._clients[key]
		if (!client) {
			throw Error(`Client with key ${key} does not exist`)
		}
		return client
	}


	private _key: string

	private _baseUrl?: string

	private _globalPreRequestHandler?: RequestHandler


	constructor(_key: string) {
		if (ZodFetchClient._clients[_key]) {
			throw Error(`Client with key ${_key} already exists`)
		}

		this._key = _key
		ZodFetchClient._clients[_key] = this
	}

	baseUrl(baseUrl: string): ZodFetchClient {
		this._baseUrl = baseUrl
		return this
	}

	preRequestHandler(handler: RequestHandler): ZodFetchClient {
		this._globalPreRequestHandler = handler
		return this
	}

	private _checkBaseUrlNotDefined(): string {
		if (!this._baseUrl) {
			throw Error(`Base URL is not defined for ${this._key} client`)
		}
		return this._baseUrl
	}


	public get<A extends unknown[], R>(props: GetProps<R> | ((...args: A) => GetProps<R>)): Query<A, R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<A, R>(async (...args) => {
			if (typeof props === "function") {
				props = props(...args)
			}

			if (this._globalPreRequestHandler) {
				props = { ...props, ...this._globalPreRequestHandler?.(props) }
			}
			const { endpoint, responseSchema, headers, params } = props

			const url = buildUrl({ base: baseUrl, endpoint, params })

			const res = await this._fetchWithError(url, { method: "GET", headers: headers || {} })

			const data = await res.text()
			return validate({ schema: responseSchema, value: data })
		})
	}

	public post<A extends unknown[], T, R = void>(
		props: CreateOrEditProps<T, R> | ((...args: A) => CreateOrEditProps<T, R>)
	): Query<A, R> {
		return this._mutateWithValidation<A, T, R>("POST", props)
	}

	public put<A extends unknown[], T, R = void>(
		props: CreateOrEditProps<T, R> | ((...args: A) => CreateOrEditProps<T, R>)
	): Query<A, R> {
		return this._mutateWithValidation<A, T, R>("PUT", props)
	}

	public patch<A extends unknown[], T, R = void>(
		props: CreateOrEditProps<T, R> | ((...args: A) => CreateOrEditProps<T, R>)
	): Query<A, R> {
		return this._mutateWithValidation<A, T, R>("PATCH", props)
	}

	public delete<A extends unknown[], R>(
		props: DeleteProps<R> | ((...args: A) => DeleteProps<R>)
	): Query<A, R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<A, R>(async (...args: A) => {
			if (typeof props === "function") {
				props = props(...args)
			}
			if (this._globalPreRequestHandler) {
				props = { ...props, ...this._globalPreRequestHandler?.(props) }
			}
			const { endpoint, responseSchema, headers, params } = props
			const url = buildUrl({ base: baseUrl, endpoint, params })

			const res = await this._fetchWithError(url, { method: "DELETE", headers: headers || {} })

			if (responseSchema) {
				const data = await res.text()
				return validate({ schema: responseSchema, value: data })
			}

			return undefined as R
		})
	}


	private async _fetchWithError(url: string, options: RequestInit): Promise<Response> {
		return fetch(url, options)
			.then(res => {
				if (!res.ok) {
					throw new ZodFetchError(ZodFetchErrorType.FETCH, `${res.status} ${res.statusText}`)
				}
				return res
			})
			.catch(error => {
				throw new ZodFetchError(ZodFetchErrorType.FETCH, (error as Error).message)
			})
	}

	private _mutateWithValidation<A extends unknown[], T, R = void>(
		method: "POST" | "PUT" | "PATCH",
		props: CreateOrEditProps<T, R> | ((...args: A) => CreateOrEditProps<T, R>)
	): Query<A, R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<A, R>(async (...args) => {
			if (typeof props === "function") {
				props = props(...args)
			}

			if (this._globalPreRequestHandler) {
				props = { ...props, ...this._globalPreRequestHandler?.(props) }
			}
			const { endpoint, headers, params } = props
			const url = buildUrl({ base: baseUrl, endpoint, params })

			let body: string | undefined
			if (props.bodySchema) {
				const validatedBody = validate({ schema: props.bodySchema, value: props.body })
				body = JSON.stringify(validatedBody)
			}

			const res = await this._fetchWithError(url, { method, headers: headers || {}, body })

			if (props.responseSchema) {
				const data = await res.text()
				return validate({ schema: props.responseSchema, value: data })
			}

			return undefined as R
		})
	}

}

export const createZodFetchClient = (key: string): ZodFetchClient => new ZodFetchClient(key)
