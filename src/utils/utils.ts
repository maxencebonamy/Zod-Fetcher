import { ZodFetcherError, ZodFetcherErrorType as ErrorType } from "#/error/index.js"


export const fetchWithError = async (url: string, options: RequestInit): Promise<string> => {
	const result = await fetch(url, options)
		.then(res => {
			if (!res.ok) {
				throw new ZodFetcherError(ErrorType.FETCH, `${res.status} ${res.statusText}`)
			}
			return res
		})
		.catch(error => {
			throw new ZodFetcherError(ErrorType.FETCH, (error as Error).message)
		})
	return await result.text()
}
