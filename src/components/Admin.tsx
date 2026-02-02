import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// --- INTERFACES ---
interface Producto {
  codigo: string;
  nombre: string;
  estado: "A" | "B";
}
interface Rubro {
  codigo: string;
  nombre: string;
}
interface Silo {
  codsil: string;
  nombre: string;
  codprod: string;
  stock: number;
  capacidad: number;
}
interface RubroXProducto {
  codigorub: string;
  codigoprod: string;
  valmin: number;
  valmax: number;
}

// Interfaz para el Modal Personalizado
interface ModalStatus {
  show: boolean;
  tipo: "INFO" | "CONFIRM" | "ERROR";
  mensaje: string;
  onAccept?: () => void;
}

type SubVista = "PRINCIPAL" | "PRODUCTOS" | "RUBROS" | "SILOS" | "RXP";

export const Admin = ({ onVolver }: { onVolver: () => void }) => {
  const [subVista, setSubVista] = useState<SubVista>("PRINCIPAL");

  // DATA STORAGE
  const [productos, setProductos] = useLocalStorage<Producto[]>(
    "productos_dat",
    [],
  );
  const [rubros, setRubros] = useLocalStorage<Rubro[]>("rubros_dat", []);
  const [silos, setSilos] = useLocalStorage<Silo[]>("silos_dat", []);
  const [rxp, setRxp] = useLocalStorage<RubroXProducto[]>("rxp_dat", []);

  // ESTADOS PARA FORMULARIOS
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formAux, setFormAux] = useState(""); // Para codprod en silos o RXP
  const [formMin, setFormMin] = useState("");
  const [formMax, setFormMax] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // ESTADO DEL MODAL
  const [modal, setModal] = useState<ModalStatus>({
    show: false,
    tipo: "INFO",
    mensaje: "",
  });

  const closeModal = () => setModal({ ...modal, show: false });

  // --- COMPONENTE MODAL INTEGRADO ---
  const SistemaModal = () => {
    if (!modal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div
          className={`w-full max-w-sm border-2 p-6 bg-gray-900 shadow-2xl animate-in zoom-in duration-200 ${
            modal.tipo === "ERROR"
              ? "border-red-600 shadow-red-900/20"
              : modal.tipo === "CONFIRM"
                ? "border-cyan-600 shadow-cyan-900/20"
                : "border-emerald-600 shadow-emerald-900/20"
          }`}
        >
          <h4
            className={`text-center font-bold mb-4 tracking-tighter uppercase text-xs ${
              modal.tipo === "ERROR"
                ? "text-red-500"
                : modal.tipo === "CONFIRM"
                  ? "text-cyan-500"
                  : "text-emerald-500"
            }`}
          >
            {modal.tipo === "ERROR"
              ? "[ ! ] ERROR DE SISTEMA"
              : modal.tipo === "CONFIRM"
                ? "[ ? ] CONFIRMAR CAMBIOS"
                : "[ i ] REGISTRO EXITOSO"}
          </h4>
          <p className="text-white text-center text-[11px] mb-6 font-mono uppercase italic">
            {modal.mensaje}
          </p>
          <div className="flex gap-3">
            {modal.tipo === "CONFIRM" && (
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-800 text-gray-500 py-2 text-[10px] hover:text-white transition-colors"
              >
                CANCELAR
              </button>
            )}
            <button
              onClick={modal.onAccept || closeModal}
              className={`flex-1 py-2 text-[10px] font-bold uppercase transition-all ${
                modal.tipo === "ERROR"
                  ? "bg-red-900 text-white"
                  : "bg-cyan-600 text-black hover:bg-cyan-400"
              }`}
            >
              {modal.tipo === "CONFIRM" ? "EJECUTAR" : "ENTENDIDO"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const limpiarForms = () => {
    setFormCodigo("");
    setFormNombre("");
    setFormAux("");
    setFormMin("");
    setFormMax("");
    setEditandoId(null);
  };

  // --- LÓGICA DE SILOS (CON MODAL) ---
  const guardarSilo = () => {
    if (!formCodigo || !formNombre || !formAux) {
      return setModal({
        show: true,
        tipo: "ERROR",
        mensaje: "Complete todos los campos del silo.",
      });
    }

    const nuevoSilo: Silo = {
      codsil: formCodigo,
      nombre: formNombre,
      codprod: formAux,
      stock: Number(formMin) || 0,
      capacidad: Number(formMax) || 0,
    };

    if (editandoId) {
      setSilos(silos.map((s) => (s.codsil === editandoId ? nuevoSilo : s)));
    } else {
      setSilos([...silos, nuevoSilo]);
    }

    setModal({
      show: true,
      tipo: "INFO",
      mensaje: `Silo ${formNombre} guardado en el sistema.`,
      onAccept: () => {
        limpiarForms();
        closeModal();
      },
    });
  };

  const eliminarSilo = (id: string) => {
    setModal({
      show: true,
      tipo: "CONFIRM",
      mensaje: `¿Está seguro de eliminar el silo ${id}?`,
      onAccept: () => {
        setSilos(silos.filter((s) => s.codsil !== id));
        closeModal();
      },
    });
  };

  // --- VISTAS SECUNDARIAS ---
  if (subVista === "SILOS")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-mono">
        <SistemaModal />
        <div className="border-2 border-cyan-500 p-8 bg-gray-900 w-full max-w-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <h3 className="text-cyan-500 mb-6 text-center font-bold tracking-widest border-b border-cyan-900 pb-2 uppercase italic">
            Gestión de Silos
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-black/40 p-6 border border-gray-800">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500 uppercase">
                Código Silo:
              </label>
              <input
                value={formCodigo}
                onChange={(e) => setFormCodigo(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 text-white text-xs outline-none focus:border-cyan-500"
                placeholder="Ej: S01"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500 uppercase">
                Nombre / Ubicación:
              </label>
              <input
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 text-white text-xs outline-none focus:border-cyan-500"
                placeholder="Ej: Silo Norte 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500 uppercase">
                Producto Asignado:
              </label>
              <select
                value={formAux}
                onChange={(e) => setFormAux(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 text-white text-xs outline-none focus:border-cyan-500"
              >
                <option value="">Seleccionar...</option>
                {productos.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500 uppercase">
                Capacidad Máxima (KG):
              </label>
              <input
                type="number"
                value={formMax}
                onChange={(e) => setFormMax(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 text-white text-xs outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={guardarSilo}
              className="col-span-2 bg-cyan-600 text-black font-bold py-3 mt-2 hover:bg-cyan-400 uppercase text-xs transition-all"
            >
              {editandoId
                ? "[ Actualizar Registro ]"
                : "[ Registrar Nuevo Silo ]"}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {silos.map((s) => (
              <div
                key={s.codsil}
                className="flex justify-between items-center p-3 border border-gray-800 bg-black/60 group hover:border-cyan-900 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold">
                    {s.nombre}{" "}
                    <span className="text-[10px] text-gray-600 italic">
                      ({s.codsil})
                    </span>
                  </span>
                  <span className="text-[9px] text-cyan-700 uppercase">
                    Stock: {s.stock} / {s.capacidad} KG
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditandoId(s.codsil);
                      setFormCodigo(s.codsil);
                      setFormNombre(s.nombre);
                      setFormAux(s.codprod);
                      setFormMax(String(s.capacidad));
                    }}
                    className="text-[9px] text-gray-500 hover:text-cyan-500 uppercase font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarSilo(s.codsil)}
                    className="text-[9px] text-gray-500 hover:text-red-500 uppercase font-bold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setSubVista("PRINCIPAL");
              limpiarForms();
            }}
            className="w-full mt-8 text-gray-600 text-[10px] hover:text-white uppercase italic tracking-widest transition-colors"
          >
            &lt; Volver al Panel de Control
          </button>
        </div>
      </div>
    );

  // --- VISTA PRINCIPAL ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4 font-mono">
      <SistemaModal />
      <div className="border-2 border-white p-10 bg-gray-900 flex flex-col gap-3 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden">
        {/* Decoración Cyberpunk */}
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20"></div>

        <h2 className="text-white text-center mb-8 tracking-[0.3em] font-bold border-b-2 border-white/10 pb-4 uppercase italic text-xl">
          Admin Panel{" "}
          <span className="text-cyan-500 text-[10px] block tracking-normal not-italic mt-1">
            SISTEMA DE GESTIÓN CENTRAL
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "PRODUCTOS", label: "PRODUCTOS", icon: "📦" },
            { id: "RUBROS", label: "RUBROS", icon: "📑" },
            { id: "RXP", label: "CONFIG. RXP", icon: "⚙️" },
            { id: "SILOS", label: "GESTIÓN SILOS", icon: "🏗️" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSubVista(v.id as SubVista)}
              className="group border border-cyan-500/30 p-4 w-72 text-cyan-500 hover:bg-cyan-500 hover:text-black uppercase text-xs font-bold tracking-widest transition-all flex justify-between items-center"
            >
              <span>{v.label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                {v.icon}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onVolver}
          className="mt-6 border-t border-red-900 pt-6 text-red-700 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          &lt;&lt; Cerrar Sesión Administrativa
        </button>
      </div>
      <p className="text-[8px] text-gray-700 tracking-[0.5em] uppercase">
        Security Level: Grade-A Encrypted
      </p>
    </div>
  );
};
