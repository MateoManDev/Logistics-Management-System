import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// --- LIBRERÍAS DE VALIDACIÓN ---
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- INTERFACES DE DATOS ---
interface Operacion {
  patente: string;
  codprod: string;
  fechacup: string;
  estado: "P" | "A" | "C" | "B" | "F" | "R";
  bruto: number;
  tara: number;
}

interface Silo {
  codsil: string;
  nombre: string;
  codprod: string;
  stock: number;
  capacidad: number;
}

interface Producto {
  codigo: string;
  nombre: string;
}

type PesajeForm = {
  peso: number;
};

// Interfaz Modal
interface ModalState {
  isOpen: boolean;
  type: "CONFIRM" | "WARNING";
  title: string;
  message: string;
  detalles?: string[];
  onConfirm?: () => void;
}

export const Pesaje = ({ onVolver }: { onVolver: () => void }) => {
  const { t } = useTranslation();

  // DATA
  const [operaciones, setOperaciones] = useLocalStorage<Operacion[]>(
    "operaciones_dat",
    [],
  );
  const [silos, setSilos] = useLocalStorage<Silo[]>("silos_dat", []);
  const [productos] = useLocalStorage<Producto[]>("productos_dat", []);

  // ESTADOS VISTA
  const [opActiva, setOpActiva] = useState<Operacion | null>(null);
  const [editandoBruto, setEditandoBruto] = useState(false);

  // --- ESQUEMA ZOD (DENTRO) ---
  const pesajeSchema = z.object({
    peso: z.coerce
      .number()
      .min(1, t("pesaje.errors.min"))
      .max(80000, t("pesaje.errors.max")),
  });

  // CONFIGURACIÓN FORMULARIO
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<PesajeForm>({
    resolver: zodResolver(pesajeSchema) as any,
    defaultValues: { peso: undefined as any },
  });

  // ESTADO MODAL
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "CONFIRM",
    title: "",
    message: "",
  });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (opActiva) {
      setFocus("peso");
      if (editandoBruto) {
        setValue("peso", opActiva.bruto);
      } else {
        setValue("peso", "" as any);
      }
    }
  }, [opActiva, editandoBruto, setFocus, setValue]);

  const obtenerNombreProducto = (codigo: string) => {
    const prod = productos.find((p) => p.codigo === codigo);
    return prod ? prod.nombre : `CÓD: ${codigo}`;
  };

  const camionesEnEspera = operaciones.filter(
    (op) => op.fechacup === hoy && (op.estado === "C" || op.estado === "B"),
  );

  // --- LÓGICA DE GUARDADO ---

  const aplicarGuardadoFinal = (
    nuevasOps: Operacion[],
    nuevosSilos: Silo[],
    neto: number,
  ) => {
    setOperaciones(nuevasOps);
    setSilos(nuevosSilos);
    toast.success(t("pesaje.success.finished"), {
      description: `${t("pesaje.success.netRegistered")} ${neto.toLocaleString()} KG.`,
    });
    resetVista();
  };

  const aplicarGuardadoBruto = (peso: number) => {
    if (!opActiva) return;
    const nuevasOperaciones = operaciones.map((op) =>
      op.patente === opActiva.patente &&
      op.fechacup === hoy &&
      op.estado === "C"
        ? { ...op, bruto: peso, estado: "B" as const }
        : op,
    );
    setOperaciones(nuevasOperaciones);
    toast.success(
      `${t("pesaje.success.grossRegistered")}: ${opActiva.patente}`,
    );
    closeModal();
    resetVista();
  };

  const aplicarCorreccionBruto = (peso: number) => {
    if (!opActiva) return;
    const nuevasOperaciones = operaciones.map((op) =>
      op.patente === opActiva.patente && op.fechacup === hoy
        ? { ...op, bruto: peso }
        : op,
    );
    setOperaciones(nuevasOperaciones);
    toast.success(t("pesaje.success.grossCorrected"));
    closeModal();
    resetVista();
  };

  const resetVista = () => {
    setOpActiva(null);
    setEditandoBruto(false);
    reset({ peso: undefined as any });
  };

  // --- HANDLER PRINCIPAL (ONSUBMIT) ---
  const onPesajeSubmit: SubmitHandler<PesajeForm> = (data) => {
    if (!opActiva) return;
    const pesoIngresado = data.peso;

    // 1. MODO EDICIÓN DE BRUTO
    if (editandoBruto) {
      if (pesoIngresado > 60000) {
        setModal({
          isOpen: true,
          type: "WARNING",
          title: t("pesaje.modals.security"),
          message: `${t("pesaje.modals.highValue")} (${pesoIngresado.toLocaleString()} KG)\n${t("pesaje.modals.confirmCorrection")}`,
          onConfirm: () => aplicarCorreccionBruto(pesoIngresado),
        });
      } else {
        aplicarCorreccionBruto(pesoIngresado);
      }
      return;
    }

    // 2. PESAR BRUTO (Entrada)
    if (opActiva.estado === "C") {
      if (pesoIngresado > 60000) {
        setModal({
          isOpen: true,
          type: "WARNING",
          title: t("pesaje.modals.excess"),
          message: `${t("pesaje.modals.unusualValue")} (${pesoIngresado.toLocaleString()} KG)\n${t("pesaje.modals.continue")}`,
          onConfirm: () => aplicarGuardadoBruto(pesoIngresado),
        });
      } else {
        aplicarGuardadoBruto(pesoIngresado);
      }
    }

    // 3. PESAR TARA (Salida)
    else if (opActiva.estado === "B") {
      if (pesoIngresado >= opActiva.bruto) {
        toast.error(t("pesaje.errors.tareGreater"), {
          description: t("pesaje.errors.tareDesc"),
        });
        return;
      }

      const netoTotal = opActiva.bruto - pesoIngresado;
      const silosDelProducto = silos.filter(
        (s) => s.codprod === opActiva.codprod,
      );
      const capacidadTotalDisponible = silosDelProducto.reduce(
        (acc, s) => acc + (s.capacidad - s.stock),
        0,
      );

      if (netoTotal > capacidadTotalDisponible) {
        toast.error(t("pesaje.errors.capacity"), {
          description: `${t("pesaje.errors.capacityDesc")} ${(netoTotal - capacidadTotalDisponible).toLocaleString()} KG.`,
          duration: 5000,
        });
        return;
      }

      // Distribución de carga en silos
      let restoPorCargar = netoTotal;
      let silosAfectados: string[] = [];

      const nuevosSilos = silos.map((silo) => {
        if (silo.codprod === opActiva.codprod && restoPorCargar > 0) {
          const espacioLibre = silo.capacidad - silo.stock;
          if (espacioLibre > 0) {
            const cargaEnEsteSilo = Math.min(espacioLibre, restoPorCargar);
            restoPorCargar -= cargaEnEsteSilo;
            silosAfectados.push(
              `${silo.nombre}: +${cargaEnEsteSilo.toLocaleString()} kg`,
            );
            return { ...silo, stock: silo.stock + cargaEnEsteSilo };
          }
        }
        return silo;
      });

      const nuevasOps = operaciones.map((op) =>
        op.patente === opActiva.patente &&
        op.fechacup === hoy &&
        op.estado === "B"
          ? { ...op, tara: pesoIngresado, estado: "F" as const }
          : op,
      );

      if (silosAfectados.length > 1) {
        setModal({
          isOpen: true,
          type: "CONFIRM",
          title: t("pesaje.modals.distribution"),
          message: t("pesaje.modals.distMessage"),
          detalles: silosAfectados,
          onConfirm: () => {
            aplicarGuardadoFinal(nuevasOps, nuevosSilos, netoTotal);
            closeModal();
          },
        });
      } else {
        aplicarGuardadoFinal(nuevasOps, nuevosSilos, netoTotal);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black font-mono transition-colors duration-300">
      <div
        className={`flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-black p-4 transition-all duration-300 ${modal.isOpen ? "opacity-60 blur-[2px] pointer-events-none scale-[0.99]" : "opacity-100 blur-0 scale-100"}`}
      >
        <div className="border-2 border-emerald-500 p-8 bg-white dark:bg-[#0a0a0a] shadow-xl dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] w-full max-w-md transition-colors duration-300">
          <h2 className="text-center mb-8 text-xl font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-500 border-b-2 border-emerald-600 dark:border-emerald-900 pb-4 uppercase italic">
            {t("pesaje.title")}
          </h2>

          {!opActiva ? (
            // --- SELECCIÓN DE CAMIÓN ---
            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-emerald-700 dark:text-emerald-700 uppercase font-bold tracking-widest text-center">
                {t("pesaje.selectLabel")}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {camionesEnEspera.map((op, idx) => (
                  <button
                    key={`${op.patente}-${idx}`}
                    onClick={() => {
                      setOpActiva(op);
                      setEditandoBruto(false);
                    }}
                    className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left group"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-bold text-lg">
                        {op.patente}
                      </span>
                      <span className="text-[9px] text-cyan-600 dark:text-cyan-600 uppercase font-bold italic">
                        {obtenerNombreProducto(op.codprod)}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold border-2 px-3 py-1 rounded-sm transition-colors ${op.estado === "C" ? "text-orange-600 border-orange-200 group-hover:bg-orange-500 group-hover:text-white" : "text-blue-600 border-blue-200 group-hover:bg-blue-500 group-hover:text-white"}`}
                    >
                      {op.estado === "C"
                        ? t("pesaje.status.gross")
                        : t("pesaje.status.tare")}
                    </span>
                  </button>
                ))}
                {camionesEnEspera.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-gray-300 text-gray-500 text-xs italic">
                    {t("pesaje.empty")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // --- FORMULARIO DE PESAJE ---
            <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-200">
              <div className="bg-gray-100 dark:bg-black p-4 border border-emerald-200 dark:border-emerald-900">
                <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-900 pb-2">
                  <span className="text-gray-900 dark:text-white font-bold text-xl">
                    {opActiva.patente}
                  </span>
                  <span className="text-cyan-600 text-[10px] font-bold uppercase italic">
                    {obtenerNombreProducto(opActiva.codprod)}
                  </span>
                </div>

                {opActiva.estado === "B" && !editandoBruto && (
                  <div className="mt-2 flex justify-between items-center bg-gray-200 dark:bg-gray-900 p-2 rounded">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      {t("pesaje.labels.gross")}: {opActiva.bruto} KG
                    </span>
                    <button
                      onClick={() => setEditandoBruto(true)}
                      className="text-[9px] text-blue-600 underline font-bold hover:text-blue-800"
                    >
                      {t("pesaje.buttons.correct")}
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-emerald-700 font-bold uppercase mt-2 italic tracking-tighter">
                  {t("pesaje.labels.action")}{" "}
                  {editandoBruto
                    ? t("pesaje.actions.correcting")
                    : opActiva.estado === "C"
                      ? t("pesaje.actions.entry")
                      : t("pesaje.actions.exit")}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onPesajeSubmit)}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2 text-center">
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    {editandoBruto
                      ? t("pesaje.labels.newGross")
                      : t("pesaje.labels.screenWeight")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register("peso")}
                      className={`w-full bg-white dark:bg-black border-2 p-4 text-4xl text-center outline-none ${editandoBruto ? "border-blue-500 text-blue-600" : "border-gray-300 dark:border-gray-700 text-emerald-600 dark:text-emerald-400 focus:border-emerald-500"}`}
                      placeholder="0"
                      autoComplete="off"
                    />
                    {errors.peso && (
                      <span className="absolute -bottom-5 left-0 w-full text-center text-[10px] text-red-500 font-bold animate-pulse">
                        * {errors.peso.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {editandoBruto ? (
                    <>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white dark:text-black py-4 font-bold uppercase hover:bg-blue-500 transition-all shadow-md"
                      >
                        {t("pesaje.buttons.saveCorrection")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoBruto(false)}
                        className="text-gray-500 text-[10px] uppercase hover:text-black dark:hover:text-white"
                      >
                        {t("pesaje.buttons.cancelEdit")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white dark:text-black py-4 font-bold uppercase hover:bg-emerald-500 transition-all shadow-md"
                      >
                        {opActiva.estado === "C"
                          ? t("pesaje.buttons.confirmGross")
                          : t("pesaje.buttons.confirmTare")}
                      </button>
                      <button
                        type="button"
                        onClick={resetVista}
                        className="text-gray-500 text-[10px] uppercase hover:text-black dark:hover:text-white italic"
                      >
                        {t("pesaje.buttons.backList")}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}

          <button
            onClick={onVolver}
            className="w-full text-red-600 dark:text-red-700 text-[10px] font-bold border-t border-gray-300 dark:border-gray-800 pt-4 text-center mt-6 uppercase hover:text-red-500 transition-all"
          >
            {t("pesaje.buttons.backMenu")}
          </button>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-sm pointer-events-auto transition-all duration-300">
          <div
            className={`w-full max-w-sm border-2 p-6 bg-white dark:bg-[#0a0a0a] shadow-2xl animate-in zoom-in duration-200 ${modal.type === "WARNING" ? "border-red-600 shadow-red-500/40" : "border-yellow-500 shadow-yellow-500/40"}`}
          >
            <h4
              className={`text-center font-bold mb-4 tracking-widest uppercase text-[10px] ${modal.type === "WARNING" ? "text-red-600" : "text-yellow-600"}`}
            >
              {modal.title || t("common.confirm")}
            </h4>
            <p className="text-gray-900 dark:text-white text-center text-[11px] mb-6 font-mono uppercase italic leading-tight whitespace-pre-line">
              {modal.message}
            </p>
            {modal.detalles && (
              <div className="mb-6 bg-gray-100 dark:bg-black/50 border border-gray-300 dark:border-gray-800 p-2">
                {modal.detalles.map((d, i) => (
                  <p
                    key={i}
                    className="text-gray-600 dark:text-gray-400 text-[10px] font-mono border-b border-gray-300 dark:border-gray-800 last:border-0 pb-1 mb-1 last:mb-0"
                  >
                    • {d}
                  </p>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-500 py-3 text-[10px] uppercase font-bold hover:text-black dark:hover:text-white transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={modal.onConfirm}
                className={`flex-1 py-3 text-[10px] font-bold uppercase transition-all ${modal.type === "WARNING" ? "bg-red-600 text-white dark:text-black hover:bg-red-700" : "bg-yellow-500 text-white dark:text-black hover:bg-yellow-600"}`}
              >
                {t("common.accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
