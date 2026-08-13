import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, Search, Edit, Trash2, X, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';

const CamionsList = () => {
  const { hasRole } = useAuth();
  const [camions, setCamions] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamion, setEditingCamion] = useState(null);
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    capacite: 45000,
    transporteur_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [camRes, trpRes] = await Promise.all([
        api.get('/camions'),
        api.get('/transporteurs'),
      ]);
      if (camRes.data.success) setCamions(camRes.data.data);
      if (trpRes.data.success) setTransporteurs(trpRes.data.data);
    } catch (err) {}
  };

  const handleOpenModal = (c = null) => {
    if (c) {
      setEditingCamion(c);
      setFormData({
        immatriculation: c.immatriculation || '',
        marque: c.marque || '',
        capacite: c.capacite || 45000,
        transporteur_id: c.transporteur_id || '',
      });
    } else {
      setEditingCamion(null);
      setFormData({
        immatriculation: '',
        marque: 'RENAULT',
        capacite: 45000,
        transporteur_id: transporteurs[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCamion) {
        await api.put(`/camions/${editingCamion.id}`, formData);
      } else {
        await api.post('/camions', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'enregistrement');
    }
  };

  const handleDelete = async (id, imm) => {
    if (window.confirm(`Supprimer le camion ${imm} ?`)) {
      try {
        await api.delete(`/camions/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur de suppression');
      }
    }
  };

  const filtered = camions.filter(c =>
    c.immatriculation.toLowerCase().includes(search.toLowerCase()) ||
    c.transporteur?.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPdf = () => {
    const totalCapacite = filtered.reduce((sum, c) => sum + Number(c.capacite || 0), 0);
    const capaciteFormatee = totalCapacite.toLocaleString('fr-FR').replace(/\u8998/g, ' ');

    generateTablePdf({
      title: 'Flotte de Camions Citernes Habilités',
      subtitle: 'Véhicules de transport de carburants et leurs capacités volumétriques',
      summaryText: `Total : ${filtered.length} Camion(s) | Capacité Volumétrique Totale de la Flotte : ${capaciteFormatee} Litres`,
      action: 'download',
      filename: 'Liste_Camions_YES_ENERGY.pdf',
      columns: [
        { header: 'Immatriculation', accessor: (c) => c.immatriculation, bold: true, width: 'auto' },
        { header: 'Marque & Modèle', accessor: (c) => c.marque || '-', width: 'auto' },
        { header: 'Capacité (L)', accessor: (c) => `${Number(c.capacite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, alignment: 'right', bold: true, width: 'auto' },
        { header: 'Société Transporteur', accessor: (c) => c.transporteur?.nom || '-', width: '*' },
        { header: 'Statut', accessor: (c) => c.statut || 'Actif', alignment: 'center', width: 'auto' },
        { header: 'BLs Transportés', accessor: (c) => `${c.bls_count || 0} BLs`, alignment: 'center', width: 'auto' }
      ],
      rows: filtered
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            Gestion des Camions Citernes
          </h2>
          <p className="text-sm text-slate-400">Flotte de camions habiliés pour le transport d'Essence et Gasoil</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exporter PDF</span>
          </button>

          {hasRole(['admin', 'exploitation']) && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nouveau Camion</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche par immatriculation, transporteur..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Immatriculation</th>
              <th className="py-3.5 px-4">Marque / Modèle</th>
              <th className="py-3.5 px-4">Capacité (L)</th>
              <th className="py-3.5 px-4">Transporteur</th>
              <th className="py-3.5 px-4">Statut</th>
              <th className="py-3.5 px-4">BLs Réalisés</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">{c.immatriculation}</td>
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{c.marque || '-'}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{Number(c.capacite).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-slate-200">{c.transporteur?.nom || '-'}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.statut === 'En Panne' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {c.statut || 'Actif'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.immatriculation)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingCamion ? 'Modifier Camion' : 'Nouveau Camion'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Plaque d'Immatriculation</label>
                <input
                  type="text"
                  required
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                  placeholder="ex: RC-4589-AF"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Marque / Modèle</label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    placeholder="ex: RENAULT KERAX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Capacité (Litres)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacite}
                    onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Société Transporteur</label>
                <select
                  required
                  value={formData.transporteur_id}
                  onChange={(e) => setFormData({ ...formData, transporteur_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                >
                  <option value="">-- Sélectionner Transporteur --</option>
                  {transporteurs.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamionsList;
