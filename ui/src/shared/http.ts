export type HTTPMethod = "GET" | "POST";

export type ReqParams = {
  method: HTTPMethod,
  route: string,
  headers: Record<string, string>,
  payload?: Record<string, unknown>,
}

export interface HTTPClientConfig {
  serverBasePath: string,
  baseRoute?: string,
  authToken?: string,
}

export class HTTPClient {
  constructor(cfg: HTTPClientConfig) {
    this.serverBasePath = cfg.serverBasePath;
    this.baseRoute = cfg.baseRoute || "";
    this.authToken = cfg.authToken;
  }

  async request(p: ReqParams): unknown {
    const url = this.serverBasePath + this.baseRoute + p.route;
    const config ={
      method: p.method,
      headers: {
        ...p.headers,
      }
    }; 

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
      throw new Error(`Response status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Unsupported content type received from server: ${contentType}`);
    }

    return await response.json();
  }
}

export default HTTPClient;
