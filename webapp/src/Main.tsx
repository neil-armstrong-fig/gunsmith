import {App} from "@src/react/App";
import {store} from "@src/redux/Store";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import "@src/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("index.html has no #root element to mount the app in.");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
