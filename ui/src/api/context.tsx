import { Navigate } from "react-router-dom";
import { createContext, FC, PropsWithChildren } from "react";

import APIClient from "./client.ts";
import useAuth from "../auth/hook.ts";

export const APIClientContext = createContext<APIClient>({} as APIClient);

export const APIClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  const client = auth.token ? APIClient.fromAuthToken(auth.token) : null;

  if (!client) {
    return <Navigate to="/login" />;
  }

  return (
    <APIClientContext.Provider value={client}>
      {children}
    </APIClientContext.Provider>
  );
};

export default APIClientProvider;
