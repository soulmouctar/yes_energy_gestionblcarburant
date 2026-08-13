import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Edit, Trash2, X, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';

const ClientsList = () => {
  const { hasRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
    contact: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/clients');
      if (res.data.success) setClients(res.data.data);
    } catch (err) {}
  };

  const handleOpenModal = (cli = null) => {
    if (cli) {
      setEditingClient(cli);
      setFormData({
        nom: cli.nom || '',
        telephone: cli.telephone || '',
        adresse: cli.adresse || '',
        contact: cli.contact || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        nom: '',
        telephone: '+224 ',
        adresse: '',
        contact: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'enregistrement');
    }
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Supprimer le client ${nom} ?`)) {
      try {
        await api.delete(`/clients/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur de suppression');
      }
    }
  };

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.adresse?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPdf = () => {
    const totalVolume = filtered.reduce((sum, c) => sum + Number(c.volume_total || 0), 0);
    const volumeFormatted = totalVolume.toLocaleString('fr-FR').replace(/\u8998/g, ' ');

    generateTablePdf({
      title: 'Liste des Clients Destinataires',
      subtitle: 'Entreprises minières, dépôts et stations partenaires réceptionnant les carburants',
      summaryText: `Total : ${filtered.length} Client(s) Destinataire(s) | Volume Total Livré : ${volumeFormatted} Litres`,
      action: 'download',
      filename: 'Liste_Clients_YES_ENERGY.pdf',
      columns: [
        { header: 'Client / Société', accessor: (c) => c.nom, bold: true, width: '*' },
        { header: 'Contact', accessor: (c) => c.contact || '-', width: 'auto' },
        { header: 'Téléphone', accessor: (c) => c.telephone || '-', width: 'auto' },
        { header: 'Adresse Dépôt', accessor: (c) => c.adresse || '-', width: '*' },
        { header: 'BLs Livrés', accessor: (c) => `${c.bls_count || 0} BLs`, alignment: 'center', width: 'auto' },
        { header: 'Volume Total (L)', accessor: (c) => `${Number(c.volume_total || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L`, alignment: 'right', bold: true, width: 'auto' }
      ],
      rows: filtered
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Gestion des Clients
          </h2>
          <p className="text-sm text-slate-400">Entreprises minières, dépôts et stations partenaires réceptionnant les carburants</p>
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
              <span>Nouveau Client</span>
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
            placeholder="Recherche par nom client, adresse..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Nom Client / Société</th>
              <th className="py-3.5 px-4">Contact & Téléphone</th>
              <th className="py-3.5 px-4">Adresse</th>
              <th className="py-3.5 px-4">Nombre de BL</th>
              <th className="py-3.5 px-4">Volume Total Livré</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((cli) => (
              <tr key={cli.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">{cli.nom}</td>
                <td className="py-3.5 px-4 font-medium">
                  <div className="text-slate-200">{cli.contact || '-'}</div>
                  <div className="text-[10px] font-mono text-slate-400">{cli.telephone}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">{cli.adresse || '-'}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{cli.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{Number(cli.volume_total || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ')} L</td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(cli)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cli.id, cli.nom)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-bold text-white">{editingClient ? 'Modifier Client' : 'Nouveau Client'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom / Raison Sociale</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Personne Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Adresse Dépôt / Siège</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
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

export default ClientsList;
