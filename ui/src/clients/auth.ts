import { User } from "../types/auth.ts";

export class AuthClient {
  constructor(serverBasePath: string) {
    this.serverBasePath = serverBasePath;
  }

  // TODO: unmock this
  async login(email: string): User {
    console.log("logging in as", email);
    return {
      id: 1,
      email: "asd",
      username: "asdasda",
    };
  }
}

const client = new AuthClient(import.meta.env.SERVER_BASE_PATH);

export default client;
