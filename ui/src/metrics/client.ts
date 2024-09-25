import HTTPClient from "../shared/http.ts";

import { BaseQuery, MetricResult } from "./types.ts";

export class MetricsClient {
  constructor(serverBasePath: string, authToken: string) {
    this._http = new HTTPClient({
      serverBasePath,
      baseRoute: "/metrics",
      authToken: authToken,
    });
  }

  async query<TOutput>(query: BaseQuery<TOutput>): MetricResult<TOutput> {
    const data: MetricResult<TOutput> = await this._http.request({
      method: "GET",
      route: `/${query.queryName}`,
      params: query.params,
    });
    return data;
  }

  static fromAuthToken(authToken: string) {
    return new MetricsClient(import.meta.env.VITE_SERVER_BASE_PATH, authToken);
  }
}

export default MetricsClient;
