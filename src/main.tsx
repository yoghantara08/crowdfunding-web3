import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { StateContextProvider } from "./context";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { clientId } from "./client";
import { Sepolia } from "@thirdweb-dev/chains";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={Sepolia} clientId={clientId}>
      <BrowserRouter>
        <StateContextProvider>
          <App />
        </StateContextProvider>
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>
);
