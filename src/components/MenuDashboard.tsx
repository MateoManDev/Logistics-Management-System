import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// --- INTERFACES ---
interface Operacion {
  estado: "P" | "A" | "C" | "B" | "F" | "R";
  fechacup: string;
}
interface Silo {
  nombre: string;
  stock: number;
  capacidad: number;
}

interface DashboardProps {
  alSeleccionar: (vista: string) => void;
}

export const MenuDashboard = ({ alSeleccionar }: DashboardProps) => {
  const [operaciones] = useLocalStorage<Operacion[]>("operaciones_dat", []);
  const [silos] = useLocalStorage<Silo[]>("silos_dat", []);

  const hoy = new Date().toISOString().split("T")[0];

  // --- MÉTRICAS ---
  const cuposHoy = operaciones.filter((op) => op.fechacup === hoy).length;
  const enPuerta = operaciones.filter(
    (op) => op.fechacup === hoy && op.estado === "P",
  ).length;
  const paraCalidad = operaciones.filter(
    (op) => op.fechacup === hoy && op.estado === "A",
  ).length;
  const paraBalanza = operaciones.filter(
    (op) => op.fechacup === hoy && (op.estado === "C" || op.estado === "B"),
  ).length;

  const silosCriticos = silos.filter(
    (s) => s.capacidad > 0 && s.stock / s.capacidad > 0.9,
  ).length;

  // Clase base común para las tarjetas
  const cardBaseClass =
    "group relative p-6 border bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-all duration-300 text-left shadow-sm dark:shadow-lg";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black p-8 font-mono flex flex-col items-center justify-center transition-colors duration-300">
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-8 border-b-2 border-gray-300 dark:border-white/20 pb-4 flex justify-between items-end animate-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-500">
            Sistema Logístico
          </h1>
          <p className="text-cyan-600 dark:text-cyan-500 text-xs md:text-sm mt-1 tracking-widest font-bold">
            CENTRO DE COMANDO V3.0
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-500 text-[10px] uppercase font-bold">
            Fecha Operativa
          </p>
          <p className="text-gray-900 dark:text-white font-bold text-lg">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* GRID DE BOTONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
        {/* 1. ADMINISTRACIÓN (Cyan) */}
        <button
          onClick={() => alSeleccionar("ADMIN")}
          className={`${cardBaseClass} hover:border-cyan-600 dark:hover:border-cyan-500 hover:shadow-cyan-500/20`}
        >
          <h3 className="text-cyan-600 dark:text-cyan-500 font-bold text-lg mb-1 group-hover:translate-x-1 transition-transform tracking-wider">
            ADMINISTRACIÓN
          </h3>
          <p className="text-gray-500 text-[10px] uppercase">
            Configuración General
          </p>
        </button>

        {/* 2. CUPOS (Gris/Blanco) */}
        <button
          onClick={() => alSeleccionar("CUPOS")}
          className={`${cardBaseClass} hover:border-gray-900 dark:hover:border-white`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-gray-900 dark:text-white font-bold text-lg group-hover:translate-x-1 transition-transform tracking-wider">
              CUPOS
            </h3>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-sm">
              TOTAL HOY: {cuposHoy}
            </span>
          </div>
          <p className="text-gray-500 text-[10px] uppercase">
            Asignación de turnos
          </p>
        </button>

        {/* 3. RECEPCIÓN (Amarillo) */}
        <button
          onClick={() => alSeleccionar("RECEPCION")}
          className={`${cardBaseClass} hover:border-yellow-600 dark:hover:border-yellow-500 hover:shadow-yellow-500/20`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-yellow-600 dark:text-yellow-500 font-bold text-lg group-hover:translate-x-1 transition-transform tracking-wider">
              RECEPCIÓN
            </h3>
            {enPuerta > 0 ? (
              <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500 border border-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse">
                EN PUERTA: {enPuerta}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-600 text-[10px] font-bold">
                SIN PENDIENTES
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[10px] uppercase">
            Ingreso de Unidades
          </p>
        </button>

        {/* 4. CALIDAD (Violeta) */}
        <button
          onClick={() => alSeleccionar("CALIDAD")}
          className={`${cardBaseClass} hover:border-violet-600 dark:hover:border-violet-500 hover:shadow-violet-500/20`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-violet-600 dark:text-violet-500 font-bold text-lg group-hover:translate-x-1 transition-transform tracking-wider">
              CALIDAD
            </h3>
            {paraCalidad > 0 && (
              <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 border border-violet-500 text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse">
                A CALAR: {paraCalidad}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[10px] uppercase">
            Laboratorio y Análisis
          </p>
        </button>

        {/* 5. BALANZA (Esmeralda) */}
        <button
          onClick={() => alSeleccionar("PESAJE")}
          className={`${cardBaseClass} hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-emerald-500/20`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-lg group-hover:translate-x-1 transition-transform tracking-wider">
              BALANZA
            </h3>
            {paraBalanza > 0 && (
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-500 border border-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse">
                EN COLA: {paraBalanza}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[10px] uppercase">Control de Peso</p>
        </button>

        {/* 6. MONITOR Y REPORTES */}
        <div className="grid grid-rows-2 gap-4">
          <button
            onClick={() => alSeleccionar("SILOS_RECHAZOS")}
            className={`group px-6 py-3 border bg-white dark:bg-[#0a0a0a] transition-all duration-300 text-left flex justify-between items-center shadow-sm dark:shadow-lg hover:bg-gray-50 dark:hover:bg-[#111] ${
              silosCriticos > 0
                ? "border-red-600 animate-pulse bg-red-100 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-800 hover:border-orange-600 dark:hover:border-orange-500 hover:shadow-orange-500/20"
            }`}
          >
            <div>
              <h3 className="text-orange-600 dark:text-orange-500 font-bold text-sm tracking-wider group-hover:translate-x-1 transition-transform">
                MONITOR SILOS
              </h3>
              {silosCriticos > 0 ? (
                <span className="text-[9px] text-red-600 dark:text-red-500 font-bold uppercase">
                  ⚠ {silosCriticos} SILO(S) CRÍTICO(S)
                </span>
              ) : (
                <span className="text-[9px] text-gray-500 uppercase font-bold">
                  ESTADO NORMAL
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => alSeleccionar("REPORTES")}
            className="group px-6 py-3 border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] hover:border-red-600 dark:hover:border-red-500 hover:shadow-red-500/20 transition-all duration-300 text-left flex justify-between items-center shadow-sm dark:shadow-lg"
          >
            <div>
              <h3 className="text-red-600 dark:text-red-500 font-bold text-sm tracking-wider group-hover:translate-x-1 transition-transform">
                REPORTES
              </h3>
              <span className="text-[9px] text-gray-500 uppercase">
                Estadísticas y KPI
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 w-full max-w-5xl flex justify-between items-center border-t border-gray-300 dark:border-gray-800 pt-6">
        <div className="text-[10px] text-gray-600">
          SISTEMA OPERATIVO V3.0 •{" "}
          <span className="text-emerald-600 dark:text-emerald-500 font-bold">
            ONLINE
          </span>
        </div>
        <button
          onClick={() =>
            window.confirm("¿Cerrar sesión del sistema?") && window.close()
          }
          className="text-[10px] font-bold text-red-700 dark:text-red-900 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          [ CERRAR SESIÓN ]
        </button>
      </div>
    </div>
  );
};
