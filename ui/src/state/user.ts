import { createContext } from "react";

import { User } from "../api/types/users.ts";

export const UserContext = createContext<User>({} as User);

export default UserContext;
