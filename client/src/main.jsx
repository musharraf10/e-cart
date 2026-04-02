import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "./styles.css";
import { registerServiceWorker } from "./pwa/register-sw.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";

setupListeners(store.dispatch);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);

registerServiceWorker();
