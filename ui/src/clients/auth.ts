import { User } from "../types/auth.ts";

type HTTPMethod = "GET" | "POST";

type ReqParams = {
  method: HTTPMethod,
  route: string,
  headers: Record<string, string>,
  payload?: Record<string, unknown>,
}

export class AuthClient {
  constructor(serverBasePath: string) {
    this.serverBasePath = serverBasePath;
  }

  async _req(p: ReqParams): unknown {
    const url = this.serverBasePath + p.route;
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

  async login(email: string, password: string): User {
    const encodedIdentity = window.btoa(`${email}:${password}`)

    const user: User = await this._req({
      method: "POST",
      route: "/auth",
      headers: {
        "Authorization": `Basic ${encodedIdentity}`
      }
    })

    return user;
  }
}

const client = new AuthClient(import.meta.env.VITE_SERVER_BASE_PATH);

export default client;
