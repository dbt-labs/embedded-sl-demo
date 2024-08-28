import datetime as dt
from enum import Enum
from typing import get_args as get_type_args

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
    def from_py_type(cls, pt: type[ValueType]) -> "SeriesType":
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


class User(BaseModel):
    """A user."""

    id: int
    name: str
    store_location_name: str
