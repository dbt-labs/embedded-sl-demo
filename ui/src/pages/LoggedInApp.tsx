import { useState, useEffect } from "react";

import "./LoggedInApp.css";

import LineChart from "../components/viz/LineChart.tsx";
import Aside from "../components/aside/Aside.tsx";
import MetricsDisplay from "../components/MetricsDisplay.tsx";

import useAPI from "../api/hook.ts";
import { User } from "../api/types/users.ts";

import { UserContext } from "../state/user.ts";

import { dailyOrders } from "../api/types/queries.ts";

export default function LoggedInApp() {
  const api = useAPI();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await api.users.me();
      setUser(user);
    };
    void fetchUser();
  }, [api.sessionId, api.users]);

  // TODO: move query away from here
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const query = dailyOrders(start, end);

  const contents = user ? (
    <UserContext.Provider value={user}>
      <Aside />
      <main>
        <MetricsDisplay query={query} display={LineChart} />
      </main>
    </UserContext.Provider>
  ) : (
    "Loading current user..."
  );

  return <div className="wrapper">{contents}</div>;
}
