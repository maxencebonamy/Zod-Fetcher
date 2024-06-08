export type UrlParams = Record<string, string | { toString: () => string }>

export type BuildUrlFunction = (base: string, endpoint: string, params?: UrlParams) => string
