import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, Search, Edit, Trash2, ShieldCheck, X } from 'lucide-react';

const CamionsList = () => {
  const { hasRole } = useAuth();
  const [camions, setCamions] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamion, setEditingCamion] = useState(null);
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    capacite: 45000,
    type_citerne: 'Aluminium',
    transporteur_id: '',
    etat: 'Actif',
    date_assurance: '',
    date_visite: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [camRes, trpRes] = await Promise.all([
        api.get('/camions'),
        api.get('/transporteurs'),
      ]);
      if (camRes.data.success) setCamions(camRes.data.data);
      if (trpRes.data.success) setTransporteurs(trpRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (camion = null) => {
    if (camion) {
      setEditingCamion(camion);
      setFormData({
        immatriculation: camion.immatriculation || '',
        marque: camion.marque || '',
        capacite: camion.capacite || 45000,
        type_citerne: camion.type_citerne || 'Aluminium',
        transporteur_id: camion.transporteur_id || '',
        etat: camion.etat || 'Actif',
        date_assurance: camion.date_assurance || '',
        date_visite: camion.date_visite || '',
      });
    } else {
      setEditingCamion(null);
      setFormData({
        immatriculation: '',
        marque: 'Scania R450',
        capacite: 45000,
        type_citerne: 'Aluminium',
        transporteur_id: transporteurs[0]?.id || '',
        etat: 'Actif',
        date_assurance: '',
        date_visite: '',
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

  const handleDelete = async (id, immat) => {
    if (window.confirm(`Supprimer le camion ${immat} ?`)) {
      try {
        await api.delete(`/camions/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredCamions = camions.filter(c =>
    c.immatriculation.toLowerCase().includes(search.toLowerCase()) ||
    c.marque?.toLowerCase().includes(search.toLowerCase()) ||
    c.transporteur?.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            Gestion des Camions Citernes
          </h2>
          <p className="text-sm text-slate-400">Flotte de camions de transport de carburant et visites techniques</p>
        </div>

        {hasRole(['admin', 'exploitation']) && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau Camion</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche immatriculation, marque, transporteur..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Immatriculation</th>
              <th className="py-3.5 px-4">Marque & Type Citerne</th>
              <th className="py-3.5 px-4">Capacité (L)</th>
              <th className="py-3.5 px-4">Transporteur</th>
              <th className="py-3.5 px-4">Rotations (BL)</th>
              <th className="py-3.5 px-4">Assurance & Visite</th>
              <th className="py-3.5 px-4">État</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCamions.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">{c.immatriculation}</td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{c.marque}</div>
                  <div className="text-[10px] text-slate-400">{c.type_citerne}</div>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{Number(c.capacite).toLocaleString('fr-FR')} L</td>
                <td className="py-3.5 px-4 font-medium text-slate-300">{c.transporteur?.nom || '-'}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 text-[11px] text-slate-400">
                  <div>Assurance: <span className="text-slate-200">{c.date_assurance || 'N/A'}</span></div>
                  <div>Visite: <span className="text-slate-200">{c.date_visite || 'N/A'}</span></div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    c.etat === 'Actif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    c.etat === 'En panne' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {c.etat}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.immatriculation)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingCamion ? 'Modifier Camion' : 'Nouveau Camion'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Immatriculation</label>
                <input
                  type="text"
                  required
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                  placeholder="ex: GN-5684-C"
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
                    placeholder="ex: Scania R450"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Transporteur Associé</label>
                <select
                  required
                  value={formData.transporteur_id}
                  onChange={(e) => setFormData({ ...formData, transporteur_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                >
                  <option value="">-- Sélectionner Transporteur --</option>
                  {transporteurs.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date Assurance</label>
                  <input
                    type="date"
                    value={formData.date_assurance}
                    onChange={(e) => setFormData({ ...formData, date_assurance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date Visite Technique</label>
                  <input
                    type="date"
                    value={formData.date_visite}
                    onChange={(e) => setFormData({ ...formData, date_visite: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300">Annuler</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamionsList;
