import type { ZodType } from "zod"


export type ValidateFunction = <T>(schema: ZodType<T>, value: unknown) => T
