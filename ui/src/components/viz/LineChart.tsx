import ReactECharts from "echarts-for-react";

import { MetricResult } from "../../metrics/types.ts";

import infoIconUrl from "../../assets/info-circle.svg";

export interface Props<TMetrics, TGroupBy> {
  result: MetricResult<TMetrics, TGroupBy>;
}

export default function LineChart(props: Props): FC<Props<TMetrics, TGroupBy>> {
  const option = {
    title: {
      text: props.result.title,
    },
    color: [
      "#252422",
      "#402d39",
      "#ccc5b9",
      "#fffcf2",

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
        dataZoom: {
          yAxisIndex: "none",
        },
        magicType: { type: ["line", "bar"] },
        restore: {},
        saveAsImage: {},
        myQueryInfoView: {
          show: true,
          title: "View query info",
          icon: "image://" + infoIconUrl,
          onclick: function () {
            alert("myToolHandler1");
          },
        },
      },
    },
    xAxis: {
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

  return <ReactECharts option={option} className="chart"></ReactECharts>;
}
