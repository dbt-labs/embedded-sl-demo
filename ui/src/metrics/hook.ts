import { useContext } from "react";
import MetricsContext from "./context.tsx";

const useMetrics = () => useContext(MetricsContext);

export default useMetrics;
