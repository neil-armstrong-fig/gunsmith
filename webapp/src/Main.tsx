import {App} from "@src/react/App";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "@src/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("index.html has no #root element to mount the app in.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
