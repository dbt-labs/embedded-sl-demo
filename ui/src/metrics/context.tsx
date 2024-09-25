import { createContext } from "react";

import MetricsClient from "./client.ts";
import useAuth from "../auth/hook.ts";

const MetricsContext = createContext<MetricsClient | null>(null);

export const MetricsProvider = ({ children }) => {
  const auth = useAuth();

  const client = auth.user
    ? MetricsClient.fromAuthToken(auth.user.id.toString())
    : null;

  return (
    <MetricsContext.Provider value={client}>{children}</MetricsContext.Provider>
  );
};

export default MetricsContext;
