# Demo of the dbt Semantic Layer for embedded analytics

This repository contains a small usage demo of the dbt Semantic Layer for embedded analytics. It serves as a starting point and as a reference for teams who want to understand better how to use dbt Cloud for embedded analytics.

## The use case

Jaffle Shop's recent years as a coffee shop have been very successful. They've managed to grow their audience and product portfolio, and are now expanding to many cities across the US through a franchise model. With such growth, the executive team was struggling to keep track of their metrics. They hired a data team to manage data, and the team chose to use dbt Cloud + [insert data warehouse here] + dbt Semantic Layer. Now, Jaffle Shop's executive team has access to all their metrics through the Semantic Layer.

More recently, the owners of each branch of Jaffle Shop surfaced the need for more detailed tracking of each of their own shops. Luckily, the data team already had all the transformations, data and metric definitions for the entirety of Jaffle Shop. Conveniently, if they filter those metrics by `Store location`, they can easily get what each store owner is asking for. The data team wrote a simple app that selects the appropriate `where` filter for the dbt Semantic Layer depending on the logged in user. Their problem is solved!


## How it works

The demo has 2 main components: the _server_ and the _UI_.


### The server
The server is a [FastAPI](https://fastapi.tiangolo.com/) application that exposes the following endpoints:
- [`/auth/token`](./server/src/auth/router.py): get an access token based on a user/password combo. In other words, login.
- [`/users/me`](./server/src/app.py): get information about the current user
- [`/metrics/daily-orders`](./server/src/metrics/router.py): submit a query to the dbt Semantic Layer using the [Python SDK](https://docs.getdbt.com/docs/dbt-cloud-apis/sl-python) for the daily orders of a given Jaffle Shop branch. The `where` filter is dynamically generated to filter by the branch of the requesting user. This endpoint does some transformation to make the data easily consumable by our plotting library ([Apache ECharts](https://echarts.apache.org/en/index.html)). It also returns the compiled SQL from the query.


### The UI
The UI is a simple React application. The flow is:
- Redirect user to `/login` if the token is unavailable or expired
- Get access token via `/auth/token` and redirect to `/` if succeeded
- Fetch the current user via `/users/me`
- Populate some fields such as name and store location
- Get the daily orders via `/metrics/daily-orders` and populate the [Apache ECharts](https://echarts.apache.org/en/index.html) chart.


## Running it yourself

Before starting, you'll need:
- [docker](https://docs.docker.com/engine/install/); 
- [docker compose](https://docs.docker.com/compose/install/);
- A [dbt Cloud](https://www.getdbt.com/product/dbt-cloud) account with the [Jaffle Shop](https://github.com/dbt-labs/jaffle-shop) project in it;
- The Jaffle Shop dbt models in your data warehouse;
- The dbt Semantic Layer enabled in your account.

Once you're setup, clone this repository locally.

Then, create a `.env` file in the `server/` directory. This file should contain the following environment variables with your secrets:
```
SL__HOST=<the host of your semantic layer account>
SL__ENVIRONMENT_ID=<your environment ID>
SL__TOKEN=<your secret access token to the semantic layer>
AUTH__JWT_SIGNING_SECRET=<the secret that will be used to sign JWT tokens>
```


To run in "production" mode, run the following in the root of the repository
```
docker compose up
```

To run in "development" mode, with hot code reloads and `debugpy`, run the following instead
```
docker compose -f dev.compose.yaml up
```

The UI is served at `http://localhost:8080/`, and the server is at `http://localhost:8081`.


## Applying these concepts in a real-world app

This repository is just a demo of what the dbt Semantic Layer is capable of when it comes to embedded analytics. We purposefully cut some corners that were not relevant to this purpose while implementing it. When using it for embedded analytics in a real system, you should make sure that:
- All data you provide to the Semantic Layer is trusted and sanitized to avoid SQL injections to your warehouse. In this demo, the `Store Location` is not validated, i.e it is assumed to be fully trusted. You should _never_ feed untrusted data directly into the Semantic Layer without proper sanitization.
- You follow the best security practices for storing and retrieving passwords, exchanging and invalidating tokens and handling PII. In this demo, we're storing plain text passwords in a fake database. Needless to say, you shouldn't do that in the real world.
- You carefully consider access controls and how the where filters you provide to the Semantic Layer relate to them, to avoid accidentally leaking data.


