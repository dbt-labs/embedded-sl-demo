import { APIClientProvider } from "../api/context.tsx";
import LoggedInApp from "./LoggedInApp.tsx";

// This allows us to use <Navigate> from within our providers like AuthProvider and APIClientProvider
export default function App() {
  return (
    <APIClientProvider>
      <LoggedInApp />
    </APIClientProvider>
  );
}
