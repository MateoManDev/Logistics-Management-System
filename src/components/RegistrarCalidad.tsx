import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";
import { useTranslation, Trans } from "react-i18next";

// --- LIBRERÍAS DE VALIDACIÓN ---
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- INTERFACES ---
interface Operacion {
  patente: string;
  codprod: string;
  fechacup: string;
  estado: "P" | "A" | "C" | "B" | "F" | "R";
  bruto: number;
  tara: number;
}

interface RubroXProducto {
  codigorub: string;
  codigoprod: string;
  valmin: number;
  valmax: number;
}

interface Rubro {
  codigo: string;
  nombre: string;
}

export const RegistrarCalidad = ({ onVolver }: { onVolver: () => void }) => {
  const { t } = useTranslation();

  const [operaciones, setOperaciones] = useLocalStorage<Operacion[]>(
    "operaciones_dat",
    [],
  );
  const [rxp] = useLocalStorage<RubroXProducto[]>("rubrosXproducto_dat", []);
  const [rubrosBase] = useLocalStorage<Rubro[]>("rubros_dat", []);

  const [operacionActiva, setOperacionActiva] = useState<Operacion | null>(
    null,
  );
  const [showManual, setShowManual] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  const camionesEsperandoCalidad = operaciones.filter(
    (op) => op.fechacup === hoy && op.estado === "A",
  );

  // --- ESQUEMA DINÁMICO ---
  const calidadSchema = z.record(
    z.string(),
    z.string().min(1, t("calidad.form.required")).pipe(z.coerce.number()),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(calidadSchema),
    defaultValues: {},
  });

  const seleccionarCamion = (op: Operacion) => {
    setOperacionActiva(op);
    reset(); // Limpia valores anteriores
  };

  const onCalidadSubmit: SubmitHandler<Record<string, number>> = (data) => {
    if (!operacionActiva) return;

    const rubrosDelProd = rxp.filter(
      (r) => r.codigoprod === operacionActiva.codprod,
    );

    // 1. Verificar si aprueba o rechaza
    let contRubCorr = 0;
    rubrosDelProd.forEach((r) => {
      const valor = data[r.codigorub];
      if (valor >= r.valmin && valor <= r.valmax) {
        contRubCorr++;
      }
    });

    const esAceptado =
      contRubCorr === rubrosDelProd.length ||
      (rubrosDelProd.length > 1 && contRubCorr === rubrosDelProd.length - 1);

    const nuevoEstado = esAceptado ? "C" : "R";

    // 2. Actualizar Operaciones
    const nuevasOperaciones = operaciones.map((op) =>
      op.patente === operacionActiva.patente && op.fechacup === hoy
        ? { ...op, estado: nuevoEstado as any }
        : op,
    );

    setOperaciones(nuevasOperaciones);

    // 3. Notificar
    if (esAceptado) {
      toast.success(
        `${t("calidad.toast.approved")}: ${operacionActiva.patente}`,
        {
          description: t("calidad.toast.approvedDesc"),
        },
      );
    } else {
      toast.error(
        `${t("calidad.toast.rejected")}: ${operacionActiva.patente}`,
        {
          description: t("calidad.toast.rejectedDesc"),
        },
      );
    }

    setOperacionActiva(null);
    reset();
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black font-mono transition-colors duration-300">
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-black p-4 transition-all duration-300">
        <div className="border-2 border-violet-600 dark:border-violet-600 p-8 bg-white dark:bg-[#0a0a0a] shadow-xl w-full max-w-md transition-colors duration-300">
          <h2 className="text-center mb-8 text-xl font-bold tracking-[0.2em] text-violet-600 dark:text-violet-500 border-b-2 border-violet-600 dark:border-violet-900 pb-4 uppercase italic">
            {t("calidad.title")}
          </h2>

          {!operacionActiva ? (
            // --- LISTA DE ESPERA ---
            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-violet-700 dark:text-violet-500 uppercase tracking-widest font-bold">
                {t("calidad.waitingLabel")}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {camionesEsperandoCalidad.length > 0 ? (
                  camionesEsperandoCalidad.map((op) => (
                    <button
                      key={op.patente}
                      onClick={() => seleccionarCamion(op)}
                      className="flex justify-between items-center p-3 border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black hover:border-violet-500 transition-all group text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-bold">
                          {op.patente}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase">
                          {op.codprod}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-violet-600 dark:text-violet-500 border border-violet-200 dark:border-violet-900 px-2 py-1 uppercase group-hover:bg-violet-500 group-hover:text-white transition-colors">
                        {t("calidad.btnAnalyze")}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-800 text-gray-500 text-xs italic">
                    {t("calidad.empty")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // --- FORMULARIO DE CALIDAD ---
            <div className="flex flex-col gap-5 animate-in slide-in-from-bottom duration-300">
              <div className="text-gray-900 dark:text-white text-[10px] border-b border-gray-300 dark:border-gray-800 pb-2 flex justify-between uppercase font-bold">
                <span>
                  {t("calidad.form.unit")}: {operacionActiva.patente}
                </span>
                <span className="text-violet-600 dark:text-violet-500">
                  {t("calidad.form.prod")}: {operacionActiva.codprod}
                </span>
              </div>

              <form onSubmit={handleSubmit(onCalidadSubmit)}>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-4">
                  {rxp
                    .filter((r) => r.codigoprod === operacionActiva.codprod)
                    .map((r, index) => {
                      const infoRubro = rubrosBase.find(
                        (rb) => rb.codigo === r.codigorub,
                      );
                      const nombreRubro = infoRubro
                        ? infoRubro.nombre
                        : r.codigorub;
                      const errorCampo = errors[r.codigorub];

                      return (
                        <div key={r.codigorub} className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500 uppercase flex justify-between">
                            <span>{nombreRubro}</span>
                            <span className="italic text-violet-600 dark:text-violet-500">
                              {t("calidad.form.range")}: {r.valmin}-{r.valmax}
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={`bg-gray-50 dark:bg-black border p-2 text-gray-900 dark:text-white focus:border-violet-500 outline-none text-center ${errorCampo ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                            placeholder="-"
                            autoComplete="off"
                            {...register(r.codigorub)}
                            autoFocus={index === 0}
                          />
                          {errorCampo && (
                            <span className="text-[9px] text-red-500 text-right font-bold">
                              {t("calidad.form.required")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="bg-transparent border border-violet-600 text-violet-600 dark:text-violet-500 py-3 hover:bg-violet-600 hover:text-white dark:hover:text-black transition-all font-bold uppercase text-sm"
                  >
                    {t("calidad.buttons.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperacionActiva(null)}
                    className="text-gray-500 text-[10px] hover:text-black dark:hover:text-white uppercase text-center italic"
                  >
                    {t("calidad.buttons.cancel")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MANUAL DE AYUDA CON TRADUCCIÓN RICA (HTML) */}
          <div className="mt-6 border border-gray-300 dark:border-gray-800 rounded-sm overflow-hidden font-mono">
            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full bg-gray-200 dark:bg-gray-800/50 p-2 text-[10px] text-violet-700 dark:text-violet-500 flex justify-between items-center hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors uppercase font-bold italic"
            >
              <span>
                {showManual ? "▼" : "▶"} {t("calidad.manual.btn")}
              </span>
            </button>
            {showManual && (
              <div className="p-3 bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-gray-800 text-[9px] text-gray-600 dark:text-gray-400 space-y-3">
                <p>
                  <Trans
                    i18nKey="calidad.manual.p1"
                    components={{ b: <b /> }}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="calidad.manual.p2"
                    components={{
                      b1: <b className="text-gray-900 dark:text-white" />,
                      b2: <b className="text-red-600 dark:text-red-500" />,
                    }}
                  />
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onVolver}
            className="w-full text-red-600 dark:text-red-700 text-[10px] font-bold border-t border-gray-300 dark:border-gray-800 pt-4 text-center mt-6 uppercase hover:text-red-500 transition-all"
          >
            {t("calidad.buttons.back")}
          </button>
        </div>
      </div>
    </div>
  );
};
