import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";

// --- DATEPICKER ---
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
registerLocale("es", es);

// --- MAPAS ---
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX ICONOS LEAFLET ---
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- ICONOS SVG ---
const IconTruck = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 10-4 0 2 2 0 004 0zm10 0a2 2 0 10-4 0 2 2 0 004 0z"
    />
  </svg>
);
const IconHistory = () => (
  <svg
    className="w-3 h-3 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconEdit = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const IconMap = () => (
  <svg
    className="w-3 h-3 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);
const IconList = () => (
  <svg
    className="w-3 h-3 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);
const IconPin = () => (
  <svg
    className="w-3 h-3 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// --- COMPONENTE AUXILIAR MAPA ---
const LocationSelector = ({
  onLocationSelect,
}: {
  onLocationSelect: (lat: string, lng: string) => void;
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });
  return null;
};

// --- INTERFACES ---
interface Camion {
  patente: string;
  chofer: string;
  estado: "DISPONIBLE" | "EN_VIAJE" | "TALLER" | "BAJA";
  tipo: "GRANO" | "LIQUIDO" | "GENERAL";
  vencimientoVTV: string;
  kmAceite: number;
  latitud?: string;
  longitud?: string;
}

interface RegistroMantenimiento {
  id: string;
  patente: string;
  fecha: string;
  tipo: "MECANICA" | "NEUMATICOS" | "ACEITE" | "PAPELES" | "OTRO";
  descripcion: string;
  costo: number;
  kilometraje: number;
}

interface ModalDelete {
  isOpen: boolean;
  patente: string | null;
}

export const GestionFlota = ({ onVolver }: { onVolver: () => void }) => {
  const [flota, setFlota] = useLocalStorage<Camion[]>("flota_dat", []);
  const [mantenimientos, setMantenimientos] = useLocalStorage<
    RegistroMantenimiento[]
  >("mantenimientos_dat", []);

  // --- ESTADOS FORMULARIO ---
  const [editando, setEditando] = useState<boolean>(false);
  const [patenteForm, setPatenteForm] = useState("");
  const [choferForm, setChoferForm] = useState("");
  const [estadoForm, setEstadoForm] = useState<Camion["estado"]>("DISPONIBLE");
  const [tipoForm, setTipoForm] = useState<Camion["tipo"]>("GRANO");

  const [vtvForm, setVtvForm] = useState<Date | null>(null);
  const [kmForm, setKmForm] = useState("");

  const [latForm, setLatForm] = useState("");
  const [lngForm, setLngForm] = useState("");

  // --- ESTADOS VISTA ---
  const [vistaMapa, setVistaMapa] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  // --- ESTADOS MODAL HISTORIAL ---
  const [camionHistorial, setCamionHistorial] = useState<Camion | null>(null);
  const [mantFecha, setMantFecha] = useState<Date | null>(new Date());
  const [mantTipo, setMantTipo] =
    useState<RegistroMantenimiento["tipo"]>("MECANICA");
  const [mantDesc, setMantDesc] = useState("");
  const [mantCosto, setMantCosto] = useState("");
  const [mantKm, setMantKm] = useState("");

  // --- ESTADO MODAL DELETE ---
  const [modalDelete, setModalDelete] = useState<ModalDelete>({
    isOpen: false,
    patente: null,
  });

  // ==============================================================
  // LOGICA FLOTA
  // ==============================================================

  const guardarCamion = () => {
    if (!patenteForm || !choferForm) {
      toast.error("FALTAN DATOS OBLIGATORIOS");
      return;
    }

    const nuevaUnidad: Camion = {
      patente: patenteForm.toUpperCase(),
      chofer: choferForm.toUpperCase(),
      estado: estadoForm,
      tipo: tipoForm,
      vencimientoVTV: vtvForm ? vtvForm.toISOString().split("T")[0] : "",
      kmAceite: Number(kmForm),
      latitud: latForm,
      longitud: lngForm,
    };

    if (editando) {
      setFlota(flota.map((c) => (c.patente === patenteForm ? nuevaUnidad : c)));
      toast.success("UNIDAD ACTUALIZADA CORRECTAMENTE");
    } else {
      if (flota.find((c) => c.patente === patenteForm)) {
        toast.error("LA PATENTE YA EXISTE");
        return;
      }
      setFlota([...flota, nuevaUnidad]);
      toast.success("UNIDAD AGREGADA CON ÉXITO");
    }
    limpiarForm();
  };

  const editarCamion = (c: Camion) => {
    setEditando(true);
    setPatenteForm(c.patente);
    setChoferForm(c.chofer);
    setEstadoForm(c.estado);
    setTipoForm(c.tipo);

    if (c.vencimientoVTV) {
      const [y, m, d] = c.vencimientoVTV.split("-").map(Number);
      setVtvForm(new Date(y, m - 1, d));
    } else {
      setVtvForm(null);
    }

    setKmForm(String(c.kmAceite));
    setLatForm(c.latitud || "");
    setLngForm(c.longitud || "");
    setVistaMapa(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`EDITANDO UNIDAD: ${c.patente}`);
  };

  const solicitarEliminacion = (patente: string) => {
    setModalDelete({ isOpen: true, patente });
  };

  const confirmarEliminacion = () => {
    if (modalDelete.patente) {
      const p = modalDelete.patente;
      setFlota(flota.filter((c) => c.patente !== p));
      setMantenimientos(mantenimientos.filter((m) => m.patente !== p));
      toast.success("UNIDAD ELIMINADA DEL SISTEMA");
      if (editando && patenteForm === p) {
        limpiarForm();
      }
    }
    setModalDelete({ isOpen: false, patente: null });
  };

  // CAMBIO DE ESTADO RÁPIDO DESDE LA TARJETA
  const cambioRapidoEstado = (
    patente: string,
    nuevoEstado: Camion["estado"],
  ) => {
    const nuevaFlota = flota.map((c) =>
      c.patente === patente ? { ...c, estado: nuevoEstado } : c,
    );
    setFlota(nuevaFlota);
    toast.success(`ESTADO ACTUALIZADO: ${nuevoEstado}`);
  };

  const limpiarForm = () => {
    setEditando(false);
    setPatenteForm("");
    setChoferForm("");
    setEstadoForm("DISPONIBLE");
    setVtvForm(null);
    setKmForm("");
    setLatForm("");
    setLngForm("");
  };

  const handleMapClick = (lat: string, lng: string) => {
    setLatForm(lat);
    setLngForm(lng);
    toast.success("UBICACIÓN SELECCIONADA");
  };

  // ==============================================================
  // LOGICA HISTORIAL
  // ==============================================================

  const abrirHistorial = (c: Camion) => {
    setCamionHistorial(c);
    setMantKm(String(c.kmAceite));
    setMantDesc("");
    setMantCosto("");
    setMantFecha(new Date());
  };

  const guardarMantenimiento = () => {
    if (!camionHistorial) return;
    if (!mantDesc || !mantCosto) {
      toast.warning("Complete descripción y costo");
      return;
    }

    const nuevoRegistro: RegistroMantenimiento = {
      id: Date.now().toString(),
      patente: camionHistorial.patente,
      fecha: mantFecha
        ? mantFecha.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo: mantTipo,
      descripcion: mantDesc.toUpperCase(),
      costo: Number(mantCosto),
      kilometraje: Number(mantKm),
    };

    setMantenimientos([nuevoRegistro, ...mantenimientos]);

    if (Number(mantKm) > camionHistorial.kmAceite) {
      const flotaActualizada = flota.map((c) =>
        c.patente === camionHistorial.patente
          ? { ...c, kmAceite: Number(mantKm) }
          : c,
      );
      setFlota(flotaActualizada);
      setCamionHistorial({ ...camionHistorial, kmAceite: Number(mantKm) });
      toast.success("MANTENIMIENTO GUARDADO Y KM ACTUALIZADO");
    } else {
      toast.success("MANTENIMIENTO REGISTRADO");
    }

    setMantDesc("");
    setMantCosto("");
  };

  const eliminarMantenimiento = (id: string) => {
    if (window.confirm("¿Borrar este registro?")) {
      setMantenimientos(mantenimientos.filter((m) => m.id !== id));
    }
  };

  // ==============================================================
  // HELPERS
  // ==============================================================

  const verificarVencimientos = (vtv: string) => {
    if (!vtv) return "NORMAL";
    const fechaVtv = new Date(vtv);
    const fechaHoy = new Date();
    const difDias = Math.ceil(
      (fechaVtv.getTime() - fechaHoy.getTime()) / (1000 * 3600 * 24),
    );
    if (difDias < 0) return "VENCIDO";
    if (difDias < 30) return "ALERTA";
    return "OK";
  };

  const flotaFiltrada = flota.filter((c) => {
    const coincideTexto =
      c.patente.includes(busqueda.toUpperCase()) ||
      c.chofer.includes(busqueda.toUpperCase());
    const coincideEstado =
      filtroEstado === "TODOS" || c.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black p-4 font-mono transition-colors duration-300 flex justify-center">
      <div
        className={`w-full max-w-5xl space-y-6 transition-all ${camionHistorial || modalDelete.isOpen ? "opacity-30 pointer-events-none blur-sm" : ""}`}
      >
        {/* ENCABEZADO */}
        <div className="border-b-2 border-blue-600 dark:border-blue-500 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-500 uppercase italic tracking-wider">
              [ Gestión de Flota ]
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Control total de unidades
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setVistaMapa(!vistaMapa)}
              className={`px-4 py-2 text-xs font-bold uppercase border flex items-center gap-2 ${vistaMapa ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}
            >
              {vistaMapa ? (
                <>
                  <IconList /> VER LISTADO
                </>
              ) : (
                <>
                  <IconMap /> VER MAPA GPS
                </>
              )}
            </button>
            <button
              onClick={onVolver}
              className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-500 uppercase border border-transparent hover:border-red-500 px-3 py-2"
            >
              &lt;&lt; Volver
            </button>
          </div>
        </div>

        {/* VISTA MAPA GENERAL */}
        {vistaMapa ? (
          <div className="aspect-square w-full max-w-3xl mx-auto border-2 border-blue-500 shadow-xl overflow-hidden relative bg-gray-200">
            <MapContainer
              center={[-32.94682, -60.63932]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution="&copy; OSM"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark:filter dark:invert-[100%] dark:hue-rotate-180 dark:brightness-95 dark:contrast-90"
              />
              {flotaFiltrada.map((c) => {
                const lat = parseFloat(c.latitud || "0");
                const lng = parseFloat(c.longitud || "0");
                if (lat === 0 || lng === 0) return null;
                return (
                  <Marker key={c.patente} position={[lat, lng]}>
                    <Popup>
                      <div className="font-mono text-xs">
                        <strong className="text-blue-600 text-sm">
                          {c.patente}
                        </strong>
                        <br />
                        {c.chofer}
                        <br />
                        <button
                          onClick={() => setVistaMapa(false)}
                          className="mt-2 text-blue-500 underline"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : (
          /* VISTA LISTADO */
          <>
            {/* FORMULARIO DE ALTA / EDICIÓN */}
            <div
              className={`p-6 border-2 shadow-lg transition-all duration-300 ${editando ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500 dark:border-yellow-600 scale-[1.01]" : "bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-800"}`}
            >
              {editando && (
                <div className="bg-yellow-500 text-white dark:text-black font-bold text-center text-xs uppercase py-2 mb-4 animate-pulse tracking-widest">
                  ⚠ MODO EDICIÓN ACTIVO: {patenteForm}
                </div>
              )}

              <h3
                className={`text-sm font-bold uppercase mb-4 border-l-4 pl-2 ${editando ? "text-yellow-700 dark:text-yellow-500 border-yellow-500" : "text-gray-900 dark:text-white border-blue-500"}`}
              >
                {editando
                  ? "Editar Unidad Existente"
                  : "Registrar Nueva Unidad"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* GRUPO 1: DATOS BÁSICOS */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    PATENTE
                  </label>
                  <input
                    className="p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white uppercase text-xs outline-none focus:border-blue-500"
                    value={patenteForm}
                    onChange={(e) =>
                      setPatenteForm(e.target.value.toUpperCase())
                    }
                    disabled={editando}
                    placeholder="AAA 123"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    CHOFER
                  </label>
                  <input
                    className="p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white uppercase text-xs outline-none focus:border-blue-500"
                    value={choferForm}
                    onChange={(e) =>
                      setChoferForm(e.target.value.toUpperCase())
                    }
                    placeholder="NOMBRE APELLIDO"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    ESTADO
                  </label>
                  <select
                    className="p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    value={estadoForm}
                    onChange={(e) => setEstadoForm(e.target.value as any)}
                  >
                    <option value="DISPONIBLE">🟢 DISPONIBLE</option>
                    <option value="EN_VIAJE">🔵 EN VIAJE</option>
                    <option value="TALLER">🔴 EN TALLER</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    TIPO CARGA
                  </label>
                  <select
                    className="p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    value={tipoForm}
                    onChange={(e) => setTipoForm(e.target.value as any)}
                  >
                    <option value="GRANO">🌽 GRANO</option>
                    <option value="LIQUIDO">💧 LÍQUIDO</option>
                    <option value="GENERAL">📦 GENERAL</option>
                  </select>
                </div>

                {/* GRUPO 2: MANTENIMIENTO */}
                <div className="flex flex-col relative z-50">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    VENCIMIENTO VTV
                  </label>
                  <DatePicker
                    selected={vtvForm}
                    onChange={(date) => setVtvForm(date)}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    popperClassName="z-[9999]"
                    className="w-full p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                    placeholderText="SELECCIONAR FECHA"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-500 font-bold mb-1">
                    KILOMETRAJE ACEITE
                  </label>
                  <input
                    type="number"
                    className="p-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    value={kmForm}
                    onChange={(e) => setKmForm(e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* GRUPO 3: GPS SELECTOR */}
                <div className="md:col-span-4 border border-blue-200 dark:border-blue-900/50 p-3 bg-blue-50 dark:bg-blue-900/10 z-0">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1">
                      <IconPin /> SELECCIÓN DE UBICACIÓN (GPS)
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="w-24 p-1 text-[9px] bg-white dark:bg-black border border-gray-300 dark:border-gray-700 dark:text-white"
                        placeholder="LAT"
                        value={latForm}
                        readOnly
                      />
                      <input
                        className="w-24 p-1 text-[9px] bg-white dark:bg-black border border-gray-300 dark:border-gray-700 dark:text-white"
                        placeholder="LNG"
                        value={lngForm}
                        readOnly
                      />
                    </div>
                  </div>
                  {/* MINI MAPA */}
                  <div className="h-48 w-full border border-gray-300 dark:border-gray-700 overflow-hidden relative z-0">
                    <MapContainer
                      center={[-32.94682, -60.63932]}
                      zoom={10}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="dark:filter dark:invert-[100%] dark:hue-rotate-180 dark:brightness-95 dark:contrast-90"
                      />
                      <LocationSelector onLocationSelect={handleMapClick} />
                      {latForm && lngForm && (
                        <Marker
                          position={[parseFloat(latForm), parseFloat(lngForm)]}
                        />
                      )}
                    </MapContainer>
                    <div className="absolute bottom-1 right-1 z-[400] bg-white/80 dark:bg-black/80 px-2 py-1 text-[8px] text-gray-600 dark:text-gray-300 pointer-events-none">
                      Haga clic en el mapa para ubicar
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={guardarCamion}
                  className={`text-white px-6 py-3 text-xs font-bold uppercase transition-colors shadow-sm flex-1 ${editando ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {editando
                    ? "GUARDAR CAMBIOS EN UNIDAD"
                    : "REGISTRAR NUEVA UNIDAD"}
                </button>
                {editando && (
                  <button
                    onClick={limpiarForm}
                    className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-3 text-xs font-bold uppercase hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </div>

            {/* FILTROS */}
            <div className="flex gap-4">
              <input
                placeholder="🔍 Buscar patente o chofer..."
                className="flex-1 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-xs outline-none focus:border-blue-500"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <select
                className="p-3 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-xs outline-none"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">TODOS</option>
                <option value="DISPONIBLE">🟢 DISPONIBLES</option>
                <option value="EN_VIAJE">🔵 EN VIAJE</option>
                <option value="TALLER">🔴 EN TALLER</option>
              </select>
            </div>

            {/* LISTADO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {flotaFiltrada.map((c) => {
                const estadoVtv = verificarVencimientos(c.vencimientoVTV);
                return (
                  <div
                    key={c.patente}
                    className={`relative group bg-white dark:bg-[#0a0a0a] border p-4 transition-all shadow-sm ${editando && patenteForm === c.patente ? "border-yellow-500 ring-2 ring-yellow-500/20" : "border-gray-300 dark:border-gray-800 hover:border-blue-500"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <IconTruck />
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {c.patente}
                          </h4>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase ml-6">
                          {c.chofer}
                        </p>
                      </div>

                      {/* SELECTOR RÁPIDO DE ESTADO (CAMBIO: Selector con opciones legibles) */}
                      <div className="relative">
                        <select
                          value={c.estado}
                          onChange={(e) =>
                            cambioRapidoEstado(
                              c.patente,
                              e.target.value as Camion["estado"],
                            )
                          }
                          className={`appearance-none pl-6 pr-2 py-1 font-bold text-[9px] border rounded cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-black transition-colors uppercase
                                            ${
                                              c.estado === "DISPONIBLE"
                                                ? "bg-green-50 text-green-700 border-green-500 dark:bg-green-900/20 dark:text-green-400 focus:ring-green-400"
                                                : c.estado === "TALLER"
                                                  ? "bg-red-50 text-red-700 border-red-500 dark:bg-red-900/20 dark:text-red-400 focus:ring-red-400"
                                                  : "bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 focus:ring-blue-400"
                                            }
                                        `}
                        >
                          <option
                            value="DISPONIBLE"
                            className="bg-white text-gray-900 dark:bg-black dark:text-white font-bold"
                          >
                            DISPONIBLE
                          </option>
                          <option
                            value="EN_VIAJE"
                            className="bg-white text-gray-900 dark:bg-black dark:text-white font-bold"
                          >
                            EN VIAJE
                          </option>
                          <option
                            value="TALLER"
                            className="bg-white text-gray-900 dark:bg-black dark:text-white font-bold"
                          >
                            TALLER
                          </option>
                        </select>
                        {/* ICONO SUPERPUESTO */}
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]">
                          {c.estado === "DISPONIBLE"
                            ? "🟢"
                            : c.estado === "TALLER"
                              ? "🔴"
                              : "🔵"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold">
                          VTV
                        </span>
                        <span
                          className={`text-xs font-bold ${estadoVtv === "VENCIDO" ? "text-red-600 animate-pulse" : estadoVtv === "ALERTA" ? "text-yellow-600" : "text-gray-600 dark:text-gray-300"}`}
                        >
                          {c.vencimientoVTV || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-gray-400 font-bold">
                          ACEITE
                        </span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {c.kmAceite.toLocaleString()} km
                        </span>
                      </div>
                    </div>

                    {/* BOTONERA ACCIONES */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => abrirHistorial(c)}
                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1 text-[10px] font-bold uppercase hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-1"
                      >
                        <IconHistory /> Historial
                      </button>
                      <button
                        onClick={() => editarCamion(c)}
                        className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 p-1 px-3 border border-yellow-200 dark:border-yellow-900 hover:bg-yellow-100"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => solicitarEliminacion(c.patente)}
                        className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 px-3 border border-red-200 dark:border-red-900 hover:bg-red-100"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* --- MODAL HISTORIAL --- */}
      {camionHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl border-2 border-gray-300 dark:border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#111]">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <IconHistory /> BITÁCORA MANTENIMIENTO
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  {camionHistorial.patente} - {camionHistorial.chofer}
                </p>
              </div>
              <button
                onClick={() => setCamionHistorial(null)}
                className="text-gray-500 hover:text-black dark:hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {/* FORMULARIO BITACORA */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 border border-blue-100 dark:border-blue-900/30 mb-6 rounded-sm">
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">
                  Nuevo Registro:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <DatePicker
                    selected={mantFecha}
                    onChange={(date) => setMantFecha(date)}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    popperClassName="z-[9999]"
                    className="w-full p-1 bg-white dark:bg-black border text-xs dark:text-white dark:border-gray-700 outline-none cursor-pointer"
                  />
                  <select
                    value={mantTipo}
                    onChange={(e) => setMantTipo(e.target.value as any)}
                    className="p-1 bg-white dark:bg-black border text-xs dark:text-white dark:border-gray-700 outline-none"
                  >
                    <option value="MECANICA">MECÁNICA</option>
                    <option value="ACEITE">ACEITE</option>
                    <option value="NEUMATICOS">NEUMÁTICOS</option>
                    <option value="PAPELES">PAPELES</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                  <input
                    type="number"
                    placeholder="KM ACTUAL"
                    value={mantKm}
                    onChange={(e) => setMantKm(e.target.value)}
                    className="p-1 bg-white dark:bg-black border text-xs dark:text-white dark:border-gray-700 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="$ COSTO"
                    value={mantCosto}
                    onChange={(e) => setMantCosto(e.target.value)}
                    className="p-1 bg-white dark:bg-black border text-xs dark:text-white dark:border-gray-700 outline-none"
                  />
                  <button
                    onClick={guardarMantenimiento}
                    className="bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700"
                  >
                    AGREGAR
                  </button>
                </div>
                <input
                  placeholder="Descripción del trabajo realizado..."
                  value={mantDesc}
                  onChange={(e) => setMantDesc(e.target.value)}
                  className="w-full mt-2 p-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-xs dark:text-white outline-none"
                />
              </div>

              <div className="space-y-3">
                {mantenimientos.filter(
                  (m) => m.patente === camionHistorial.patente,
                ).length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8 italic">
                    No hay registros de mantenimiento para esta unidad.
                  </p>
                ) : (
                  mantenimientos
                    .filter((m) => m.patente === camionHistorial.patente)
                    .sort(
                      (a, b) =>
                        new Date(b.fecha).getTime() -
                        new Date(a.fecha).getTime(),
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        className="flex gap-3 border-l-2 border-gray-300 dark:border-gray-700 pl-4 py-1 relative group"
                      >
                        <div
                          className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full ${m.tipo === "ACEITE" ? "bg-yellow-500" : m.tipo === "MECANICA" ? "bg-red-500" : "bg-blue-500"}`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold text-gray-500">
                              {m.fecha} | {m.tipo}
                            </span>
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white">
                              $ {m.costo.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-300 font-medium">
                            {m.descripcion}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            A los {m.kilometraje.toLocaleString()} km
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarMantenimiento(m.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 text-xs font-bold px-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs text-gray-500">Total Gastado:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${" "}
                {mantenimientos
                  .filter((m) => m.patente === camionHistorial.patente)
                  .reduce((acc, curr) => acc + curr.costo, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN --- */}
      {modalDelete.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-sm border-2 border-red-500 shadow-red-500/20 shadow-2xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                <IconTrash />
              </div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-500 uppercase tracking-widest mb-2">
                ¿Eliminar Unidad?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 font-mono">
                Se dará de baja la patente{" "}
                <span className="font-bold text-black dark:text-white">
                  {modalDelete.patente}
                </span>{" "}
                y se borrará todo su historial de mantenimiento. Esta acción no
                se puede deshacer.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() =>
                    setModalDelete({ isOpen: false, patente: null })
                  }
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-500 font-bold text-xs uppercase hover:bg-gray-100 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                  CONFIRMAR BAJA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
