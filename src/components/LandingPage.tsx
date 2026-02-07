import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

export const LandingPage = ({ onIngresar }: { onIngresar: () => void }) => {
  const [showDocs, setShowDocs] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-mono flex flex-col relative overflow-hidden transition-colors duration-300 selection:bg-cyan-500 selection:text-black">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* --- SECTION PRINCIPAL --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="mb-8">
          <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800 px-3 py-1 text-[10px] uppercase tracking-[0.3em] rounded-full">
            {t("landing.badge")}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:via-gray-400 dark:to-gray-600 whitespace-pre-line">
          {t("landing.title")}
        </h1>

        <p className="max-w-xl text-gray-600 dark:text-gray-400 text-sm md:text-base mb-10 leading-relaxed">
          {t("landing.desc")}
        </p>

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
          <button
            onClick={onIngresar}
            className="flex-1 bg-gray-900 text-white dark:bg-white dark:text-black py-4 font-bold uppercase tracking-widest hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {t("landing.enter")}
          </button>

          <button
            onClick={() => setShowDocs(!showDocs)}
            className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 py-4 font-bold uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 dark:hover:border-white dark:hover:text-white transition-all bg-transparent"
          >
            {showDocs ? t("landing.hideDocs") : t("landing.showDocs")}
          </button>
        </div>
      </main>

      {/* --- SECCIÓN DE DOCUMENTACIÓN (Desplegable) --- */}
      {showDocs && (
        <section className="relative z-10 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom duration-500 transition-colors">
          <div className="max-w-5xl mx-auto p-8 md:p-12">
            <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-500 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 uppercase tracking-widest">
              {t("landing.lifecycle")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ESTADO 1 */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-gray-50 dark:bg-transparent">
                <div className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold">
                  01
                </div>
                <h4 className="text-yellow-600 dark:text-yellow-500 font-bold mb-2">
                  {t("landing.states.p.title")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-500 leading-5">
                  <Trans
                    i18nKey="landing.states.p.desc"
                    components={{ b: <b /> }}
                  />
                </p>
              </div>

              {/* ESTADO 2 */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-gray-50 dark:bg-transparent">
                <div className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold">
                  02
                </div>
                <h4 className="text-blue-600 dark:text-blue-500 font-bold mb-2">
                  {t("landing.states.a.title")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-500 leading-5">
                  <Trans
                    i18nKey="landing.states.a.desc"
                    components={{ b: <b /> }}
                  />
                </p>
              </div>

              {/* ESTADO 3 */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-gray-50 dark:bg-transparent">
                <div className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold">
                  03
                </div>
                <h4 className="text-purple-600 dark:text-purple-500 font-bold mb-2">
                  {t("landing.states.c.title")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-500 leading-5">
                  <Trans
                    i18nKey="landing.states.c.desc"
                    components={{ b: <b /> }}
                  />
                </p>
              </div>

              {/* ESTADO 4 */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-gray-50 dark:bg-transparent">
                <div className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold">
                  04
                </div>
                <h4 className="text-orange-600 dark:text-orange-500 font-bold mb-2">
                  {t("landing.states.b.title")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-500 leading-5">
                  <Trans
                    i18nKey="landing.states.b.desc"
                    components={{ b: <b /> }}
                  />
                </p>
              </div>

              {/* ESTADO 5 */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-gray-50 dark:bg-transparent">
                <div className="text-4xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold">
                  05
                </div>
                <h4 className="text-emerald-600 dark:text-emerald-500 font-bold mb-2">
                  {t("landing.states.f.title")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-500 leading-5">
                  <Trans
                    i18nKey="landing.states.f.desc"
                    components={{ b: <b /> }}
                  />
                </p>
              </div>

              {/* GESTIÓN */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-gray-100 dark:bg-gray-900/50">
                <h4 className="text-gray-900 dark:text-white font-bold mb-2">
                  {t("landing.management")}
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-500 space-y-2">
                  <li>
                    <Trans
                      i18nKey="landing.mgmtList.admin"
                      components={{ b: <b /> }}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="landing.mgmtList.reports"
                      components={{ b: <b /> }}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="landing.mgmtList.fleet"
                      components={{ b: <b /> }}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
      <footer className="relative z-10 p-6 text-center text-[10px] text-gray-500 dark:text-gray-600 border-t border-gray-300 dark:border-gray-900">
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
};
