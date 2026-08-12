import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Database, Settings, Palette, Menu } from 'lucide-react';
import ProfileModal from './ProfileModal';
import ThemeSettingsModal from './ThemeSettingsModal';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colorScheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff`;

  const getSchemeBadge = () => {
    if (colorScheme === 'emerald') return { label: 'Thème Vert Émeraude', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    return { label: 'Thème Bleu Saphir', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
  };

  const schemeBadge = getSchemeBadge();

  return (
    <>
      <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 no-print">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Burger Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">MySQL:</span> <strong className="text-slate-200">gestion_bl</strong>
          </span>

          <span className={`hidden md:flex text-[11px] font-bold px-2.5 py-0.5 rounded-full border items-center gap-1 ${schemeBadge.color}`}>
            <Palette className="w-3 h-3" />
            {schemeBadge.label}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Palette Color Settings Button */}
          <button
            onClick={() => setIsThemeSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition cursor-pointer"
            title="Paramétrage des Couleurs & Thème (Bleu, Vert)"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title={theme === 'dark' ? 'Passer en Mode Jour (Clair)' : 'Passer en Mode Nuit (Sombre)'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700/60 transition text-left cursor-pointer"
          >
            <img
              src={user?.avatar || defaultAvatar}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border border-blue-400"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-blue-400 font-semibold uppercase">{user?.role}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {isThemeSettingsOpen && (
        <ThemeSettingsModal onClose={() => setIsThemeSettingsOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
