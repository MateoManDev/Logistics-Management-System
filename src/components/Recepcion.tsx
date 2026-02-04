import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

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

// Interfaz para el estado del Modal
interface ModalState {
  isOpen: boolean;
  type: "INFO" | "ERROR" | "CONFIRM";
  message: string;
  onConfirm?: () => void;
}

export const Recepcion = ({ onVolver }: { onVolver: () => void }) => {
  const [operaciones, setOperaciones] = useLocalStorage<Operacion[]>(
    "operaciones_dat",
    [],
  );
  // Traemos los productos para obtener los nombres
  const [productos] = useLocalStorage<Producto[]>("productos_dat", []);

  // --- ESTADO DEL MODAL ---
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "INFO",
    message: "",
  });

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const hoy = new Date().toISOString().split("T")[0];

  // Filtramos solo los pendientes de hoy
  const cuposPendientesHoy = operaciones.filter(
    (op) => op.fechacup === hoy && op.estado === "P",
  );

  // Función para obtener el nombre del producto según el código
  const obtenerNombreProducto = (codigo: string) => {
    const prod = productos.find((p) => p.codigo === codigo);
    return prod ? prod.nombre : `CÓDIGO: ${codigo}`;
  };

  const registrarArribo = (opSeleccionada: Operacion) => {
    // 1. Abrir Modal de Confirmación
    setModal({
      isOpen: true,
      type: "CONFIRM",
      message: `¿Confirmar arribo de la patente ${opSeleccionada.patente}?`,
      onConfirm: () => {
        // 2. Lógica de guardado al confirmar
        const nuevasOperaciones = operaciones.map((op) =>
          op.patente === opSeleccionada.patente &&
          op.fechacup === hoy &&
          op.estado === "P"
            ? { ...op, estado: "A" as const }
            : op,
        );

        setOperaciones(nuevasOperaciones);

        // 3. Modal de Éxito (sobrescribe el anterior)
        setModal({
          isOpen: true,
          type: "INFO",
          message: `✅ Camión ${opSeleccionada.patente} ingresado a planta.`,
        });
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black font-mono transition-colors duration-300">
      {/* CAPA DE FONDO: LISTA DE RECEPCIÓN */}
      <div
        className={`flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-black p-4 transition-all duration-300 ${modal.isOpen ? "opacity-60 blur-[2px] pointer-events-none scale-[0.99]" : "opacity-100 blur-0 scale-100"}`}
      >
        {/* CORRECCIÓN: dark:bg-[#0a0a0a] */}
        <div className="border-2 border-yellow-500 dark:border-yellow-500 p-8 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(234,179,8,0.2)] w-full max-w-md transition-colors duration-300">
          <h2 className="text-center mb-8 text-xl font-bold tracking-[0.2em] text-yellow-600 dark:text-yellow-500 border-b-2 border-yellow-600 dark:border-yellow-900 pb-4 uppercase italic">
            [ Recepción de Unidades ]
          </h2>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] text-yellow-700 dark:text-yellow-700 uppercase tracking-widest font-bold">
              Seleccione unidad para ingreso:
            </label>

            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {cuposPendientesHoy.length > 0 ? (
                cuposPendientesHoy.map((op, idx) => (
                  <button
                    key={`${op.patente}-${idx}`}
                    onClick={() => registrarArribo(op)}
                    className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black hover:border-yellow-500 dark:hover:border-yellow-500 transition-all group text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-bold text-lg tracking-wider">
                        {op.patente}
                      </span>
                      {/* Ahora muestra el Nombre en lugar del Código */}
                      <span className="text-[9px] text-cyan-700 dark:text-cyan-600 uppercase font-bold italic">
                        {obtenerNombreProducto(op.codprod)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-yellow-700 dark:text-yellow-600 border border-yellow-200 dark:border-yellow-900 px-2 py-1 uppercase group-hover:bg-yellow-500 group-hover:text-black dark:group-hover:bg-yellow-600 dark:group-hover:text-black transition-colors">
                        INGRESAR
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-700 text-xs">
                  NO HAY CUPOS PENDIENTES
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onVolver}
            className="w-full text-red-600 dark:text-red-700 text-[10px] font-bold border-t border-gray-300 dark:border-gray-800 pt-4 text-center mt-6 uppercase hover:text-red-500 transition-all"
          >
            &lt;&lt; Volver al Menú Principal
          </button>
        </div>
      </div>

      {/* CAPA DE MODAL (SUPERPUESTO) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto transition-all duration-300">
          {/* CORRECCIÓN: dark:bg-[#0a0a0a] */}
          <div
            className={`w-full max-w-sm border-2 p-6 bg-white dark:bg-[#0a0a0a] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in duration-200 ${
              modal.type === "ERROR"
                ? "border-red-600 shadow-red-500/40 dark:shadow-red-900/40"
                : modal.type === "CONFIRM"
                  ? "border-yellow-500 dark:border-yellow-600 shadow-yellow-500/40 dark:shadow-yellow-900/40"
                  : "border-emerald-600 shadow-emerald-500/40 dark:shadow-emerald-900/40"
            }`}
          >
            <h4
              className={`text-center font-bold mb-4 tracking-widest uppercase text-[10px] ${
                modal.type === "ERROR"
                  ? "text-red-600 dark:text-red-500"
                  : modal.type === "CONFIRM"
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-emerald-600 dark:text-emerald-500"
              }`}
            >
              {modal.type === "ERROR"
                ? "[ ! ] ALERTA"
                : modal.type === "CONFIRM"
                  ? "[ ? ] CONFIRMAR"
                  : "[ i ] SISTEMA"}
            </h4>

            <p className="text-gray-900 dark:text-white text-center text-[11px] mb-6 font-mono uppercase italic leading-tight">
              {modal.message}
            </p>

            <div className="flex gap-2">
              {modal.type === "CONFIRM" && (
                <button
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-500 py-3 text-[10px] uppercase font-bold hover:bg-gray-100 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              )}

              <button
                onClick={modal.onConfirm || closeModal}
                className={`flex-1 py-3 text-[10px] font-bold uppercase transition-all ${
                  modal.type === "ERROR"
                    ? "bg-red-100 dark:bg-red-900/40 border border-red-500 dark:border-red-600 text-red-700 dark:text-red-500"
                    : "bg-yellow-500 text-white dark:text-black hover:bg-yellow-600 dark:hover:bg-yellow-500"
                      ? "bg-yellow-500 text-white dark:text-black hover:bg-yellow-600 dark:hover:bg-yellow-500"
                      : "bg-emerald-600 text-white dark:text-black hover:bg-emerald-500 dark:hover:bg-emerald-400"
                }`}
              >
                ACEPTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
