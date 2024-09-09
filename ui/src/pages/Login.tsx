import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import useAuth from "../hooks/auth.ts";

export default function Login() {
  const auth = useAuth();

  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [err, setErr] = useState<Error | null>(null);

  const login = async (e: FormEvent) => {
    e.preventDefault();

    const data = new FormData(e.target);

    const email = data.get("email");
    try {
      await auth.login(email);
      setLoggedIn(true);
    } catch (e: Error) {
      setErr(e);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <form onSubmit={login}>
        <label htmlFor="email">Email</label>
        <input name="email" />
        <button type="submit">Login</button>
      </form>

      {err && <p>{err.message}</p>}
    </div>
  );
}
