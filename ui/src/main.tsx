import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./auth/context.tsx";
import { MetricsProvider } from "./metrics/context.tsx";
import router from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <MetricsProvider>
        <RouterProvider router={router} />
      </MetricsProvider>
    </AuthProvider>
  </StrictMode>,
);
