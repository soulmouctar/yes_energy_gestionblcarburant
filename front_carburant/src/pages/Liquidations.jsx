import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, Search, CheckSquare, Calendar, FileText, Check, X, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';
import { generateBlPdf } from '../utils/generateBlPdf';

const Liquidations = () => {
  const { hasRole } = useAuth();
  const [bls, setBls] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('pending'); // 'pending' or 'liquidated'
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single Liquidation Modal
  const [activeBl, setActiveBl] = useState(null);
  const [liquidationDate, setLiquidationDate] = useState(new Date().toISOString().split('T')[0]);
  const [livraisonDate, setLivraisonDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('');

  // Bulk Liquidation Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/liquidations', { params: { filter, search } });
      if (res.data.success) {
        setBls(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(bls.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSingleLiquider = async (e) => {
    e.preventDefault();
    if (!activeBl) return;

    try {
      const res = await api.post(`/liquidations/${activeBl.id}`, {
        date_liquidation: liquidationDate,
        date_livraison: livraisonDate,
        observation: observation,
      });

      if (res.data.success) {
        setActiveBl(null);
        setSelectedIds([]);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de liquidation');
    }
  };

  const handleBulkLiquider = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    try {
      const res = await api.post('/liquidations-bulk', {
        ids: selectedIds,
        date_liquidation: liquidationDate,
        observation: observation,
      });

      if (res.data.success) {
        setIsBulkModalOpen(false);
        setSelectedIds([]);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de liquidation groupée');
    }
  };

  const filteredBls = bls.filter(b =>
    b.numero_bl.toLowerCase().includes(search.toLowerCase()) ||
    b.client?.nom.toLowerCase().includes(search.toLowerCase()) ||
    b.destination?.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPdf = () => {
    const totalVol = filteredBls.reduce((sum, b) => sum + Number(b.quantite || 0), 0);
    const volFormatted = totalVol.toLocaleString('fr-FR').replace(/\u8998/g, ' ');
    const isPending = filter === 'pending';

    generateTablePdf({
      title: isPending ? 'Rapport des BL en Attente de Liquidation' : 'Rapport des BL Liquidés',
      subtitle: 'Suivi et apurement des Bons de Livraison de carburants',
      summaryText: `Statut : ${isPending ? 'EN ATTENTE DE LIQUIDATION' : 'LIQUIDÉS'} | Total : ${filteredBls.length} BL(s) | Volume Cumulé : ${volFormatted} Litres`,
      action: 'download',
      filename: `Rapport_Liquidations_${filter}_YES_ENERGY.pdf`,
      columns: [
        { header: 'N° BL', accessor: (b) => b.numero_bl, bold: true, width: 'auto' },
        { header: 'Date Émission', accessor: (b) => b.date_bl || '-', width: 'auto' },
        { header: 'Produit', accessor: (b) => b.produit, width: 'auto' },
        { header: 'Volume (L)', accessor: (b) => `${Number(b.quantite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, alignment: 'right', bold: true, width: 'auto' },
        { header: 'Client', accessor: (b) => b.client?.nom || '-', width: '*' },
        { header: 'Destination', accessor: (b) => b.destination?.nom || '-', width: '*' },
        { header: 'Transporteur', accessor: (b) => b.transporteur?.nom || '-', width: '*' },
        { header: 'Camion', accessor: (b) => b.camion?.immatriculation || '-', width: 'auto' },
        { header: 'Statut', accessor: (b) => b.statut, alignment: 'center', width: 'auto' },
        { header: 'Date Liq.', accessor: (b) => b.date_liquidation || 'Attente', alignment: 'center', width: 'auto' }
      ],
      rows: filteredBls
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
            Suivi & Liquidation Administrative
          </h2>
          <p className="text-sm text-slate-400">Validation de la livraison effective, déchargement et apurement des BL</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exporter PDF</span>
          </button>

          {filter === 'pending' && selectedIds.length > 0 && hasRole(['admin', 'exploitation']) && (
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Liquider la Sélection ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">BL En Attente de Liquidation</span>
            <div className="text-2xl font-black text-white mt-1">{stats?.total_pending || 0} BLs</div>
            <p className="text-xs text-slate-400 mt-1">Volume cumulé : <strong className="text-amber-400">{Number(stats?.volume_pending || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</strong></p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">BL Déjà Liquidés</span>
            <div className="text-2xl font-black text-white mt-1">{stats?.total_liquidated || 0} BLs</div>
            <p className="text-xs text-slate-400 mt-1">Volume apuré : <strong className="text-emerald-400">{Number(stats?.volume_liquidated || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</strong></p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => { setFilter('pending'); setSelectedIds([]); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${filter === 'pending' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            En attente ({stats?.total_pending || 0})
          </button>
          <button
            onClick={() => { setFilter('liquidated'); setSelectedIds([]); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${filter === 'liquidated' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Liquidés ({stats?.total_liquidated || 0})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° BL, Client..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              {filter === 'pending' && hasRole(['admin', 'exploitation']) && (
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length > 0 && selectedIds.length === filteredBls.length}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="py-3.5 px-4">N° BL</th>
              <th className="py-3.5 px-4">Date BL</th>
              <th className="py-3.5 px-4">Produit & Volume</th>
              <th className="py-3.5 px-4">Client / Destination</th>
              <th className="py-3.5 px-4">Transporteur / Camion</th>
              <th className="py-3.5 px-4">Date Liquidation</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan="9" className="py-8 text-center text-slate-500">Chargement...</td></tr>
            ) : filteredBls.length === 0 ? (
              <tr><td colSpan="9" className="py-8 text-center text-slate-500">Aucun Bon de Livraison dans ce filtre.</td></tr>
            ) : (
              filteredBls.map((bl) => (
                <tr key={bl.id} className="hover:bg-slate-800/40">
                  {filter === 'pending' && hasRole(['admin', 'exploitation']) && (
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(bl.id)}
                        onChange={() => handleSelectOne(bl.id)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {/* 1. N° BL */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">{bl.numero_bl}</td>

                  {/* 2. Date BL */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{bl.date_bl}</td>

                  {/* 3. Produit & Volume */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${bl.produit === 'Essence' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {bl.produit}
                    </span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-1">
                      {Number(bl.quantite).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L
                    </div>
                  </td>

                  {/* 4. Client / Destination */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{bl.client?.nom || '-'}</div>
                    <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-0.5">
                      📍 {bl.destination?.nom || '-'} {bl.destination?.region ? `(${bl.destination.region})` : ''}
                    </div>
                  </td>

                  {/* 5. Transporteur / Camion / Chauffeur */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200 text-xs">{bl.transporteur?.nom || '-'}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">
                      🚛 {bl.camion?.immatriculation || '-'}
                    </div>
                    {bl.chauffeur?.nom && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        👤 {bl.chauffeur.nom}
                      </div>
                    )}
                  </td>

                  {/* 6. Date Liquidation */}
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    {bl.date_liquidation ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {bl.date_liquidation}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-xs">
                        En attente
                      </span>
                    )}
                  </td>

                  {/* 7. Statut */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      bl.statut === 'Liquidé'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {bl.statut}
                    </span>
                  </td>

                  {/* 8. Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {bl.statut !== 'Liquidé' && hasRole(['admin', 'exploitation']) ? (
                      <button
                        onClick={() => setActiveBl(bl)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Liquider</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => generateBlPdf(bl, 'print')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 ml-auto"
                        title="Imprimer / Imprimer Fiche BL"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                        <span>Fiche BL</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Single Liquidation Modal */}
      {activeBl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                Liquider le BL #{activeBl.numero_bl}
              </h3>
              <button onClick={() => setActiveBl(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSingleLiquider} className="p-6 space-y-4">
              <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs space-y-1.5 text-slate-800 dark:text-slate-200">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Client: <strong className="font-bold text-slate-900 dark:text-white">{activeBl.client?.nom}</strong></p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Destination: <strong className="font-bold text-slate-900 dark:text-white">{activeBl.destination?.nom}</strong></p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Produit: <strong className="font-extrabold text-amber-600 dark:text-amber-400">{activeBl.produit} - {Number(activeBl.quantite).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date de Livraison Réelle</label>
                <input
                  type="date"
                  required
                  value={livraisonDate}
                  onChange={(e) => setLivraisonDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date de Liquidation Administrative</label>
                <input
                  type="date"
                  required
                  value={liquidationDate}
                  onChange={(e) => setLiquidationDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Observations / Reçu de Déchargement</label>
                <textarea
                  rows="2"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Pièces justificatives vérifiées, déchargement conforme..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveBl(null)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold cursor-pointer">Confirmer la Liquidation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Liquidation Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-lg font-bold text-white">Liquidation Groupée ({selectedIds.length} BLs)</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleBulkLiquider} className="p-6 space-y-4">
              <p className="text-xs text-slate-400">Vous allez liquider simultanément <strong>{selectedIds.length} Bons de Livraison</strong>. Veuillez saisir la date de liquidation commune.</p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date de Liquidation Commune</label>
                <input
                  type="date"
                  required
                  value={liquidationDate}
                  onChange={(e) => setLiquidationDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Note de groupe</label>
                <textarea
                  rows="2"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Liquidation de fin de semaine / lot de factures..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold cursor-pointer">Valider Liquidation Groupée</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liquidations;
