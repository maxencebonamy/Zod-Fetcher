export class Query<R> {

	private _fetch: () => Promise<R>


	constructor(fetch: () => Promise<R>) {
		this._fetch = fetch
	}

	public async fetch(): Promise<R> {
		return this._fetch()
	}

}
