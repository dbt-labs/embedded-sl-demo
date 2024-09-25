export type HTTPMethod = "GET" | "POST";

export type ReqParams = {
  method: HTTPMethod;
  route: string;
  headers: Record<string, string>;
  payload?: Record<string, unknown>;
  params?: Record<string, string>;
};

export interface HTTPClientConfig {
  serverBasePath: string;
  baseRoute?: string;
  authToken?: string;
}

export const HTTP_CODE_NAMES: Record<number, string> = {
  200: "OK",
  201: "Created",
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  500: "Internal server error",
};

export class HTTPError extends Error {
  constructor(statusCode: number, message?: string = null) {
    if (!message) {
      message =
        statusCode in HTTP_CODE_NAMES
          ? HTTP_CODE_NAMES[statusCode]
          : statusCode.toString();
    }
    super(message);

    this.statusCode = statusCode;
  }

  toString(): string {}
}

export class HTTPClient {
  constructor(cfg: HTTPClientConfig) {
    this.serverBasePath = cfg.serverBasePath;
    this.baseRoute = cfg.baseRoute || "";
    this.authToken = cfg.authToken;
  }

  async request(p: ReqParams): unknown {
    let url = this.serverBasePath + this.baseRoute + p.route;
    const config = {
      method: p.method,
      headers: {
        ...p.headers,
      },
    };

    if (p.params) {
      const params = new URLSearchParams(p.params);
      url += "?" + params.toString();
    }

    if (p.payload) {
      if (p.method == "GET") {
        throw new Error("Cannot specify payload for GET request");
      }
      config.body = JSON.stringify(p.payload);
      config.headers["Content-Type"] = "application/json";
    }

    if (this.authToken) {
      config.headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new HTTPError(response.status);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Unsupported content type received from server: ${contentType}`,
      );
    }

    return await response.json();
  }
}

export default HTTPClient;
