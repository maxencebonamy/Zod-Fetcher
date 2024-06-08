import { createFetchError } from "#/error/index.js"


export const fetchWithError = async (url: string, options: RequestInit): Promise<string> => {
	const result = await fetch(url, options)
		.then(res => {
			if (!res.ok) {
				throw createFetchError(`${res.status} ${res.statusText}`)
			}
			return res
		})
		.catch(error => {
			throw createFetchError((error as Error).message)
		})
	return await result.text()
}
