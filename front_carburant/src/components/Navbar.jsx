import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Palette, Menu, User, ChevronDown } from 'lucide-react';
import ProfileModal from './ProfileModal';
import ThemeSettingsModal from './ThemeSettingsModal';
import { getAvatarUrl } from '../utils/avatar';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colorScheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSchemeBadge = () => {
    if (colorScheme === 'red') return { label: 'Flamme Rouge (YES ENERGY)', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
    if (colorScheme === 'amber') return { label: 'Ambre Solaire (Essence)', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'Bleu Pétrole (Gasoil)', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
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

          <span className={`hidden md:flex text-[11px] font-bold px-2.5 py-0.5 rounded-full border items-center gap-1 ${schemeBadge.color}`}>
            <Palette className="w-3 h-3" />
            {schemeBadge.label}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Palette Color Settings Button */}
          <button
            onClick={() => setIsThemeSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-500 border border-slate-700 transition cursor-pointer"
            title="Paramétrage des Couleurs & Thème Système"
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

          {/* Interactive User Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 transition text-left cursor-pointer shadow-sm"
            >
              <img
                src={getAvatarUrl(user?.avatar, user?.name)}
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-red-500 shrink-0"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                  {user?.role}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Dropdown Menu Overlay Card */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 backdrop-blur-md">
                {/* Header User Card inside Dropdown */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={getAvatarUrl(user?.avatar, user?.name)}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Rôle: {user?.role}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 my-1"></div>

                {/* Profile Item */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Mon Profil & Photo</span>
                </button>

                {/* Appearance Settings Item */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsThemeSettingsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-red-500" />
                  <span>Thèmes & Apparence BDD</span>
                </button>

                {/* Toggle Day/Night inside menu */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                    <span>Mode {theme === 'dark' ? 'Jour (Clair)' : 'Nuit (Sombre)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">{theme}</span>
                </button>

                <div className="border-t border-slate-800/80 my-1"></div>

                {/* Logout Item */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
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
