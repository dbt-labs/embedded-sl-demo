export interface AuthToken {
  token: string;
  expires: Date;
}

export class AuthError extends Error {}
