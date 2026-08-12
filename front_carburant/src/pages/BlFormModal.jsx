import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Save, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

const BlFormModal = ({ blToEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    numero_bl: '',
    date_bl: new Date().toISOString().split('T')[0],
    camion_id: '',
    chauffeur_id: '',
    client_id: '',
    destination_id: '',
    transporteur_id: '',
    produit: 'Essence',
    quantite: 45000,
    prix_transport: 4500000,
    date_livraison: '',
    date_liquidation: '',
    statut: 'En cours',
    observation: '',
  });

  const [camions, setCamions] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOptions();
    if (blToEdit) {
      setFormData({
        numero_bl: blToEdit.numero_bl || '',
        date_bl: blToEdit.date_bl || new Date().toISOString().split('T')[0],
        camion_id: blToEdit.camion_id || '',
        chauffeur_id: blToEdit.chauffeur_id || '',
        client_id: blToEdit.client_id || '',
        destination_id: blToEdit.destination_id || '',
        transporteur_id: blToEdit.transporteur_id || '',
        produit: blToEdit.produit || 'Essence',
        quantite: blToEdit.quantite || 45000,
        prix_transport: blToEdit.prix_transport || 4500000,
        date_livraison: blToEdit.date_livraison || '',
        date_liquidation: blToEdit.date_liquidation || '',
        statut: blToEdit.statut || 'En cours',
        observation: blToEdit.observation || '',
      });
    } else {
      generateBlNumber();
    }
  }, [blToEdit]);

  const fetchOptions = async () => {
    try {
      const [camRes, chfRes, cliRes, dstRes, trpRes] = await Promise.all([
        api.get('/camions'),
        api.get('/chauffeurs'),
        api.get('/clients'),
        api.get('/destinations'),
        api.get('/transporteurs'),
      ]);

      if (camRes.data.success) setCamions(camRes.data.data);
      if (chfRes.data.success) setChauffeurs(chfRes.data.data);
      if (cliRes.data.success) setClients(cliRes.data.data);
      if (dstRes.data.success) setDestinations(dstRes.data.data);
      if (trpRes.data.success) setTransporteurs(trpRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateBlNumber = async () => {
    try {
      const res = await api.get('/bl/generate-number');
      if (res.data.success) {
        setFormData(prev => ({ ...prev, numero_bl: res.data.numero_bl }));
      }
    } catch (err) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto set transporteur if camion is chosen
      if (name === 'camion_id' && value) {
        const selectedCamion = camions.find(c => c.id === parseInt(value));
        if (selectedCamion && selectedCamion.transporteur_id) {
          updated.transporteur_id = selectedCamion.transporteur_id;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clean payload: Convert empty string dates to null for Laravel validation
      const payload = {
        ...formData,
        date_livraison: formData.date_livraison ? formData.date_livraison : null,
        date_liquidation: formData.date_liquidation ? formData.date_liquidation : null,
        prix_transport: formData.prix_transport ? Number(formData.prix_transport) : 0,
        quantite: Number(formData.quantite),
        camion_id: Number(formData.camion_id),
        chauffeur_id: Number(formData.chauffeur_id),
        client_id: Number(formData.client_id),
        destination_id: Number(formData.destination_id),
        transporteur_id: Number(formData.transporteur_id),
      };

      if (blToEdit) {
        await api.put(`/bl/${blToEdit.id}`, payload);
      } else {
        await api.post('/bl', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = Object.values(err.response.data.errors).flat().join(' • ');
        setError(`Erreur de validation : ${fieldErrors}`);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du Bon de Livraison');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {blToEdit ? `Modifier le BL #${blToEdit.numero_bl}` : 'Nouveau Bon de Livraison (BL)'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Numero BL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Numéro BL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="numero_bl"
                  required
                  value={formData.numero_bl}
                  onChange={handleChange}
                  placeholder="ex: BL-2026-0001"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                />
                {!blToEdit && (
                  <button
                    type="button"
                    onClick={generateBlNumber}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                    title="Générer automatiquement"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Date BL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date d'Émission</label>
              <input
                type="date"
                name="date_bl"
                required
                value={formData.date_bl}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            {/* Produit */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Produit Carburant</label>
              <select
                name="produit"
                value={formData.produit}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="Essence">Essence (Super)</option>
                <option value="Gasoil">Gasoil (Diesel)</option>
              </select>
            </div>

            {/* Quantite */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Quantité (Litres)</label>
              <input
                type="number"
                name="quantite"
                required
                min="1"
                step="100"
                value={formData.quantite}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
              />
            </div>

            {/* Camion */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Camion Citerne</label>
              <select
                name="camion_id"
                required
                value={formData.camion_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="">-- Sélectionner Camion --</option>
                {camions.map(c => (
                  <option key={c.id} value={c.id}>{c.immatriculation} ({c.marque} - {c.capacite}L)</option>
                ))}
              </select>
            </div>

            {/* Chauffeur */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Chauffeur Assigné</label>
              <select
                name="chauffeur_id"
                required
                value={formData.chauffeur_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="">-- Sélectionner Chauffeur --</option>
                {chauffeurs.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.nom} (Permis: {ch.numero_permis || 'N/A'})</option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Client Destinataire</label>
              <select
                name="client_id"
                required
                value={formData.client_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="">-- Sélectionner Client --</option>
                {clients.map(cli => (
                  <option key={cli.id} value={cli.id}>{cli.nom}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Destination</label>
              <select
                name="destination_id"
                required
                value={formData.destination_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="">-- Sélectionner Destination --</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.nom} ({d.region} - {d.distance}km)</option>
                ))}
              </select>
            </div>

            {/* Transporteur */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Société de Transport</label>
              <select
                name="transporteur_id"
                required
                value={formData.transporteur_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="">-- Sélectionner Transporteur --</option>
                {transporteurs.map(t => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Statut du BL</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="En cours">En cours</option>
                <option value="Livré">Livré</option>
                <option value="Liquidé">Liquidé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Observations / Remarques</label>
            <textarea
              name="observation"
              rows="2"
              value={formData.observation}
              onChange={handleChange}
              placeholder="Remarques éventuelles sur la livraison, la citerne ou le protocole..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white"
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Enregistrement...' : blToEdit ? 'Mettre à jour' : 'Créer le BL'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlFormModal;
