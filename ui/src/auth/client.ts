import { AuthError, AuthToken } from "./types.ts";

import HTTPClient, { HTTPError } from "../shared/http.ts";

interface OAuthResponse {
  grant_type: string;
  access_token: string;
  expires_in: number;
}

export class AuthClient {
  private _http: HTTPClient;

  constructor(serverBasePath: string) {
    this._http = new HTTPClient({
      serverBasePath,
      baseRoute: "/auth",
    });
  }

  async login(email: string, password: string): Promise<AuthToken> {
    try {
      const response = (await this._http.request({
        method: "POST",
        route: "/token",
        form: {
          grant_type: "password",
          username: email,
          password: password,
        },
      })) as OAuthResponse;

      const expiresAtSeconds =
        Math.floor(new Date().getTime()) + response.expires_in;
      const expires = new Date(expiresAtSeconds);

      return {
        token: response.access_token,
        expires: expires,
      };
    } catch (err) {
      if (
        err instanceof HTTPError &&
        (err.statusCode == 401 || err.statusCode == 403)
      ) {
        throw new AuthError(err.message);
      }
      throw err;
    }
  }
}

const client = new AuthClient(import.meta.env.VITE_SERVER_BASE_PATH as string);

export default client;
