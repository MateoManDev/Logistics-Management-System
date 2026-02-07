import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx"; // Puede ser './App.tsx' según tu config, pero './App' suele funcionar
import "./index.css"; // <--- ¡ESTA ES LA LÍNEA MÁGICA QUE CARGA EL DISEÑO!
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
