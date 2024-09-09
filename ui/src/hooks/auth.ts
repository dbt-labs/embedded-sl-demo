import { useContext } from "react";
import AuthContext from "../contexts/AuthContext.tsx";

const useAuth = () => useContext(AuthContext);

export default useAuth;
