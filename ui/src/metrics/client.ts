import HTTPClient from "../shared/http.ts";

import { MetricsGroupedBy, IntSeries, DateSeries } from "./types.ts";

export class MetricsClient {
  constructor(serverBasePath: string, authToken: string) {
    this._http = new HTTPClient({
      serverBasePath, 
      baseRoute: "/metrics",
      authToken: authToken,
    });
  }

  async getDailyOrders(): MetricsGroupedBy<FloatSeries, DateSeries> {
    const orders: MetricsGroupedBy<IntSeries, DateSeries> = await this._http.request({
      method: "GET",
      route: "/daily-orders",
    })
    return orders;
  }

  static fromAuthToken(authToken: string) {
    return new MetricsClient(
      import.meta.env.VITE_SERVER_BASE_PATH,
      authToken,
    );
  }
}

export default MetricsClient;
