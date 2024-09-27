import { MetricsGroupedByDateQuery } from "./metrics.ts";

export function dailyOrders(start: Date, end: Date): MetricsGroupedByDateQuery {
  return {
    queryName: "daily-orders",
    params: {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    },
  };
}
