import type { PostPutPatchProps } from "#/client/client.type.js"
import type { GetProps } from "#/client/index.js"
import { Query } from "#/query/index.js"
import { buildUrl } from "#/url/index.js"
import { validate } from "#/validation/index.js"


export class ZodFetchClient {

	private static _register: Record<string, ZodFetchClient> = {}

	public static use(key: string): ZodFetchClient {
		const client = ZodFetchClient._register[key]
		if (!client) {
			throw Error(`Client with key ${key} does not exist`)
		}
		return client
	}


	private _key: string

	private _baseUrl?: string


	constructor(_key: string) {
		if (ZodFetchClient._register[_key]) {
			throw Error(`Client with key ${_key} already exists`)
		}

		this._key = _key
		ZodFetchClient._register[_key] = this
	}

	baseUrl(baseUrl: string): ZodFetchClient {
		this._baseUrl = baseUrl
		return this
	}

	private _checkBaseUrlNotDefined(): string {
		if (!this._baseUrl) {
			throw Error(`Base URL is not defined for ${this._key} client`)
		}
		return this._baseUrl
	}


	public get<R>({ endpoint, params, headers, responseSchema }: GetProps<R>): Query<R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<R>(async () => {
			const url = buildUrl({ base: baseUrl, endpoint, params })

			const res = await this.fetchWithError(url, { method: "GET", headers: headers || {} })

			const data = await res.text()
			return validate({ schema: responseSchema, value: data })
		})
	}

	public post<T, R = void>(props: PostPutPatchProps<T, R>): Query<R> {
		return this.mutateWithValidation<T, R>("POST", props)
	}

	public put<T, R = void>(props: PostPutPatchProps<T, R>): Query<R> {
		return this.mutateWithValidation<T, R>("PUT", props)
	}

	public patch<T, R = void>(props: PostPutPatchProps<T, R>): Query<R> {
		return this.mutateWithValidation<T, R>("PATCH", props)
	}

	public delete<R>({ endpoint, params, headers, responseSchema }: GetProps<R>): Query<R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<R>(async () => {
			const url = buildUrl({ base: baseUrl, endpoint, params })

			const res = await this.fetchWithError(url, { method: "DELETE", headers: headers || {} })

			if (responseSchema) {
				const data = await res.text()
				return validate({ schema: responseSchema, value: data })
			}

			return undefined as R
		})
	}


	private fetchWithError(url: string, options: RequestInit): Promise<Response> {
		return fetch(url, options)
			.then(res => {
				if (!res.ok) {
					throw Error(`Fetch error: ${res.statusText}`)
				}
				return res
			})
			.catch(error => {
				throw Error(`Fetch error: ${(error as Error).message}`)
			})
	}

	private mutateWithValidation<T, R = void>(
		method: "POST" | "PUT" | "PATCH", { endpoint, params, headers, ...props }: PostPutPatchProps<T, R>
	): Query<R> {
		const baseUrl = this._checkBaseUrlNotDefined()

		return new Query<R>(async () => {
			const url = buildUrl({ base: baseUrl, endpoint, params })

			let body: string | undefined
			if (props.bodySchema) {
				const validatedBody = validate({ schema: props.bodySchema, value: props.body })
				body = JSON.stringify(validatedBody)
			}

			const res = await this.fetchWithError(url, { method, headers: headers || {}, body })

			if (props.responseSchema) {
				const data = await res.text()
				return validate({ schema: props.responseSchema, value: data })
			}

			return undefined as R
		})
	}

}
