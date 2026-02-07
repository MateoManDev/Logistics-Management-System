import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";

import { AdminMenu } from "./components/Admin";
import { EntregaCupos } from "./components/EntregaCupos";
import { Recepcion } from "./components/Recepcion";
import { RegistrarCalidad } from "./components/RegistrarCalidad";
import { Pesaje } from "./components/Pesaje";
import { Reportes } from "./components/Reportes";
import { SilosYRechazos } from "./components/SilosYRechazos";
import { MenuDashboard } from "./components/MenuDashboard";
import { GestionFlota } from "./components/GestionFlota";
import { LandingPage } from "./components/LandingPage";
import { SettingsModal } from "./components/SettingsModal";

// Importamos la configuración i18n
import "./i18n";

type Seccion =
  | "LANDING"
  | "MENU"
  | "ADMIN"
  | "CUPOS"
  | "RECEPCION"
  | "CALIDAD"
  | "PESAJE"
  | "REPORTES"
  | "SILOS_RECHAZOS"
  | "FLOTA";

const App = () => {
  const [vista, setVista] = useState<Seccion>(() => {
    const hash = window.location.hash
      .replace("#", "")
      .split("/")[0]
      .toUpperCase();
    const seccionesValidas = [
      "MENU",
      "ADMIN",
      "CUPOS",
      "RECEPCION",
      "CALIDAD",
      "PESAJE",
      "REPORTES",
      "SILOS_RECHAZOS",
      "FLOTA",
    ];
    return seccionesValidas.includes(hash) ? (hash as Seccion) : "LANDING";
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("theme") || "dark";
    return "dark";
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Manejo de historial del navegador
  useEffect(() => {
    const hashActual = window.location.hash
      .replace("#", "")
      .split("/")[0]
      .toUpperCase();
    if (hashActual !== vista && vista !== "LANDING") {
      window.history.pushState(null, "", `#${vista}`);
    }
  }, [vista]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash
        .replace("#", "")
        .split("/")[0]
        .toUpperCase();
      if (!hash) setVista("LANDING");
      else setVista((prev) => (prev !== hash ? (hash as Seccion) : prev));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const renderContenido = () => {
    switch (vista) {
      case "LANDING":
        return <LandingPage onIngresar={() => setVista("MENU")} />;
      case "MENU":
        // YA NO NECESITA PROPS DE IDIOMA
        return (
          <MenuDashboard
            alSeleccionar={(s) => setVista(s as Seccion)}
            onLogout={() => setVista("LANDING")}
          />
        );
      case "ADMIN":
        return <AdminMenu onVolver={() => setVista("MENU")} />;
      case "CUPOS":
        return <EntregaCupos onVolver={() => setVista("MENU")} />;
      case "RECEPCION":
        return <Recepcion onVolver={() => setVista("MENU")} />;
      case "CALIDAD":
        return <RegistrarCalidad onVolver={() => setVista("MENU")} />;
      case "PESAJE":
        return <Pesaje onVolver={() => setVista("MENU")} />;
      case "REPORTES":
        return <Reportes onVolver={() => setVista("MENU")} />;
      case "SILOS_RECHAZOS":
        return <SilosYRechazos onVolver={() => setVista("MENU")} />;
      case "FLOTA":
        return <GestionFlota onVolver={() => setVista("MENU")} />;
      default:
        return (
          <MenuDashboard
            alSeleccionar={(s) => setVista(s as Seccion)}
            onLogout={() => setVista("LANDING")}
          />
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 font-mono">
      <Toaster
        position="top-center"
        richColors
        theme={theme === "dark" ? "dark" : "light"}
        toastOptions={{
          className:
            "font-mono uppercase text-xs md:text-sm font-bold tracking-wide",
        }}
      />

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 z-[2000] p-3 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-800 rounded-full shadow-lg transition-all hover:rotate-90 hover:scale-110"
        title="Configuración"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {renderContenido()}
    </div>
  );
};

export default App;
