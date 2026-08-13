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
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col no-print shrink-0 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header with YES ENERGY Logo & Adaptive Light/Dark Title */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo_yes_energy.png"
              alt="YES ENERGY Logo"
              className="w-12 h-12 object-contain drop-shadow-md shrink-0"
            />
            <div>
              <h1 className="font-black text-xl text-slate-900 dark:text-white tracking-wide leading-tight">GESTION BL</h1>
              <p className="text-[11px] font-bold text-red-500 tracking-wider uppercase">YES ENERGY</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">Navigation Principale</div>
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
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 shadow-sm font-bold text-base'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
