import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import "./Login.css";
import useAuth from "../auth/hook.ts";

export default function Login() {
  const auth = useAuth();

  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [err, setErr] = useState<Error | null>(null);

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    const email = data.get("email") as string;
    const password = data.get("password") as string;

    auth
      .login(email, password)
      .then(() => setLoggedIn(true))
      .catch((e) => setErr(e as Error));
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login">
      <p className="error">{err ? err.message : ""}</p>

      <form onSubmit={login}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input name="email" type="email" />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input name="password" type="password" />
        </div>
        <div className="form-field">
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
