from __future__ import annotations

import datetime as dt
from enum import Enum
from typing import get_args as get_type_args

import pyarrow as pa

from src.models import BaseModel

ValueType = int | str | float | dt.date | dt.datetime


class SeriesType(str, Enum):
    """The data type of a Series."""

    INT = "int"
    FLOAT = "float"
    STRING = "string"
    DATE = "date"
    DATETIME = "datetime"

    @classmethod
    def from_py_type(cls, pt: type[ValueType]) -> SeriesType:
        """Get a SeriesType from a python type."""
        pt_map = {
            int: SeriesType.INT,
            float: SeriesType.FLOAT,
            str: SeriesType.STRING,
            dt.date: SeriesType.DATE,
            dt.datetime: SeriesType.DATETIME,
        }
        return pt_map[pt]


class Series[T: ValueType](BaseModel):
    """A one-dimensional series of data."""

    name: str
    data: list[T]

    @property
    def type(self) -> SeriesType:  # noqa: D102
        py_type = get_type_args(self)[0]
        return SeriesType.from_py_type(py_type)


class MetricsGroupedBy[TGroupBy: ValueType, TMetrics: ValueType](BaseModel):
    """The output of a metrics query grouped by some dimension."""

    metrics: list[Series[TMetrics]]
    group_by: Series[TGroupBy]

    @classmethod
    def from_arrow(cls, group_by: str, metrics: list[str], table: pa.Table) -> MetricsGroupedBy[TGroupBy, TMetrics]:
        """Construct a MetricsGroupedBy from a PyArrow table."""
        metrics_data_list: list[list[TMetrics]] = [table[metric.upper()].to_pylist() for metric in metrics]  # type: ignore
        group_by_data: list[TGroupBy] = table[group_by.upper()].to_pylist()  # type: ignore

        return MetricsGroupedBy[TGroupBy, TMetrics](
            metrics=[
                Series[TMetrics](name=metric_name, data=metric_data)
                for metric_name, metric_data in zip(metrics, metrics_data_list)
            ],
            group_by=Series[TGroupBy](name=group_by, data=group_by_data),
        )


class SemanticLayerQuery(BaseModel):
    """Represents a query that is sent to the SL."""

    metrics: list[str]
    group_by: list[str]
    where: list[str]
    order_by: list[str]


class MetricOutput[TGroupBy: ValueType, TMetrics: ValueType](BaseModel):
    """A metric that will be served to the clients."""

    id: str
    title: str
    sql: str
    sl_query: SemanticLayerQuery
    # NOTE: pydantic validation fails if we propagate the generics here...
    data: MetricsGroupedBy  # type: ignore


class User(BaseModel):
    """A user."""

    id: int
    name: str
    store_location_name: str
    email: str
