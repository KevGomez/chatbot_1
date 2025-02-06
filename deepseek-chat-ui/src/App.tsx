import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Chatbot from "./Chatbot";

function App() {
  return (
    <>
      <div className="app-container">
        <Chatbot />
      </div>
    </>
  );
}

export default App;
