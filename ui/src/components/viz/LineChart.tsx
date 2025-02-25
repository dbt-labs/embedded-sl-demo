import { useState } from "react";

import ReactECharts from "echarts-for-react";

import {
  FloatSeries,
  DateSeries,
  MetricResult,
  MetricsGroupedBy,
  SemanticLayerQuery,
} from "../../api/types/metrics.ts";
import "./LineChart.css";

import Modal from "../Modal.tsx";

import infoIconUrl from "../../assets/info-circle.svg";

export interface Props<
  TMetrics extends FloatSeries,
  TGroupBy extends DateSeries,
> {
  result: MetricResult<MetricsGroupedBy<TMetrics, TGroupBy>>;
}

export default function LineChart<
  TMetrics extends FloatSeries,
  TGroupBy extends DateSeries,
>(props: Props<TMetrics, TGroupBy>) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const option = {
    title: {
      text: props.result.title,
    },
    color: [
      // "#252422",
      // "#402d39",
      // "#ccc5b9",
      // "#fffcf2",

      "#5470c6",
      "#ffff00",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
    textStyle: {
      color: "#252422",
    },
    animationDuration: 300,
    toolbox: {
      show: true,
      iconStyle: {
        borderColor: "#402d39",
      },
      emphasis: {
        iconStyle: {
          borderColor: "#252422",
          borderWidth: 2,
        },
      },
      feature: {
        magicType: { type: ["line", "bar"] },
        restore: {},
        saveAsImage: {},
        myQueryInfoView: {
          show: true,
          title: "View query info",
          icon: "image://" + infoIconUrl,
          onclick: function () {
            setShowModal(!showModal);
          },
        },
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false,
      },
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: "all",
        },
      ],
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 100,
        xAxisIndex: [0, 1],
      },
      {
        type: "inside",
        realtime: true,
        start: 30,
        end: 70,
        xAxisIndex: [0, 1],
      },
    ],
    xAxis: {
      boundaryGap: false,
      type: "category",
      data: props.result.data.groupBy.data,
    },
    yAxis: {
      type: "value",
    },
    series: props.result.data.metrics.map((m) => ({
      type: "line",
      data: m.data,
    })),
  };

  const getQueryStringList = (
    title: string,
    prop: keyof SemanticLayerQuery,
  ) => {
    return (
      <div key={title}>
        <b>{title}</b>
        <ul>
          {props.result.slQuery[prop].map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>
    );
  };

  const modal = (
    <Modal title="Query information" onClose={() => setShowModal(false)}>
      <div className="block">
        <span className="title">Semantic Layer Query</span>
        <div className="code sl-query">
          {getQueryStringList("Metrics:", "metrics")}
          {getQueryStringList("Group by:", "groupBy")}
          {getQueryStringList("Where:", "where")}
          {getQueryStringList("Order by:", "orderBy")}
        </div>
      </div>
      <div className="block">
        <span className="title">Generated SQL</span>
        <div className="code">{props.result.sql}</div>
      </div>
    </Modal>
  );

  return (
    <div className="line-chart">
      {showModal && modal}
      <ReactECharts option={option} className="chart"></ReactECharts>
    </div>
  );
}
