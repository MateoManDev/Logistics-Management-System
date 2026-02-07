import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

// --- INTERFACES ---
interface Operacion {
  patente: string;
  codprod: string;
  fechacup: string;
  estado: "P" | "A" | "C" | "B" | "F" | "R";
  bruto: number;
  tara: number;
}

interface Producto {
  codigo: string;
  nombre: string;
}

export const Reportes = ({ onVolver }: { onVolver: () => void }) => {
  const { t } = useTranslation();
  const [operaciones] = useLocalStorage<Operacion[]>("operaciones_dat", []);
  const [productos] = useLocalStorage<Producto[]>("productos_dat", []);
  const [filtroPeriodo, setFiltroPeriodo] = useState("HOY");

  const hoy = new Date().toISOString().split("T")[0];

  const opsFiltradas =
    filtroPeriodo === "TODO"
      ? operaciones
      : operaciones.filter((op) => op.fechacup === hoy);

  // --- LÓGICA DE INDICADORES ---
  const cantCupos = opsFiltradas.length;

  // Recibidos: Que NO estén pendientes y que NO hayan sido rechazados
  const cantRecibidos = opsFiltradas.filter(
    (op) => !["P", "R"].includes(op.estado),
  ).length;

  // Rechazados: Únicamente estado R
  const cantRechazados = opsFiltradas.filter((op) => op.estado === "R").length;

  // Eficiencia: Éxito (Recibidos) sobre el Total de Cupos
  const cumplimiento =
    cantCupos > 0 ? ((cantRecibidos / cantCupos) * 100).toFixed(0) : 0;

  const estadisticasPorProducto = productos.map((prod) => {
    const opsDelProd = opsFiltradas.filter((op) => op.codprod === prod.codigo);
    const opsFinalizadas = opsDelProd.filter((op) => op.estado === "F");
    const opsRechazadas = opsDelProd.filter((op) => op.estado === "R");

    const pesoNetoTotal = opsFinalizadas.reduce(
      (acc, op) => acc + (op.bruto - op.tara),
      0,
    );

    const promedioNeto =
      opsFinalizadas.length > 0
        ? (pesoNetoTotal / opsFinalizadas.length).toFixed(0)
        : 0;

    return {
      nombre: prod.nombre,
      cantidad: opsDelProd.length,
      rechazados: opsRechazadas.length,
      neto: pesoNetoTotal,
      promedio: promedioNeto,
    };
  });

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-black p-4 font-mono transition-colors duration-300">
      <div className="border-2 border-red-600 dark:border-red-700 p-8 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(185,28,28,0.2)] w-full max-w-2xl transition-colors duration-300">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-red-200 dark:border-red-900 pb-4">
          <h2 className="text-xl font-bold tracking-[0.2em] text-red-600 dark:text-red-500 uppercase italic">
            {t("reportes.title")}
          </h2>

          <div className="flex flex-col items-end">
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="bg-gray-50 dark:bg-black border border-red-300 dark:border-red-900 text-red-700 dark:text-red-500 text-[10px] px-2 py-1 outline-none uppercase cursor-pointer"
            >
              <option value="HOY">{t("reportes.filters.today")}</option>
              <option value="TODO">{t("reportes.filters.all")}</option>
            </select>
          </div>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 dark:bg-black/60 p-4 border border-red-200 dark:border-red-900/40 text-center shadow-sm dark:shadow-inner">
            <p className="text-[10px] text-red-800 dark:text-red-700 uppercase font-bold mb-1">
              {t("reportes.stats.efficiency")}
            </p>
            <p className="text-3xl text-gray-900 dark:text-white font-bold">
              {cumplimiento}%
            </p>
            <p className="text-[8px] text-gray-500 dark:text-gray-600 mt-1 uppercase italic">
              {t("reportes.stats.efficiencyDesc")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-black/60 p-4 border border-red-200 dark:border-red-900/40 text-center shadow-sm dark:shadow-inner">
            <p className="text-[10px] text-red-800 dark:text-red-700 uppercase font-bold mb-1">
              {t("reportes.stats.accepted")}
            </p>
            <p className="text-3xl text-green-600 dark:text-green-500 font-bold">
              {cantRecibidos}
            </p>
            <p className="text-[8px] text-gray-500 dark:text-gray-600 mt-1 uppercase italic">
              {t("reportes.stats.acceptedDesc")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-black/60 p-4 border border-red-200 dark:border-red-900/40 text-center shadow-sm dark:shadow-inner">
            <p className="text-[10px] text-red-800 dark:text-red-700 uppercase font-bold mb-1">
              {t("reportes.stats.rejected")}
            </p>
            <p className="text-3xl text-red-600 dark:text-red-500 font-bold">
              {cantRechazados}
            </p>
            <p className="text-[8px] text-gray-500 dark:text-gray-600 mt-1 uppercase italic">
              {t("reportes.stats.rejectedDesc")}
            </p>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {estadisticasPorProducto.map((prod) => (
            <div
              key={prod.nombre}
              className="border border-red-200 dark:border-red-900/30 p-4 bg-gray-50 dark:bg-black/30 hover:border-red-500 dark:hover:border-red-600 transition-all"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-red-700 dark:text-red-500 font-bold text-sm tracking-widest uppercase">
                  {prod.nombre}
                </h3>
                <span className="text-[9px] text-gray-500 dark:text-gray-600 font-bold uppercase italic">
                  {t("reportes.list.totalTickets")} {prod.cantidad}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-red-200 dark:border-red-900/20 pt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 uppercase">
                    {t("reportes.list.kgIn")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold text-xs">
                    {prod.neto.toLocaleString()} KG
                  </span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-[8px] text-gray-500 uppercase">
                    {t("reportes.list.avgNet")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold text-xs">
                    {prod.promedio.toLocaleString()} KG
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] text-gray-500 uppercase">
                    {t("reportes.list.rejected")}
                  </span>
                  <span
                    className={`font-bold text-xs ${prod.rechazados > 0 ? "text-red-600 dark:text-red-500" : "text-gray-400 dark:text-gray-800"}`}
                  >
                    {prod.rechazados}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onVolver}
          className="w-full mt-8 bg-transparent text-red-700 dark:text-red-600 font-bold py-3 hover:bg-red-600 hover:text-white dark:hover:text-black transition-all uppercase tracking-widest border border-red-600 dark:border-red-600 text-sm"
        >
          {t("reportes.buttons.exit")}
        </button>
      </div>
    </div>
  );
};
