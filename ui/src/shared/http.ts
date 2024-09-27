export type HTTPMethod = "GET" | "POST";

export type ReqParams = {
  method: HTTPMethod;
  route: string;
  headers?: Record<string, string>;
  form?: Record<string, string>;
  json?: Record<string, unknown>;
  params?: Record<string, string>;
};

export interface HTTPClientConfig {
  serverBasePath: string;
  baseRoute?: string;
  authToken?: string;
}

interface ErrorResponse {
  detail: string;
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
  public readonly statusCode: number;

  constructor(statusCode: number, message: string | null = null) {
    if (!message) {
      message =
        statusCode in HTTP_CODE_NAMES
          ? HTTP_CODE_NAMES[statusCode]
          : statusCode.toString();
    }
    super(message);

    this.statusCode = statusCode;
  }
}

export class HTTPClient {
  public readonly serverBasePath: string;
  public readonly baseRoute: string;
  public readonly authToken?: string;

  constructor(cfg: HTTPClientConfig) {
    this.serverBasePath = cfg.serverBasePath;
    this.baseRoute = cfg.baseRoute || "";
    this.authToken = cfg.authToken;
  }

  async request(p: ReqParams): Promise<unknown> {
    let url = this.serverBasePath + this.baseRoute + p.route;
    const headers = new Headers();
    const config: RequestInit = {
      method: p.method,
      headers: headers,
    };

    if (p.headers) {
      for (const [key, val] of Object.entries(p.headers)) {
        headers.set(key, val);
      }
    }

    if (p.params) {
      const params = new URLSearchParams(p.params);
      url += "?" + params.toString();
    }

    if (p.json) {
      if (p.method == "GET") {
        throw new Error("Cannot specify JSON for GET request");
      }

      config.body = JSON.stringify(p.json);
      headers.set("Content-Type", "application/json");
    }

    if (p.form) {
      if (p.method == "GET") {
        throw new Error("Cannot specify payload for GET request");
      }

      const encoded = new URLSearchParams();
      for (const [key, val] of Object.entries(p.form)) {
        encoded.append(key, val);
      }
      config.body = encoded.toString();
      headers.set("Content-Type", "application/x-www-form-urlencoded");
    }

    if (this.authToken) {
      headers.set("Authorization", `Bearer ${this.authToken}`);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const body: ErrorResponse = (await response.json()) as ErrorResponse;
      throw new HTTPError(response.status, body.detail);
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
