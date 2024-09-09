export class AuthError extends Error {};

export interface User {
  id: int;
  name: string;
  email: string;
  storeLocationName: string;
}
