import { Navigate } from "react-router-dom";

import Navbar from "../components/navbar/Navbar.tsx";
import useAuth from "../auth/hook.ts";

export default function App() {
  const auth = useAuth();

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  return (
      <Navbar />
  );
}
