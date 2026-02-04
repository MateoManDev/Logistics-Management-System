import React, { useState } from "react";
import { AdminMenu } from "./components/Admin";
import { EntregaCupos } from "./components/EntregaCupos";
import { Recepcion } from "./components/Recepcion";
import { RegistrarCalidad } from "./components/RegistrarCalidad";
import { Pesaje } from "./components/Pesaje";
import { Reportes } from "./components/Reportes";
import { SilosYRechazos } from "./components/SilosYRechazos";
// IMPORTAMOS EL NUEVO DASHBOARD
import { MenuDashboard } from "./components/MenuDashboard";

type Seccion =
  | "MENU"
  | "ADMIN"
  | "CUPOS"
  | "RECEPCION"
  | "CALIDAD"
  | "PESAJE"
  | "REPORTES"
  | "SILOS_RECHAZOS";

const App = () => {
  const [vista, setVista] = useState<Seccion>("MENU");

  const renderContenido = () => {
    switch (vista) {
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
      default:
        // AQUI USAMOS EL NUEVO COMPONENTE
        return <MenuDashboard alSeleccionar={(s) => setVista(s as Seccion)} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black">{renderContenido()}</div>
  );
};

export default App;
