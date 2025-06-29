export class Route {
  readonly segments: string[]
  readonly query: string

  /**
   * Create a Route.  
   * @param routeOrSegments Either:
   *  - a full path and query string, e.g. "/a/b?x=1"
   *  - an array of segments, e.g. ["a","b"]
   * @param query Raw query string (e.g. "x=1&y=2"). If provided, it overrides
   *              any ?query part embedded in the first argument.
   */
  constructor(routeOrSegments: string | string[], query = "") {
    if (Array.isArray(routeOrSegments)) {      
      this.segments = routeOrSegments.filter(Boolean)
      this.query = query
      return
    }

    const [rawPath, rawQuery] = routeOrSegments.split("?")
    const clean = rawPath.replace(/^\/+/g, "").replace(/\/+$/g, "")
    this.segments = clean ? clean.split("/") : []
    this.query = query || rawQuery || ""
  }

  get pathOnly(): Route {
    return new Route(this.segments)
  }

  get firstSegment(): string {
    return this.segments[0]
  }

  get remainder(): Route {
    return new Route(this.segments.slice(1), this.query)
  }

  withQuery(query: string): Route {
    const clean = query.replace(/^\?/, "")
    return new Route(this.segments, clean)
  }

  concat(other: string | string[] | Route): Route {
    const otherRoute = other instanceof Route ? other : new Route(other)
    return new Route([...this.segments, ...otherRoute.segments], otherRoute.query || this.query)
  }

  toString(): string {
    return "/" + this.segments.join("/") + (this.query ? `?${this.query}` : "")
  }

  equals(other: Route): boolean {
    if (this.query !== other.query) return false
    if (this.segments.length !== other.segments.length) return false
    return this.segments.every((seg, i) => seg === other.segments[i])
  }

  /** Return path relative to the given base path if it is a prefix; otherwise return this */
  relativeTo(base: Route): Route {
    if (base.segments.length === 0) return this
    const isPrefix = base.segments.every((s, i) => this.segments[i] === s)
    return isPrefix
      ? new Route(this.segments.slice(base.segments.length), this.query)
      : this
  }
}