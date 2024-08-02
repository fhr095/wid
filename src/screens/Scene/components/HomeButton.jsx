import React from "react";
import { FaHome } from "react-icons/fa";
import "../styles/Buttons.scss";

export default function HomeButton({ onClick }) {
  return (
    <div className="home-button-container">
      <button type="button" className="home-button" onClick={onClick}>
        <FaHome size={30} />
      </button>
    </div>
  );
}
