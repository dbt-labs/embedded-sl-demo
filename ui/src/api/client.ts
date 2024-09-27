import HTTPClient from "../shared/http.ts";

import { User } from "./types/users.ts";
import { BaseQuery, MetricResult } from "./types/metrics.ts";

import { AuthToken } from "../auth/types.ts";

class PathClient {
  protected static path: string;

  protected _http: HTTPClient;

  constructor(serverBasePath: string, authToken: string) {
    this._http = new HTTPClient({
      serverBasePath,
      baseRoute: (this.constructor as typeof PathClient).path,
      authToken: authToken,
    });
  }
}

export class MetricsClient extends PathClient {
  protected static path = "/metrics";

  async query<TOutput>(
    query: BaseQuery<TOutput>,
  ): Promise<MetricResult<TOutput>> {
    return (await this._http.request({
      method: "GET",
      route: `/${query.queryName}`,
      params: query.params,
    })) as MetricResult<TOutput>;
  }
}

export class UsersClient extends PathClient {
  protected static path = "/users";

  async me(): Promise<User> {
    return (await this._http.request({
      method: "GET",
      route: "/me",
    })) as User;
  }
}

export class APIClient {
  public readonly sessionId: string;

  public readonly metrics: MetricsClient;
  public readonly users: UsersClient;

  constructor(serverBasePath: string, authToken: string) {
    // TODO: hash token to avoid leaking
    this.sessionId = authToken;

    this.metrics = new MetricsClient(serverBasePath, authToken);
    this.users = new UsersClient(serverBasePath, authToken);
  }

  static fromAuthToken(token: AuthToken): APIClient | null {
    const now = new Date();

    if (now >= token.expires) {
      return null;
    }

    return new APIClient(
      import.meta.env.VITE_SERVER_BASE_PATH as string,
      token.token,
    );
  }
}

export default APIClient;
