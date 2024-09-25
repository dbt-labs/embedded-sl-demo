import { AuthError, User } from "./types.ts";

import HTTPClient, { HTTPError } from "../shared/http.ts";

export class AuthClient {
  constructor(serverBasePath: string) {
    this._http = new HTTPClient({
      serverBasePath,
      baseRoute: "/auth",
    });
  }

  async login(email: string, password: string): User {
    const encodedIdentity = window.btoa(`${email}:${password}`);

    try {
      return await this._http.request({
        method: "POST",
        route: "/",
        headers: {
          Authorization: `Basic ${encodedIdentity}`,
        },
      });
    } catch (err) {
      if (
        err instanceof HTTPError &&
        (err.statusCode == 401 || err.statusCode == 403)
      ) {
        throw new AuthError("Invalid username or password.");
      }
      throw err;
    }
  }
}

const client = new AuthClient(import.meta.env.VITE_SERVER_BASE_PATH);

export default client;
