import { createContext, useReducer, FC, PropsWithChildren } from "react";

import authClient from "./client.ts";
import { AuthToken } from "./types.ts";

interface State {
  token: AuthToken | null;
}

type LoginAction = {
  type: "LOGIN";
  payload: {
    token: AuthToken;
  };
};

type LogoutAction = {
  type: "LOGOUT";
};

type Action = LoginAction | LogoutAction;

const initialState: State = {
  token: null,
};
Object.freeze(initialState);

const handlers: Record<string, (state: State, action: Action) => State> = {
  // @ts-expect-error: 2322
  LOGIN: (_: State, action: LoginAction): State => {
    return {
      token: action.payload.token,
    };
  },
  LOGOUT: (): State => {
    return {
      token: null,
    };
  },
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

interface AuthContextValue extends State {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  login: () => Promise.resolve(),
  logout: () => {},
});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email: string, password: string): Promise<void> => {
    const token = await authClient.login(email, password);
    dispatch({
      type: "LOGIN",
      payload: {
        token,
      },
    });
  };

  const logout = (): void => {
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
