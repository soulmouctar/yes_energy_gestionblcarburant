import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Fuel,
  CheckCircle2,
  Truck,
  TrendingUp,
  MapPin,
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
  ResponsiveContainer
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner - Adaptive Title for Light/Dark Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">GESTION BL — Tableaux & KPIs</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">YES ENERGY • Suivi en temps réel des livraisons de carburant</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total BL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">Total BL Émis</span>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{data?.total_bl || 0}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">BLs</span>
          </div>
          <div className="mt-2.5 flex items-center gap-3 text-xs font-bold">
            <span className="text-blue-600 dark:text-blue-400">{data?.bl_en_cours} en cours</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">{data?.bl_liquides} liquidés</span>
          </div>
        </div>

        {/* Card 2: Volume Essence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">Volume Essence</span>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500">{Number(data?.volume_essence || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">LITRES</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-bold">Carburant Super 95/98</p>
        </div>

        {/* Card 3: Volume Gasoil */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">Volume Gasoil</span>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">{Number(data?.volume_gasoil || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">LITRES</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-bold">Diesel / Gasoil Moteur</p>
        </div>

        {/* Card 4: Volume Total Transporté (dark-panel for bright white text on dark blue gradient) */}
        <div className="bg-gradient-to-br from-blue-700 to-slate-900 border border-blue-500/40 rounded-2xl p-5 relative overflow-hidden shadow dark-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-200">Volume Global Transporté</span>
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white">{Number(data?.volume_total || 0).toLocaleString('fr-FR')}</span>
            <span className="text-xs font-bold text-slate-200">L</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-100">{data?.camions_actifs} camions actifs</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-100">{data?.chauffeurs_count} chauffeurs</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Volume Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Évolution Mensuelle des Volumes Transportés</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">Répartition comparative Essence vs Gasoil (en Litres)</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_chart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" stroke="#475569" fontSize={13} />
                <YAxis stroke="#475569" fontSize={13} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} Litres`, '']}
                />
                <Legend />
                <Bar dataKey="Essence" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gasoil" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Top Destinations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">Volume total acheminé par localité</p>

            <div className="space-y-3">
              {data?.top_destinations?.map((dest, idx) => (
                <div key={dest.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{dest.nom}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{dest.region} • {dest.bl_count} livraisons</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                    {Number(dest.volume_total).toLocaleString('fr-FR')} L
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent BLs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Derniers Bons de Livraison Émis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Les 5 plus récentes opérations enregistrées dans le système GESTION BL</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-300">
            <thead className="bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">N° BL</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Quantité</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Camion / Chauffeur</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.derniers_bl?.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-black text-blue-600 dark:text-blue-400">{bl.numero_bl}</td>
                  <td className="py-3.5 px-4 font-bold">{bl.date_bl}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${bl.produit === 'Essence' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                      {bl.produit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">{Number(bl.quantite).toLocaleString('fr-FR')} L</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-200">{bl.client?.nom || '-'}</td>
                  <td className="py-3.5 px-4 font-bold">{bl.destination?.nom || '-'}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{bl.camion?.immatriculation}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{bl.chauffeur?.nom}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                      bl.statut === 'Liquidé' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      bl.statut === 'Livré' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                      bl.statut === 'Annulé' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}>
                      {bl.statut}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedBlToPrint(bl)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-200 hover:text-white transition inline-flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
                      title="Imprimer BL"
                    >
                      <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
