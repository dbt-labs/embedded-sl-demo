import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import "./Login.css";
import useAuth from "../auth/hook.ts";

export default function Login() {
  const auth = useAuth();

  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [err, setErr] = useState<Error | null>(null);

  const login = async (e: FormEvent) => {
    e.preventDefault();

    const data = new FormData(e.target);

    const email = data.get("email");
    const password = data.get("password");
    try {
      await auth.login(email, password);
      setLoggedIn(true);
    } catch (e: Error) {
      setErr(e);
    }
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
