import React from 'react';
import { X, Printer, Fuel, ShieldCheck, Download, QrCode } from 'lucide-react';

const PrintBlModal = ({ bl, onClose }) => {
  if (!bl) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print bg-slate-950/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            Impression Officielle du Bon de Livraison #{bl.numero_bl}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer le BL (Format A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print-container" id="printable-bl-area">
          {/* Header Document */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow">
                SGP
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Société Guinéenne de Pétrole</h1>
                <p className="text-xs text-slate-600 font-medium">Dépôt Central de Carburants • Conakry, République de Guinée</p>
                <p className="text-xs text-slate-500">Tél: +224 622 00 00 00 • Email: bl@sgp-carburant.gn</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              {/* QR Code Scan Verification Box */}
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 p-1 rounded-lg flex flex-col items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11 0h2v2h-2v-2zm-3-2h2v2h-2v-2zm4 0h4v2h-4v-2zm-2 4h2v4h-2v-4zm4 0h2v2h-2v-2zm0 2h2v2h-2v-2z"/>
                </svg>
                <span className="text-[8px] font-mono font-bold text-slate-600">SCAN QR</span>
              </div>

              <div>
                <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">BON DE LIVRAISON</span>
                  <span className="text-xl font-black text-slate-900 font-mono tracking-wider">{bl.numero_bl}</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">Émis le : <span className="font-bold text-slate-900">{bl.date_bl}</span></p>
              </div>
            </div>
          </div>

          {/* Product Banner */}
          <div className={`p-4 rounded-xl mb-6 border flex justify-between items-center ${bl.produit === 'Essence' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-blue-50 border-blue-300 text-blue-900'}`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest block opacity-75">Produit Pétrolier Transporté</span>
              <span className="text-2xl font-extrabold uppercase tracking-wide">{bl.produit}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest block opacity-75">Volume Chargé au Dépôt</span>
              <span className="text-3xl font-black font-mono">{Number(bl.quantite).toLocaleString('fr-FR')} LITRES</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            {/* Left Column */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">Informations Transporteur & Camion</h4>
              <div>
                <p className="text-xs text-slate-500 font-medium">Société de Transport</p>
                <p className="font-bold text-slate-900">{bl.transporteur?.nom || 'N/A'}</p>
                <p className="text-xs text-slate-600">Resp: {bl.transporteur?.responsable} ({bl.transporteur?.telephone})</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Camion Citerne Habilité</p>
                <p className="font-bold text-slate-900 font-mono text-base">{bl.camion?.immatriculation || 'N/A'}</p>
                <p className="text-xs text-slate-600">{bl.camion?.marque} • Capacité: {Number(bl.camion?.capacite || 0).toLocaleString('fr-FR')} L</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Chauffeur Assigné</p>
                <p className="font-bold text-slate-900">{bl.chauffeur?.nom || 'N/A'}</p>
                <p className="text-xs text-slate-600">Permis N°: {bl.chauffeur?.numero_permis} (Tél: {bl.chauffeur?.telephone})</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">Informations Client & Destination</h4>
              <div>
                <p className="text-xs text-slate-500 font-medium">Client Destinataire</p>
                <p className="font-bold text-slate-900">{bl.client?.nom || 'N/A'}</p>
                <p className="text-xs text-slate-600">{bl.client?.adresse} • Tél: {bl.client?.telephone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Lieu de Livraison (Destination)</p>
                <p className="font-bold text-slate-900">{bl.destination?.nom || 'N/A'}</p>
                <p className="text-xs text-slate-600">Région: {bl.destination?.region} • Distance: {bl.destination?.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Statut Administratif & Dates</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold px-2.5 py-0.5 rounded text-xs bg-slate-900 text-white uppercase">{bl.statut}</span>
                  {bl.date_liquidation && <span className="text-xs text-slate-600">Liquidé le: <strong>{bl.date_liquidation}</strong></span>}
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          {bl.observation && (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Observations & Consignes Dépôt</span>
              <p className="text-xs text-slate-700 italic">{bl.observation}</p>
            </div>
          )}

          {/* Signatures Area */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200 text-center">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-12">Le Chef de Dépôt (Émetteur)</p>
              <p className="text-[10px] text-slate-400 font-mono">Signature & Cachet Officiel</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-12">Le Chauffeur Transporteur</p>
              <p className="text-[10px] text-slate-400 font-mono font-semibold">{bl.chauffeur?.nom}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-12">Le Client Réceptionnaire</p>
              <p className="text-[10px] text-slate-400 font-mono">Nom, Date & Cachet de Réception</p>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Document sécurisé généré par le Système Officiel de Gestion des BL Carburants</span>
            </div>
            <p className="font-mono">ID-VERIF: {bl.id}-{bl.numero_bl}-{bl.date_bl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBlModal;
