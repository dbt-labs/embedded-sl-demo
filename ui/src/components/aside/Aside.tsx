import "./Aside.css";

import useAuth from "../../auth/hook.ts";

export default function Navbar() {
  const auth = useAuth();

  return (
    <aside>
      <ul>
        <li>Hi, {auth.user.name}</li>
        <li>{auth.user.storeLocationName}</li>
      </ul>
      <ul>
        <li>
          <a onClick={auth.logout}>Log Out</a>
        </li>
      </ul>
    </aside>
  );
}
