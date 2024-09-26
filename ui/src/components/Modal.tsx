import react from "react";

import "./Modal.css";

interface Props {
  title: string;
  children: react.ReactNode;

  onClose?: () => void;
}

export default function Modal(props: Props) {
  return (
    <div className="modal">
      <div className="backdrop"></div>
      <div className="content">
        <div className="header">
          <h2>{props.title}</h2>
          <button onClick={props.onClose}>X</button>
        </div>
        <div className="body">{props.children}</div>
      </div>
    </div>
  );
}
