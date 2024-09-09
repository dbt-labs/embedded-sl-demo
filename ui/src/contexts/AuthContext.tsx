import { createContext, useReducer } from "react";

import authClient from "../clients/auth.ts";
import { User } from "../types/auth.ts";

interface State {
  user: User | null;
}

type LoginAction = {
  type: "LOGIN";
  payload: {
    user: User;
  };
};

type LogoutAction = {
  type: "LOGOUT";
};

type Action = LoginAction | LogoutAction;

const initialState: State = {
  user: null,
};
Object.freeze(initialState);

const handlers: Record<string, (state: State, action: Action) => State> = {
  LOGIN: (state: State, action: Action): State => {
    return {
      user: action.payload.user,
    };
  },
  LOGOUT: (): State => {
    return {
      user: null,
    };
  },
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

interface AuthContextValue extends State {
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email: string, password: string): Promise<void> => {
    const user = await authClient.login(email, password);
    dispatch({
      type: "LOGIN",
      payload: {
        user,
      },
    });
  };

  const logout = async (): Promise<void> => {
    dispatch({
      type: "LOGOUT",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
