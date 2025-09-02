import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain="dev-mqsg4vi0.us.auth0.com"
    clientId="qgnDmox4JIcm63sLthqsPw5qBk1dXbkX"
    redirectUri={window.location.origin}
  >
    <Auth0Provider>
        <App />
    </Auth0Provider>,
  </Auth0Provider>
);