import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Fuel,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  MapPin,
  Eye,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import PrintBlModal from '../components/PrintBlModal';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlToPrint, setSelectedBlToPrint] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tableau de Bord Décisionnel</h2>
          <p className="text-sm text-slate-400">Vue d'ensemble des flux de livraison de carburants (Essence & Gasoil)</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Dernière synchro: <strong>{new Date().toLocaleTimeString('fr-FR')}</strong></span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total BL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total BL Enregistrés</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{data?.total_bl || 0}</span>
            <span className="text-xs text-slate-400">Bons émis</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] font-medium">
            <span className="text-amber-400 font-semibold">{data?.bl_en_cours} en cours</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">{data?.bl_liquides} liquidés</span>
          </div>
        </div>

        {/* Card 2: Volume Essence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Essence</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-400">{Number(data?.volume_essence || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-bold text-slate-400">LITRES</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Essence Super 95/98</p>
        </div>

        {/* Card 3: Volume Gasoil */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Gasoil</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-400">{Number(data?.volume_gasoil || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-bold text-slate-400">LITRES</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Diesel / Gasoil Moteur</p>
        </div>

        {/* Card 4: Volume Total Transporté */}
        <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Volume Total Transporté</span>
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{Number(data?.volume_total || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-bold text-slate-400">L</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-slate-300 font-semibold">{data?.camions_actifs} camions actifs</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-semibold">{data?.chauffeurs_count} chauffeurs</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Volume Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Évolution Mensuelle des Volumes Transportés</h3>
          <p className="text-xs text-slate-400 mb-6">Répartition comparative Essence vs Gasoil (Litres)</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_chart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} Litres`, '']}
                />
                <Legend />
                <Bar dataKey="Essence" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gasoil" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Top Destinations
            </h3>
            <p className="text-xs text-slate-400 mb-4">Volume total acheminé par localité</p>

            <div className="space-y-3">
              {data?.top_destinations?.map((dest, idx) => (
                <div key={dest.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{dest.nom}</p>
                      <p className="text-[10px] text-slate-400">{dest.region} • {dest.bl_count} livraisons</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {Number(dest.volume_total).toLocaleString('fr-FR')} L
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent BLs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Derniers Bons de Livraison Émis</h3>
            <p className="text-xs text-slate-400">Les 5 plus récentes opérations enregistrées dans le système</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° BL</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Quantité</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Camion / Chauffeur</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.derniers_bl?.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{bl.numero_bl}</td>
                  <td className="py-3 px-4 font-medium">{bl.date_bl}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bl.produit === 'Essence' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {bl.produit}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{Number(bl.quantite).toLocaleString('fr-FR')} L</td>
                  <td className="py-3 px-4 font-medium">{bl.client?.nom || '-'}</td>
                  <td className="py-3 px-4">{bl.destination?.nom || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{bl.camion?.immatriculation}</div>
                    <div className="text-[10px] text-slate-400">{bl.chauffeur?.nom}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      bl.statut === 'Liquidé' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      bl.statut === 'Livré' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      bl.statut === 'Annulé' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {bl.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBlToPrint(bl)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center gap-1 text-[11px]"
                      title="Imprimer BL"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fiche A4</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Modal */}
      {selectedBlToPrint && (
        <PrintBlModal bl={selectedBlToPrint} onClose={() => setSelectedBlToPrint(null)} />
      )}
    </div>
  );
};

export default Dashboard;
