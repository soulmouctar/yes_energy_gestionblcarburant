import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Search, Edit, Trash2, X } from 'lucide-react';

const DestinationsList = () => {
  const { hasRole } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    region: '',
    distance: 600,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/destinations');
      if (res.data.success) setDestinations(res.data.data);
    } catch (err) {}
  };

  const handleOpenModal = (dst = null) => {
    if (dst) {
      setEditingDestination(dst);
      setFormData({
        nom: dst.nom || '',
        region: dst.region || '',
        distance: dst.distance || 0,
      });
    } else {
      setEditingDestination(null);
      setFormData({
        nom: '',
        region: 'Kankan',
        distance: 600,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDestination) {
        await api.put(`/destinations/${editingDestination.id}`, formData);
      } else {
        await api.post('/destinations', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'enregistrement');
    }
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Supprimer la destination ${nom} ?`)) {
      try {
        await api.delete(`/destinations/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur de suppression');
      }
    }
  };

  const filtered = destinations.filter(d =>
    d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.region?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-400" />
            Gestion des Destinations
          </h2>
          <p className="text-sm text-slate-400">Villes, régions et dépôts de livraison (SGP Kankan, Komarala, Doko, Mamou, etc.)</p>
        </div>

        {hasRole(['admin', 'exploitation']) && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvelle Destination</span>
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
            placeholder="Recherche nom de ville, région..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Région</th>
              <th className="py-3.5 px-4">Distance (km)</th>
              <th className="py-3.5 px-4">Nombre de Livraisons</th>
              <th className="py-3.5 px-4">Volume Essence (L)</th>
              <th className="py-3.5 px-4">Volume Gasoil (L)</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((dst) => (
              <tr key={dst.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-white text-sm">{dst.nom}</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">{dst.region || '-'}</td>
                <td className="py-3.5 px-4 font-mono">{dst.distance} km</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{dst.bls_count || 0} BLs</td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{Number(dst.volume_essence || 0).toLocaleString('fr-FR')} L</td>
                <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{Number(dst.volume_gasoil || 0).toLocaleString('fr-FR')} L</td>
                <td className="py-3.5 px-4 text-right">
                  {hasRole(['admin', 'exploitation']) && (
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(dst)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(dst.id, dst.nom)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-bold text-white">{editingDestination ? 'Modifier Destination' : 'Nouvelle Destination'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom Destination</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: SGP Kankan"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Région Administrative</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="ex: Kankan"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Distance depuis Dépôt (km)</label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
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

export default DestinationsList;
