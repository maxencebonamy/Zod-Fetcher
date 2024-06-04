import type { ZodType } from "zod"


export type ValidateFunctionProps<T> = {
	schema: ZodType<T>
	value: unknown
}

export type ValidateFunction = <T>(props: ValidateFunctionProps<T>) => T
