import { useContext } from "react";

import "./Aside.css";

import useAuth from "../../auth/hook.ts";
import { UserContext } from "../../state/user.ts";

export default function Navbar() {
  const auth = useAuth();
  const user = useContext(UserContext);

  return (
    <aside>
      <ul>
        <li>Hi, {user.name}</li>
        <li>{user.storeLocationName}</li>
      </ul>
      <ul>
        <li>
          <a onClick={auth.logout}>Log Out</a>
        </li>
      </ul>
    </aside>
  );
}
