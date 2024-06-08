import { ZodFetcherErrorType } from "#/error/error.type"

export class ZodFetcherError extends Error {

	public type: ZodFetcherErrorType

	constructor(type: ZodFetcherErrorType, message: string) {
		super(message)
		this.name = this.constructor.name
		this.type = type
	}

}

export const createFetchError = (message: string): ZodFetcherError => new ZodFetcherError(ZodFetcherErrorType.FETCH, message)

export const createValidationError = (message: string): ZodFetcherError => new ZodFetcherError(ZodFetcherErrorType.VALIDATION, message)
