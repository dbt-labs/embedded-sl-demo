import clickhouse_connect


class Clickhouse:
    def __init__(self):
        self.__client = clickhouse_connect.get_client(
            host='qykjwyh0mu.us-east-1.aws.clickhouse.cloud',
            port=8443,
            username='default',
            password='',
            secure=True,
            database="jaffle_shop"
        )

    def query(self, sql: str):

        sql = sql.replace("ANALYTICS.semantic_layer_devspace.", "")
        print(sql)
        table = self.__client.query_arrow(sql)

        return table
