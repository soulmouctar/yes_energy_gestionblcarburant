import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Palette, Sun, Moon, Check } from 'lucide-react';

const ThemeSettingsModal = ({ onClose }) => {
  const { theme, toggleTheme, colorScheme, changeColorScheme } = useTheme();

  const schemes = [
    {
      id: 'emerald',
      name: 'Verte Émeraude (Carburant Vert / Écologique)',
      bg: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500',
      previewText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'blue',
      name: 'Bleue Saphir (Gasoil / Haute Performance)',
      bg: 'from-blue-500 to-cyan-600',
      border: 'border-blue-500',
      previewText: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'amber',
      name: 'Ambre Dorée (Essence Super / Énergie)',
      bg: 'from-amber-500 to-amber-600',
      border: 'border-amber-500',
      previewText: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            Paramétrage des Couleurs & Thème
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Light / Dark Mode toggle section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Mode d'Affichage Lumineux</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-slate-800 text-white font-bold shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-xs font-bold">Mode Clair (Jour)</p>
                  <p className="text-[10px] opacity-75">Fond blanc haute lisibilité</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-slate-800 text-white font-bold shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-xs font-bold">Mode Sombre (Nuit)</p>
                  <p className="text-[10px] opacity-75">Fond sombre ergonomique</p>
                </div>
              </button>
            </div>
          </div>

          {/* Color Schemes section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Palette de Couleur Principale du Système</label>
            <div className="space-y-2.5">
              {schemes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => changeColorScheme(s.id)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    colorScheme === s.id
                      ? `${s.border} bg-slate-800 text-white shadow-lg`
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${s.bg} shadow-md flex items-center justify-center`}>
                      {colorScheme === s.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{s.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.badgeBg}`}>Actif</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
            >
              Fermer et Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsModal;
