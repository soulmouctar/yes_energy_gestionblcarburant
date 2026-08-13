import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Search, Edit, Trash2, X, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';

const ChauffeursList = () => {
  const { hasRole } = useAuth();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    numero_permis: '',
    telephone: '',
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
        numero_permis: chf.numero_permis || '',
        telephone: chf.telephone || '',
        transporteur_id: chf.transporteur_id || '',
      });
    } else {
      setEditingChauffeur(null);
      setFormData({
        nom: '',
        numero_permis: 'PERMIS-GN-',
        telephone: '+224 ',
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

  const filtered = chauffeurs.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.numero_permis?.toLowerCase().includes(search.toLowerCase()) ||
    c.transporteur?.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPdf = () => {
    generateTablePdf({
      title: 'Liste des Chauffeurs Conducteurs Habilités',
      subtitle: 'Conducteurs enregistrés au dépôt central avec numéros de permis de conduire',
      summaryText: `Total : ${filtered.length} Conducteur(s) Habilité(s)`,
      action: 'download',
      filename: 'Liste_Chauffeurs_YES_ENERGY.pdf',
      columns: [
        { header: 'Nom et Prénom', accessor: (c) => c.nom, bold: true, width: '*' },
        { header: 'N° Permis', accessor: (c) => c.numero_permis || '-', width: 'auto' },
        { header: 'Téléphone', accessor: (c) => c.telephone || '-', width: 'auto' },
        { header: 'Société Transporteur', accessor: (c) => c.transporteur?.nom || '-', width: '*' },
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
            <UserCheck className="w-6 h-6 text-amber-400" />
            Gestion des Chauffeurs Conducteurs
          </h2>
          <p className="text-sm text-slate-400">Conducteurs qualifiés et rattachés aux sociétés de transport habilitées</p>
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
              <span>Nouveau Chauffeur</span>
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
            placeholder="Recherche par nom, permis, transporteur..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Nom & Prénom</th>
              <th className="py-3.5 px-4">Numéro de Permis</th>
              <th className="py-3.5 px-4">Téléphone Contact</th>
              <th className="py-3.5 px-4">Transporteur Rattaché</th>
              <th className="py-3.5 px-4">BLs Conduits</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">{c.nom}</td>
                <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">{c.numero_permis || '-'}</td>
                <td className="py-3.5 px-4 font-mono">{c.telephone || '-'}</td>
                <td className="py-3.5 px-4 text-slate-200">{c.transporteur?.nom || '-'}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.nom)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom et Prénom Chauffeur</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: Mamadou Diallo"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Numéro de Permis</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_permis}
                    onChange={(e) => setFormData({ ...formData, numero_permis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
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
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Société Transporteur Rattachée</label>
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

export default ChauffeursList;
