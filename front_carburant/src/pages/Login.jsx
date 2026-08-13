import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, ShieldAlert, ArrowRight, Sun, Moon, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Sleek Executive Login Card */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Branding & Hero Image with dark-panel class (5 cols) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 bg-slate-950 overflow-hidden min-h-[320px] lg:min-h-[520px] dark-panel">
          {/* Background Hero Image with Vignette Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/fuel_depot_hero.jpg"
              alt="Dépôt de Carburant YES ENERGY"
              className="w-full h-full object-cover object-center opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40"></div>
          </div>

          {/* Top Logo & Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo_yes_energy.png"
                alt="YES ENERGY Logo"
                className="w-14 h-14 object-contain drop-shadow-xl shrink-0"
              />
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">GESTION BL</h2>
                <p className="text-[10px] font-bold text-red-500 tracking-wider uppercase">YES ENERGY GUINÉE</p>
              </div>
            </div>
          </div>

          {/* Middle Pitch Text */}
          <div className="relative z-10 space-y-3 my-auto pt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Plateforme Officielle SGP / YES ENERGY
            </span>
            <h1 className="text-xl lg:text-2xl font-black text-white leading-tight">
              Gestion des Bons de Livraison de Carburant
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Suivi logistique des citernes, acheminement vers dépôts et liquidations administratives.
            </p>
          </div>

          {/* Bottom Company Tag */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400">Société Guinéenne d'Énergie & Distribution Pétrolière</p>
          </div>
        </div>

        {/* Right Side: Clean Professional Form (7 cols) */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-slate-900">
          
          {/* Top Right Theme Toggle (Mode Nuit / Mode Jour) */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title={theme === 'dark' ? 'Passer en Mode Jour' : 'Passer en Mode Nuit'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <span>{theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}</span>
            </button>
          </div>

          <div className="my-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Authentification</h2>
              <p className="text-xs text-slate-400 mt-1">Saisissez vos identifiants professionnels pour vous connecter</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Erreur de connexion</p>
                  <p className="text-[11px] text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@carburant.gn"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Mot de Passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer pt-3"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Discrete Demo Quick Fill Buttons */}
          <div className="pt-5 border-t border-slate-800 mt-6">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">Comptes de test rapide :</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoUser('admin@carburant.gn')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-400 font-semibold transition cursor-pointer"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoUser('exploitation@carburant.gn')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 font-semibold transition cursor-pointer"
              >
                🚛 Exploitation
              </button>
              <button
                type="button"
                onClick={() => handleDemoUser('consultation@carburant.gn')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold transition cursor-pointer"
              >
                👁️ Consultation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
