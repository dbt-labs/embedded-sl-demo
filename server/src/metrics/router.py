import asyncio
import datetime as dt
from typing import Annotated

import pyarrow as pa
from fastapi import APIRouter, Query

from src.auth import AuthDependency
from src.dependencies import SemanticLayerDependency
from src.metrics.models_out import Metric, MetricsGroupedBy, SemanticLayerQuery

router = APIRouter(
    prefix="/metrics",
)

# TODO: validate dates. This regex accepts 2000-90-90
DatePathParam = Annotated[str | None, Query(regex="^[0-9]{4}-[0-9]{2}-[0-9]{2}$")]


@router.get("/daily-orders")
async def get_orders(
    auth: AuthDependency,
    sl: SemanticLayerDependency,
    start: DatePathParam = None,
    end: DatePathParam = None,
) -> Metric[dt.date, float]:
    """Get a buffer with daily orders for the current shop."""
    metric = "order_total"
    group_by = "metric_time__day"

    # NOTE: do SQL sanitization
    where = [f"{{{{ Dimension('location__location_name') }}}} = '{auth.user.store_location_name}'"]

    if start is not None:
        where.append(f"{{{{ TimeDimension('metric_time', 'day') }}}} >= '{start}'")

    if end is not None:
        where.append(f"{{{{ TimeDimension('metric_time', 'day') }}}} <= '{end}'")

    query_task = sl.query(
        metrics=[metric],
        group_by=[group_by],
        where=where,
        order_by=[group_by],
    )
    sql_task = sl.compile_sql(
        metrics=[metric],
        group_by=[group_by],
        where=where,
        order_by=[group_by],
    )

    table, sql = await asyncio.gather(query_task, sql_task)

    # cast table from datetime to date
    # TODO: have to use type ignores here because pyarrow-stubs isn't typed correctly and pyright doesn't like it
    # See: https://github.com/zen-xu/pyarrow-stubs/issues
    schema = pa.schema(  # type: ignore
        [
            pa.field(group_by.upper(), pa.date32()),  # type: ignore
            pa.field(metric.upper(), pa.float64()),  # type: ignore
        ]
    )
    table = table.cast(schema)

    out_data = MetricsGroupedBy[dt.date, float].from_arrow(group_by, [metric], table)

    return Metric[dt.date, float](
        id="daily-orders",
        title=f"Daily orders in {auth.user.store_location_name}",
        sql=sql,
        sl_query=SemanticLayerQuery(
            metrics=[metric],
            group_by=[group_by],
            where=where,
            order_by=[group_by],
        ),
        data=out_data,
    )
