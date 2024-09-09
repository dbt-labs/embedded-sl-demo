import { Navigate } from "react-router-dom";

import "./App.css";

import Aside from "../components/aside/Aside.tsx";
import useAuth from "../auth/hook.ts";
import useMetrics from "../metrics/hook.ts";

export default function App() {
  const auth = useAuth();
  const metrics = useMetrics();

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  // metrics.getDailyOrders().then(orders => console.log(orders));

  return (
    <div className="wrapper">
      <Aside />
      <main>
      adsfasdf:w
      </main>
    </div>
  );
}
