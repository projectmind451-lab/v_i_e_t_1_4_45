import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AddressProvider } from "./context/AddressContext.jsx";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AddressProvider>
        <AppContextProvider>
          <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
          <App />
        </AppContextProvider>
      </AddressProvider>
    </BrowserRouter>
  </StrictMode>
);
