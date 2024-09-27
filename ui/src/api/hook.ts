import { useContext } from "react";
import { APIClientContext } from "./context.tsx";

const useAPI = () => useContext(APIClientContext);

export default useAPI;
