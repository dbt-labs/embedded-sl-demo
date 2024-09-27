import { useState, useEffect, Component } from "react";

import { BaseQuery, MetricResult } from "../api/types/metrics.ts";
import useAPI from "../api/hook.ts";

import "./MetricsDisplay.css";

export interface DisplayProps<TMetric> {
  result: MetricResult<TMetric>;
}

export interface Props<TMetric> {
  query: BaseQuery<TMetric>;
  display: Component<DisplayProps<TMetric>>;
}

export default function MetricsDisplay<TMetric>(props: Props<TMetric>) {
  const api = useAPI();

  const [result, setResult] = useState<MetricResult<TMetric> | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      const result: MetricResult<TMetric> = await api!.metrics.query(
        props.query,
      );
      setResult(result);
    };

    fetchResult();
  }, [props.query, api]);

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
