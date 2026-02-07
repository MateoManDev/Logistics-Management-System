import React from "react";
import { useTranslation } from "react-i18next"; // <--- IMPORTAMOS

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  // Ya no necesitamos recibir language ni setLanguage desde fuera
}

export const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  toggleTheme,
}: SettingsModalProps) => {
  const { i18n } = useTranslation(); // <--- Hook para controlar el idioma

  if (!isOpen) return null;

  // Función para cambiar idioma
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang); // Persistencia simple
  };

  const currentLang = i18n.language; // Idioma actual (ES o EN)

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] w-full max-w-sm border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 p-6 relative">
        {/* HEADER */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">
          Configuración
        </h3>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold"
        >
          ✕
        </button>

        <div className="flex flex-col gap-6">
          {/* 1. SECCIÓN TEMA */}
          <div>
            <label className="text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-wider mb-3 block">
              Apariencia / Tema
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => theme === "dark" && toggleTheme()}
                className={`flex-1 py-3 text-xs font-bold uppercase border transition-all ${
                  theme === "light"
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-cyan-500"
                }`}
              >
                ☀ Claro
              </button>
              <button
                onClick={() => theme === "light" && toggleTheme()}
                className={`flex-1 py-3 text-xs font-bold uppercase border transition-all ${
                  theme === "dark"
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-cyan-500"
                }`}
              >
                ☾ Oscuro
              </button>
            </div>
          </div>

          {/* 2. SECCIÓN IDIOMA (CONECTADO A I18NEXT) */}
          <div>
            <label className="text-xs font-bold text-cyan-600 dark:text-cyan-500 uppercase tracking-wider mb-3 block">
              Idioma / Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["ES", "EN"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`py-3 text-xs font-bold border transition-all ${
                    currentLang === lang
                      ? "bg-white dark:bg-gray-800 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm"
                      : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  {lang === "ES" ? "Español" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-[9px] text-gray-400">LOGÍSTICA CENTZ v3.0</p>
        </div>
      </div>
    </div>
  );
};
