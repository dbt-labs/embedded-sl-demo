import { useState, useEffect, Component } from "react";

import { Query, MetricResult } from "../metrics/types.ts";
import useMetrics from "../metrics/hook.ts";

import "./MetricsDisplay.css";

export interface DisplayProps<TMetric> {
  result: MetricResult<TMetric>;
}

export interface Props<TMetric> {
  query: Query;
  display: Component<DisplayProps<TMetric>>;
}

export default function MetricsDisplay<TMetric>(props: Props<TMetric>) {
  const metrics = useMetrics();

  const [result, setResult] = useState<MetricResult<TMetric> | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const result: MetricResult<TMetric> = await metrics.query(props.query);
      setResult(result);
    };

    fetchResult();
  }, [props.query, metrics]);

  return (
    <div className="display">
      {result ? (
        <props.display result={result}></props.display>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
}
