import type { ZodFetchErrorType } from "#/error/error.type"

export class ZodFetchError extends Error {

	public type: ZodFetchErrorType

	constructor(type: ZodFetchErrorType, message: string) {
		super(message)
		this.name = this.constructor.name
		this.type = type
	}

}
