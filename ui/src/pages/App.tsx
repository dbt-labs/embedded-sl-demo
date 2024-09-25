import { Navigate } from "react-router-dom";

import "./App.css";

import LineChart from "../components/viz/LineChart.tsx";
import Aside from "../components/aside/Aside.tsx";
import MetricsDisplay from "../components/MetricsDisplay.tsx";

import useAuth from "../auth/hook.ts";

import { dailyOrders } from "../metrics/queries.ts";

export default function App() {
  const auth = useAuth();

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const query = dailyOrders(start, end);

  return (
    <div className="wrapper">
      <Aside />
      <main>
        <MetricsDisplay query={query} display={LineChart}></MetricsDisplay>
      </main>
    </div>
  );
}
