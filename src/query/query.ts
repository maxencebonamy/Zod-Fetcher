export class Query<A extends unknown[], R> {

	private _fetch: (...args: A) => Promise<R>


	constructor(fetch: (...args: A) => Promise<R>) {
		this._fetch = fetch
	}

	public async fetch(...args: A): Promise<R> {
		return this._fetch(...args)
	}

}
