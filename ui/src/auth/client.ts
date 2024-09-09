import { User } from "./types.ts";

import HTTPClient from "../shared/http.ts";


export class AuthClient {
  constructor(serverBasePath: string) {
    this._http = new HTTPClient({
      serverBasePath, 
      baseRoute: "/auth",
    });
  }

  async login(email: string, password: string): User {
    const encodedIdentity = window.btoa(`${email}:${password}`)

    const user: User = await this._http.request({
      method: "POST",
      route: "/",
      headers: {
        "Authorization": `Basic ${encodedIdentity}`
      }
    })

    return user;
  }
}

const client = new AuthClient(import.meta.env.VITE_SERVER_BASE_PATH);

export default client;
