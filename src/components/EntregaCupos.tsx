import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// --- LIBRERÍAS DE VALIDACIÓN ---
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { es, enUS } from "date-fns/locale";

registerLocale("es", es);
registerLocale("en", enUS);

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
  estado: "A" | "B";
}

type CupoForm = {
  patente: string;
  codProd: string;
  fecha: Date | null;
};

export const EntregaCupos = ({ onVolver }: { onVolver: () => void }) => {
  const { t, i18n } = useTranslation();
  const [productos] = useLocalStorage<Producto[]>("productos_dat", []);
  const [operaciones, setOperaciones] = useLocalStorage<Operacion[]>(
    "operaciones_dat",
    [],
  );

  // --- ESQUEMA DE VALIDACIÓN ZOD ---
  const cupoSchema = z.object({
    patente: z
      .string()
      .min(6, t("cupos.errors.min6"))
      .regex(
        new RegExp(
          "^([A-Z]{3}\\s?\\d{3}|[A-Z]{2}\\s?\\d{3}\\s?[A-Z]{2})$",
          "i",
        ),
        t("cupos.errors.format"),
      ),
    codProd: z.string().min(1, t("cupos.errors.reqProduct")),
    fecha: z
      .date()
      .nullable()
      .refine((date) => date !== null, { message: t("cupos.errors.reqDate") }),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CupoForm>({
    resolver: zodResolver(cupoSchema) as any,
    defaultValues: {
      patente: "",
      codProd: "",
      fecha: new Date(),
    },
  });

  const onSubmit: SubmitHandler<CupoForm> = (data) => {
    if (!data.fecha) {
      toast.error(t("cupos.errors.invalidDate"));
      return;
    }

    const fechaFormateada = data.fecha.toISOString().split("T")[0];
    const patenteNormalizada = data.patente
      ? data.patente.toUpperCase().replace(/\s/g, "")
      : "";

    const existeCupo = operaciones.find(
      (op) =>
        op.patente.replace(/\s/g, "") === patenteNormalizada &&
        op.fechacup === fechaFormateada,
    );

    if (existeCupo) {
      toast.error(t("cupos.errors.duplicate"));
      return;
    }

    const productoValido = productos.find(
      (p) => p.codigo === data.codProd && p.estado === "A",
    );

    if (!productoValido) {
      toast.error(t("cupos.errors.invalidProduct"));
      return;
    }

    const nuevaOperacion: Operacion = {
      patente: data.patente.toUpperCase(),
      fechacup: fechaFormateada,
      codprod: data.codProd,
      estado: "P",
      bruto: 0,
      tara: 0,
    };

    setOperaciones([...operaciones, nuevaOperacion]);

    toast.success(`${t("cupos.success.granted")}: ${nuevaOperacion.patente}`, {
      description: `${t("cupos.success.product")}: ${productoValido.nombre} - ${t("cupos.success.date")}: ${fechaFormateada}`,
    });

    reset({
      patente: "",
      codProd: "",
      fecha: data.fecha,
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black font-mono transition-colors duration-300">
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-black p-4 transition-all duration-300">
        <div className="border-2 border-gray-300 dark:border-white p-8 bg-white dark:bg-[#0a0a0a] shadow-2xl dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] w-full max-w-md transition-colors duration-300">
          <h2 className="text-center mb-8 text-xl font-bold tracking-[0.2em] text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-white pb-4 uppercase">
            {t("cupos.title")}
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-widest">
                {t("cupos.labels.plate")}{" "}
                {errors.patente && (
                  <span className="text-red-500 font-bold ml-2 text-[10px]">
                    * {errors.patente.message}
                  </span>
                )}
              </label>

              {(() => {
                const { onChange, ...rest } = register("patente");
                return (
                  <input
                    {...rest}
                    type="text"
                    className={`bg-gray-50 dark:bg-black border p-3 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all uppercase placeholder:text-gray-400 dark:placeholder:text-gray-800 ${errors.patente ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                    placeholder={t("cupos.placeholders.plate")}
                    autoComplete="off"
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      onChange(e);
                    }}
                  />
                );
              })()}
            </div>

            <div className="flex flex-col gap-1 relative z-50">
              <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-widest">
                {t("cupos.labels.date")}{" "}
                {errors.fecha && (
                  <span className="text-red-500 font-bold ml-2 text-[10px]">
                    * {errors.fecha.message}
                  </span>
                )}
              </label>
              <Controller
                control={control}
                name="fecha"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ?? null}
                    onChange={(date: Date | null) => field.onChange(date)}
                    locale={i18n.language === "EN" ? "en" : "es"}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 p-3 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                    placeholderText={t("cupos.placeholders.date")}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-500 uppercase tracking-widest">
                {t("cupos.labels.product")}{" "}
                {errors.codProd && (
                  <span className="text-red-500 font-bold ml-2 text-[10px]">
                    * {errors.codProd.message}
                  </span>
                )}
              </label>
              <select
                {...register("codProd")}
                className={`bg-gray-50 dark:bg-black border p-3 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer ${errors.codProd ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
              >
                <option value="">{t("cupos.placeholders.select")}</option>
                {productos
                  .filter((p) => p.estado === "A")
                  .map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.nombre} (ID: {p.codigo})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                type="submit"
                className="mt-2 bg-transparent border border-gray-900 dark:border-white text-gray-900 dark:text-white py-2 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all font-bold uppercase"
              >
                {t("cupos.buttons.grant")}
              </button>

              <button
                type="button"
                onClick={onVolver}
                className="w-full text-red-600 dark:text-red-700 text-[10px] font-bold border-t border-gray-300 dark:border-gray-800 pt-4 text-center mt-6 uppercase hover:text-red-500 transition-all"
              >
                {t("cupos.buttons.back")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
