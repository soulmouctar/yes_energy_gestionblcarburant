import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Fuel, Lock, Mail, ShieldAlert, ArrowRight, Sun, Moon, Palette, ShieldCheck, Check } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme, colorScheme, changeColorScheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Identifiants invalides');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur API.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden transition-colors duration-200">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Hero Image & Branding (5 cols) */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-8 bg-slate-950 overflow-hidden min-h-[340px] lg:min-h-[600px]">
          {/* Background Hero Image with Dark Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/fuel_depot_hero.jpg"
              alt="Dépôt de Carburant SGP"
              className="w-full h-full object-cover object-center opacity-60 scale-105 transition duration-700 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40"></div>
          </div>

          {/* Top Brand Info */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20">
                <Fuel className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-wide">SGP CarbuLog</h2>
                <p className="text-xs text-slate-300 font-medium">Société Guinéenne de Pétrole</p>
              </div>
            </div>
          </div>

          {/* Center / Bottom Slogan */}
          <div className="relative z-10 space-y-3 my-auto pt-12">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Plateforme Sécurisée v1.0
            </span>
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Gestion Intelligente & Suivi en Temps Réel des Bons de Livraison
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Acheminement, suivi des citernes, bilans et liquidations administratives des produits pétroliers (Essence & Gasoil).
            </p>
          </div>

          {/* Bottom Live Metrics */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/80 backdrop-blur p-2.5 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Dépôts</span>
              <strong className="text-emerald-400 font-mono text-sm">Active</strong>
            </div>
            <div className="bg-slate-900/80 backdrop-blur p-2.5 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Base MySQL</span>
              <strong className="text-white font-mono text-sm">gestion_bl</strong>
            </div>
            <div className="bg-slate-900/80 backdrop-blur p-2.5 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Sécurité</span>
              <strong className="text-blue-400 font-mono text-sm">Sanctum</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Controls (6 cols) */}
        <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between bg-slate-900">
          
          {/* Top Controls: Theme & Color Palette Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Couleurs:
              </span>
              <button
                type="button"
                onClick={() => changeColorScheme('emerald')}
                className={`w-6 h-6 rounded-full bg-emerald-500 border-2 transition ${colorScheme === 'emerald' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                title="Thème Vert Émeraude"
              />
              <button
                type="button"
                onClick={() => changeColorScheme('blue')}
                className={`w-6 h-6 rounded-full bg-blue-500 border-2 transition ${colorScheme === 'blue' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                title="Thème Bleu Saphir"
              />
              <button
                type="button"
                onClick={() => changeColorScheme('amber')}
                className={`w-6 h-6 rounded-full bg-amber-500 border-2 transition ${colorScheme === 'amber' ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                title="Thème Ambre Doré"
              />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}</span>
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Authentification</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">Entrez vos identifiants autorisés pour accéder à la plateforme</p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs">Erreur d'authentification</p>
                  <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@carburant.gn"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Mot de Passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Se connecter au système</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Login Cards */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase text-slate-400 mb-3 text-center">Accès Rapide Démo (Clic unique)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoUser('admin@carburant.gn')}
                className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-purple-400">👑 Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoUser('exploitation@carburant.gn')}
                className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-400">🚛 Exploitation</div>
                <div className="text-[10px] text-slate-400 truncate">exploita...</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoUser('consultation@carburant.gn')}
                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-400">👁️ Consultation</div>
                <div className="text-[10px] text-slate-400 truncate">consult...</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
