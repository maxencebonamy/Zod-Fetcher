import type { BuildUrlFunction } from "#/url/index.js"


export const buildUrl: BuildUrlFunction = ({ base, route, params }) => {
	// add the base URL to the URL string
	let url = base

	// if the base URL ends with a slash, remove it
	if (url.endsWith("/")) {
		url = url.slice(0, -1)
	}

	// if the route does not start with a slash, add it
	if (route !== "" && !route.startsWith("/")) {
		url += "/"
	}

	// add the route to the URL string
	url += route

	// if there are any params, add them to the URL string
	if (params && Object.keys(params).length > 0) {
		url += "?"
		url += Object.entries(params)
			.map(([ key, value ]) => `${key}=${value}`)
			.join("&")
	}

	// return the URL string
	return url
}
