export type UrlParams = Record<string, string>

export type BuildUrlProps = {
	base: string
	route: string
	params?: UrlParams
}

export type BuildUrlFunction = (props: BuildUrlProps) => string
