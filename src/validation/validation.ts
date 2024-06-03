import type { ValidateFunctionProps } from "#/validation/validation.type.js"


export const validate = <T>({ schema, value }: ValidateFunctionProps<T>): T => {
	// Try to parse the value as JSON
	if (typeof value === "string") {
		try {
			const jsonValue = JSON.parse(value) as unknown
			value = jsonValue
		} catch (error) { /* Do nothing */ }
	}

	// Validate the value
	const result = schema.safeParse(value)
	if (result.success) {
		return result.data
	}

	// If the validation fails, throw an error with all the error messages
	const messages = result.error.errors.map(error => error.message)
	throw new Error(`Validation error: ${messages.join("\n")}`)
}
