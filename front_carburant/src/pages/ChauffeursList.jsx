import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Search, Edit, Trash2, X } from 'lucide-react';

const ChauffeursList = () => {
  const { hasRole } = useAuth();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    numero_permis: '',
    expiration_permis: '',
    transporteur_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chfRes, trpRes] = await Promise.all([
        api.get('/chauffeurs'),
        api.get('/transporteurs'),
      ]);
      if (chfRes.data.success) setChauffeurs(chfRes.data.data);
      if (trpRes.data.success) setTransporteurs(trpRes.data.data);
    } catch (err) {}
  };

  const handleOpenModal = (chf = null) => {
    if (chf) {
      setEditingChauffeur(chf);
      setFormData({
        nom: chf.nom || '',
        telephone: chf.telephone || '',
        numero_permis: chf.numero_permis || '',
        expiration_permis: chf.expiration_permis || '',
        transporteur_id: chf.transporteur_id || '',
      });
    } else {
      setEditingChauffeur(null);
      setFormData({
        nom: '',
        telephone: '+224 ',
        numero_permis: 'PRM-GN-',
        expiration_permis: '',
        transporteur_id: transporteurs[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChauffeur) {
        await api.put(`/chauffeurs/${editingChauffeur.id}`, formData);
      } else {
        await api.post('/chauffeurs', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'enregistrement');
    }
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Supprimer le chauffeur ${nom} ?`)) {
      try {
        await api.delete(`/chauffeurs/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur de suppression');
      }
    }
  };

  const filtered = chauffeurs.filter(ch =>
    ch.nom.toLowerCase().includes(search.toLowerCase()) ||
    ch.numero_permis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            Gestion des Chauffeurs
          </h2>
          <p className="text-sm text-slate-400">Conducteurs habilités au transport de matières dangereuses / pétrolières</p>
        </div>

        {hasRole(['admin', 'exploitation']) && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau Chauffeur</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche par nom, numéro de permis..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Nom & Prénom</th>
              <th className="py-3.5 px-4">Téléphone</th>
              <th className="py-3.5 px-4">Permis de Conduire</th>
              <th className="py-3.5 px-4">Transporteur Rattaché</th>
              <th className="py-3.5 px-4">Nombre de Voyages</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((chf) => (
              <tr key={chf.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-white text-sm">{chf.nom}</td>
                <td className="py-3.5 px-4 font-mono">{chf.telephone || '-'}</td>
                <td className="py-3.5 px-4 font-mono">
                  <div className="text-amber-400 font-bold">{chf.numero_permis || 'N/A'}</div>
                  <div className="text-[10px] text-slate-400">Exp: {chf.expiration_permis || 'N/A'}</div>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-300">{chf.transporteur?.nom || '-'}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{chf.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(chf)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(chf.id, chf.nom)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-bold text-white">{editingChauffeur ? 'Modifier Chauffeur' : 'Nouveau Chauffeur'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom et Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Téléphone</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Numéro Permis</label>
                  <input
                    type="text"
                    value={formData.numero_permis}
                    onChange={(e) => setFormData({ ...formData, numero_permis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Expiration Permis</label>
                  <input
                    type="date"
                    value={formData.expiration_permis}
                    onChange={(e) => setFormData({ ...formData, expiration_permis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Transporteur</label>
                <select
                  value={formData.transporteur_id}
                  onChange={(e) => setFormData({ ...formData, transporteur_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                >
                  <option value="">-- Aucun / Indépendant --</option>
                  {transporteurs.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
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

export default ChauffeursList;
