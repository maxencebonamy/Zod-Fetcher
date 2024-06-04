import type { ErrorType } from "#/error/error.type"

export class ZodFetchError extends Error {

	public type: ErrorType

	constructor(type: ErrorType, message: string) {
		super(message)
		this.name = this.constructor.name
		this.type = type
	}

}
