export type UrlParams = Record<string, string | { toString: () => string }>

export type BuildUrlProps = {
	base: string
	endpoint: string
	params?: UrlParams
}

export type BuildUrlFunction = (props: BuildUrlProps) => string
