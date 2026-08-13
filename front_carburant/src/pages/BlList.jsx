import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Download,
  Printer,
  Edit,
  Trash2,
  Filter,
  Copy
} from 'lucide-react';
import * as XLSX from 'xlsx';
import BlFormModal from './BlFormModal';
import PrintBlModal from '../components/PrintBlModal';

const BlList = () => {
  const { hasRole } = useAuth();
  const [bls, setBls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [produitFilter, setProduitFilter] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [blToEdit, setBlToEdit] = useState(null);
  const [blToPrint, setBlToPrint] = useState(null);

  useEffect(() => {
    fetchBls();
  }, [statutFilter, produitFilter, dateDebut, dateFin]);

  const fetchBls = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statutFilter !== 'all') params.statut = statutFilter;
      if (produitFilter !== 'all') params.produit = produitFilter;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;

      const res = await api.get('/bl', { params });
      if (res.data.success) {
        setBls(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBls();
  };

  const handleDelete = async (id, num) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le Bon de Livraison #${num} ?`)) {
      try {
        const res = await api.delete(`/bl/${id}`);
        if (res.data.success) {
          fetchBls();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = bls.map(b => ({
      'N° BL': b.numero_bl,
      'Date': b.date_bl,
      'Produit': b.produit,
      'Quantité (L)': b.quantite,
      'Client': b.client?.nom || '',
      'Destination': b.destination?.nom || '',
      'Camion': b.camion?.immatriculation || '',
      'Chauffeur': b.chauffeur?.nom || '',
      'Transporteur': b.transporteur?.nom || '',
      'Statut': b.statut,
      'Date Livraison': b.date_livraison || '',
      'Date Liquidation': b.date_liquidation || '',
      'Observation': b.observation || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bons_de_Livraison');
    XLSX.writeFile(workbook, `Bons_de_Livraison_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-400" />
            Bons de Livraison (GESTION BL)
          </h2>
          <p className="text-sm font-semibold text-slate-400">Consultation, création, édition et impression des fiches de livraison</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exporter Excel</span>
          </button>

          {hasRole(['admin', 'exploitation']) && (
            <button
              onClick={() => { setBlToEdit(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Nouveau BL</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="N° BL, Client, Camion..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Statut filter */}
          <div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
            >
              <option value="all">Tous les Statuts</option>
              <option value="En cours">En cours</option>
              <option value="Livré">Livré</option>
              <option value="Liquidé">Liquidé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>

          {/* Produit filter */}
          <div>
            <select
              value={produitFilter}
              onChange={(e) => setProduitFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
            >
              <option value="all">Tous les Produits</option>
              <option value="Essence">Essence</option>
              <option value="Gasoil">Gasoil</option>
            </select>
          </div>

          {/* Date Début */}
          <div>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              placeholder="Date début"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          {/* Submit Search */}
          <div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Filtrer les résultats</span>
            </button>
          </div>
        </form>
      </div>

      {/* BL Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4">N° BL</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Produit</th>
                <th className="py-4 px-4">Quantité</th>
                <th className="py-4 px-4">Client / Destination</th>
                <th className="py-4 px-4">Transporteur & Camion</th>
                <th className="py-4 px-4">Chauffeur</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400 font-semibold">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Chargement des Bons de Livraison...</span>
                    </div>
                  </td>
                </tr>
              ) : bls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400 font-semibold text-base">
                    Aucun Bon de Livraison ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                bls.map((bl) => (
                  <tr key={bl.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-black text-blue-400 text-base">{bl.numero_bl}</td>
                    <td className="py-4 px-4 font-semibold whitespace-nowrap">{bl.date_bl}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${bl.produit === 'Essence' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {bl.produit}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-slate-900 dark:text-white text-base whitespace-nowrap">
                      {Number(bl.quantite).toLocaleString('fr-FR')} L
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-base">{bl.client?.nom || '-'}</div>
                      <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-0.5">📍 {bl.destination?.nom || '-'} ({bl.destination?.region})</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{bl.transporteur?.nom || '-'}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">🚛 {bl.camion?.immatriculation}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-200">{bl.chauffeur?.nom || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${
                        bl.statut === 'Liquidé' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        bl.statut === 'Livré' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        bl.statut === 'Annulé' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {bl.statut}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setBlToPrint(bl)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition cursor-pointer"
                          title="Imprimer Fiche A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {hasRole(['admin', 'exploitation']) && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await api.post(`/bl/${bl.id}/duplicate`);
                                  if (res.data.success) fetchBls();
                                } catch (e) {
                                  alert('Erreur lors de la duplication');
                                }
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 transition cursor-pointer"
                              title="Dupliquer ce BL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => { setBlToEdit(bl); setIsFormOpen(true); }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(bl.id, bl.numero_bl)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <BlFormModal
          blToEdit={blToEdit}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchBls}
        />
      )}

      {/* Print Modal */}
      {blToPrint && (
        <PrintBlModal
          bl={blToPrint}
          onClose={() => setBlToPrint(null)}
        />
      )}
    </div>
  );
};

export default BlList;
