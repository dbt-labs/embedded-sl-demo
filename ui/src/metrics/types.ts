type SeriesType = 
    "int" |
    "float" |
    "string" |
    "date" |
    "datetime";

export interface Series<T> {
  name: string;
  type: SeriesType;
  data: T[];
}

export interface IntSeries extends Series<number> {
  type: "int";
}

export interface FloatSeries extends Series<number> {
  type: "float";
}

export interface StringSeries extends Series<string> {
  type: "string";
}

export interface DateSeries extends Series<string> {
  type: "date";
}

export interface DatetimeSeries extends Series<string> {
  type: "datetime";
}

export interface MetricsGroupedBy<TMetrics extends Series, TGroupBy extends Series> {
  metrics: TMetrics[];
  groupBy: TGroupBy;
}

