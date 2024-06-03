import type { ZodSchema } from "zod"


export type ValidateFunctionProps<T> = {
	schema: ZodSchema<T>
	value: unknown
}

export type ValidateFunction = <T>(props: ValidateFunctionProps<T>) => T
