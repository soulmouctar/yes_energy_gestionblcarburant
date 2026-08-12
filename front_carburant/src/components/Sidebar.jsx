import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Truck,
  UserCheck,
  Users,
  MapPin,
  Building2,
  CheckCircle2,
  BarChart3,
  History,
  ShieldCheck,
  Fuel,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Tableau de bord', to: '/', icon: LayoutDashboard, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Bons de Livraison', to: '/bl', icon: FileText, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Liquidations', to: '/liquidations', icon: CheckCircle2, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Camions', to: '/camions', icon: Truck, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Chauffeurs', to: '/chauffeurs', icon: UserCheck, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Clients', to: '/clients', icon: Users, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Destinations', to: '/destinations', icon: MapPin, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Transporteurs', to: '/transporteurs', icon: Building2, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Rapports & Stats', to: '/rapports', icon: BarChart3, roles: ['admin', 'exploitation', 'consultation'] },
    { name: 'Journal d\'audit', to: '/audit-logs', icon: History, roles: ['admin'] },
    { name: 'Utilisateurs', to: '/users', icon: ShieldCheck, roles: ['admin'] },
  ];

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Fixed Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col no-print shrink-0 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <Fuel className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-wide leading-tight">CarbuLog <span className="text-blue-400 font-light text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">v1.0</span></h1>
              <p className="text-[11px] text-slate-400 font-medium">Gestion BL Carburant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation Principale</div>
          {navigation.map((item) => {
            if (item.roles && user && !item.roles.includes(user.role)) {
              return null;
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || defaultAvatar}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-blue-400"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-400' : user?.role === 'exploitation' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
                Rôle: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
