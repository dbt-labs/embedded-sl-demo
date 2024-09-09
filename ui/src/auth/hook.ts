import { useContext } from "react";
import AuthContext from "./context.tsx";

const useAuth = () => useContext(AuthContext);

export default useAuth;
