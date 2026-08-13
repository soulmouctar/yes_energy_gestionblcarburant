import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, Filter, Download, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { generateTablePdf } from '../utils/generateTablePdf';

const Rapports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter options
  const [clients, setClients] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [camions, setCamions] = useState([]);

  // Filter inputs
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    produit: 'all',
    client_id: 'all',
    destination_id: 'all',
    transporteur_id: 'all',
    camion_id: 'all',
    statut: 'all',
  });

  useEffect(() => {
    fetchOptions();
    handleGenerateReport();
  }, []);

  const fetchOptions = async () => {
    try {
      const [cliRes, dstRes, trpRes, camRes] = await Promise.all([
        api.get('/clients'),
        api.get('/destinations'),
        api.get('/transporteurs'),
        api.get('/camions'),
      ]);
      if (cliRes.data.success) setClients(cliRes.data.data);
      if (dstRes.data.success) setDestinations(dstRes.data.data);
      if (trpRes.data.success) setTransporteurs(trpRes.data.data);
      if (camRes.data.success) setCamions(camRes.data.data);
    } catch (err) {}
  };

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/rapports', { params: filters });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.data) return;

    const exportRows = reportData.data.map(b => ({
      'N° BL': b.numero_bl,
      'Date BL': b.date_bl,
      'Produit': b.produit,
      'Quantité (L)': b.quantite,
      'Prix Transport (GNF)': b.prix_transport,
      'Client': b.client?.nom || '',
      'Destination': b.destination?.nom || '',
      'Région': b.destination?.region || '',
      'Transporteur': b.transporteur?.nom || '',
      'Camion': b.camion?.immatriculation || '',
      'Chauffeur': b.chauffeur?.nom || '',
      'Statut': b.statut,
      'Date Liquidation': b.date_liquidation || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport_BL');
    XLSX.writeFile(workbook, `Rapport_Carburant_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPdf = () => {
    if (!reportData || !reportData.data) return;

    const totalEssence = Number(reportData.summary?.volume_essence || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');
    const totalGasoil = Number(reportData.summary?.volume_gasoil || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');
    const totalGlobal = Number(reportData.summary?.total_volume || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');

    generateTablePdf({
      title: 'Bilan et Rapport Multi-Critères de Carburants',
      subtitle: 'Société Guinéenne d\'Énergie & Distribution Pétrolière',
      summaryText: `Total : ${reportData.summary?.total_bl || 0} BL(s) | Volume Essence : ${totalEssence} L | Volume Gasoil : ${totalGasoil} L | Total Global : ${totalGlobal} Litres`,
      action: 'download',
      filename: `Rapport_Bilan_Carburant_${new Date().toISOString().split('T')[0]}.pdf`,
      columns: [
        { header: 'N° BL', accessor: (b) => b.numero_bl, bold: true, width: 'auto' },
        { header: 'Date', accessor: (b) => b.date_bl || '-', width: 'auto' },
        { header: 'Produit', accessor: (b) => b.produit, width: 'auto' },
        { header: 'Volume (L)', accessor: (b) => `${Number(b.quantite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, alignment: 'right', bold: true, width: 'auto' },
        { header: 'Client', accessor: (b) => b.client?.nom || '-', width: '*' },
        { header: 'Destination', accessor: (b) => `${b.destination?.nom || ''} (${b.destination?.region || ''})`, width: '*' },
        { header: 'Transporteur', accessor: (b) => b.transporteur?.nom || '-', width: '*' },
        { header: 'Camion', accessor: (b) => b.camion?.immatriculation || '-', width: 'auto' },
        { header: 'Statut', accessor: (b) => b.statut, alignment: 'center', width: 'auto' }
      ],
      rows: reportData.data
    });
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Rapports Multi-Critères & Graphiques Analyste
          </h2>
          <p className="text-sm text-slate-400">Génération de bilans périodiques, statistiques comparatives et exports analytiques</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exporter Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 no-print shadow-lg">
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            Filtres de Recherche & Période
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date début */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Date Début</label>
              <input
                type="date"
                value={filters.date_debut}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Date Fin</label>
              <input
                type="date"
                value={filters.date_fin}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Produit */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Produit</label>
              <select
                value={filters.produit}
                onChange={(e) => setFilters({ ...filters, produit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Tous les produits</option>
                <option value="Essence">Essence</option>
                <option value="Gasoil">Gasoil</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Statut BL</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="En cours">En cours</option>
                <option value="Livré">Livré</option>
                <option value="Liquidé">Liquidé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Client Destinataire</label>
              <select
                value={filters.client_id}
                onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Tous les clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Destination</label>
              <select
                value={filters.destination_id}
                onChange={(e) => setFilters({ ...filters, destination_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Toutes les destinations</option>
                {destinations.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>

            {/* Transporteur */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Transporteur</label>
              <select
                value={filters.transporteur_id}
                onChange={(e) => setFilters({ ...filters, transporteur_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Tous les transporteurs</option>
                {transporteurs.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </select>
            </div>

            {/* Camion */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Camion Citerne</label>
              <select
                value={filters.camion_id}
                onChange={(e) => setFilters({ ...filters, camion_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">Tous les camions</option>
                {camions.map(c => <option key={c.id} value={c.id}>{c.immatriculation}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Calcul en cours...' : 'Mettre à jour le Rapport'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Nombre de BL Filtrés</span>
          <div className="text-3xl font-black text-white mt-1">{reportData?.summary?.total_bl || 0} <span className="text-xs font-normal text-slate-400">BLs</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[11px] font-bold text-amber-400 uppercase">Volume Essence Total</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{Number(reportData?.summary?.volume_essence || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} <span className="text-xs font-bold text-slate-400">L</span></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <span className="text-[11px] font-bold text-blue-400 uppercase">Volume Gasoil Total</span>
          <div className="text-3xl font-black text-blue-400 mt-1">{Number(reportData?.summary?.volume_gasoil || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} <span className="text-xs font-bold text-slate-400">L</span></div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl p-4 shadow">
          <span className="text-[11px] font-bold text-slate-300 uppercase">Volume Global Transporté</span>
          <div className="text-3xl font-black text-white mt-1">{Number(reportData?.summary?.total_volume || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} <span className="text-xs font-bold text-slate-400">L</span></div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
          <h3 className="text-sm font-bold text-white mb-1">Volume par Destination</h3>
          <p className="text-xs text-slate-400 mb-4">Répartition des volumes transportés par localité</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData?.by_destination || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} formatter={(val) => [`${Number(val).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, 'Volume']} />
                <Bar dataKey="volume" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transporteur Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
          <h3 className="text-sm font-bold text-white mb-1">Volume par Transporteur</h3>
          <p className="text-xs text-slate-400 mb-4">Acheminement cumulé par société de transport</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData?.by_transporteur || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} formatter={(val) => [`${Number(val).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, 'Volume']} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Result Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Résultat Détaillé du Rapport ({reportData?.data?.length || 0} enregistrements)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">N° BL</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Quantité</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Transporteur</th>
                <th className="py-3.5 px-4">Camion / Chauffeur</th>
                <th className="py-3.5 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reportData?.data?.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{bl.numero_bl}</td>
                  <td className="py-3 px-4 font-medium">{bl.date_bl}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bl.produit === 'Essence' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{bl.produit}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{Number(bl.quantite).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</td>
                  <td className="py-3 px-4 font-medium">{bl.client?.nom}</td>
                  <td className="py-3 px-4">{bl.destination?.nom} ({bl.destination?.region})</td>
                  <td className="py-3 px-4">{bl.transporteur?.nom}</td>
                  <td className="py-3 px-4 font-mono text-amber-400">{bl.camion?.immatriculation}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${bl.statut === 'Liquidé' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{bl.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
