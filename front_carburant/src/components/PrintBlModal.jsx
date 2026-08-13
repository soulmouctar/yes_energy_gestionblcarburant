import React, { useState, useEffect } from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { generateBlPdf } from '../utils/generateBlPdf';

const PrintBlModal = ({ bl, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);

  useEffect(() => {
    if (bl) {
      const quantiteFormatee = Number(bl.quantite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');
      const qrDataText = `YES ENERGY GUINÉE — VERIFICATION BL
N° BL: ${bl.numero_bl || ''}
Date: ${bl.date_bl || ''}
Produit: ${bl.produit || ''}
Quantité: ${quantiteFormatee} Litres
Client: ${bl.client?.nom || ''}
Camion: ${bl.camion?.immatriculation || ''}
Transporteur: ${bl.transporteur?.nom || ''}
Chauffeur: ${bl.chauffeur?.nom || ''}
Statut: ${bl.statut || ''}
Vérification: https://apiyesenergy.ddevstock.com/verify/${bl.numero_bl || ''}`;

      QRCode.toDataURL(qrDataText, { margin: 1, width: 160 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR error:', err));
    }
  }, [bl]);

  if (!bl) return null;

  // PDF Download via pdfMake
  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generateBlPdf(bl, 'download', qrCodeDataUrl);
    } catch (e) {
      console.error('pdfmake download error:', e);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  const quantiteFormatee = Number(bl.quantite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');
  const capaciteFormatee = Number(bl.camion?.capacite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo_yes_energy.png" alt="YES ENERGY" className="w-8 h-8 object-contain" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Fiche Officielle du Bon de Livraison #{bl.numero_bl}
              </h3>
              <p className="text-xs text-slate-400">GESTION BL • Document PDF Vectoriel & QR Code Valide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{downloading ? 'Génération...' : 'Télécharger PDF HD'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* On-screen Printable Preview Container */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 flex flex-col justify-between print-container" id="printable-bl-area">
          
          <div>
            {/* Executive Header with Official Logo & Real QR Code */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src="/logo_yes_energy.png"
                  alt="YES ENERGY Logo"
                  className="w-18 h-18 object-contain shrink-0"
                />
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">YES ENERGY</h1>
                  <p className="text-xs text-red-600 font-extrabold tracking-widest uppercase">LA RÉFÉRENCE NATIONALE</p>
                  <p className="text-xs text-slate-700 font-semibold mt-1">Société Guinéenne d'Énergie & Distribution Pétrolière</p>
                  <p className="text-[11px] text-slate-500 font-mono">Dépôt Central de Carburants • Conakry, République de Guinée • Tél: +224 622 00 00 00</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                {/* REAL SCANNABLE QR CODE IMAGE */}
                {qrCodeDataUrl ? (
                  <div className="w-20 h-20 bg-white border-2 border-slate-900 p-1 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <img src={qrCodeDataUrl} alt="Vérification QR Code" className="w-full h-full object-contain" />
                    <span className="text-[7px] font-mono font-black text-slate-900 mt-0.5">SCANNER QR</span>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-slate-50 border-2 border-slate-900 p-1 rounded-xl flex items-center justify-center text-[8px] font-mono">
                    QR SCAN
                  </div>
                )}

                <div>
                  <div className="inline-block bg-slate-900 text-white border border-slate-900 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-[9px] font-bold text-slate-300 uppercase block tracking-wider">BON DE LIVRAISON</span>
                    <span className="text-xl font-black font-mono tracking-wider text-amber-400">{bl.numero_bl}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-1.5">Date d'Émission : <span className="font-mono text-slate-900">{bl.date_bl}</span></p>
                </div>
              </div>
            </div>

            {/* Product Banner */}
            <div className={`p-4 rounded-2xl mb-6 border-2 flex justify-between items-center ${bl.produit === 'Essence' ? 'bg-amber-50 border-amber-400 text-amber-950' : 'bg-blue-50 border-blue-400 text-blue-950'}`}>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest block opacity-80">Produit Pétrolier Transporté</span>
                <span className="text-2xl font-black uppercase tracking-wide">{bl.produit}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold uppercase tracking-widest block opacity-80">Volume Chargé au Dépôt</span>
                <span className="text-3xl font-black font-mono">{quantiteFormatee} LITRES</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              {/* Left Column: Transporteur & Camion */}
              <div className="border-2 border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-3">
                <h4 className="font-black text-xs uppercase text-slate-800 tracking-wider border-b-2 border-slate-300 pb-2 flex items-center justify-between">
                  <span>1. Transporteur & Camion Citerne</span>
                  <span className="text-[10px] text-slate-500 font-mono">SOC-TRP</span>
                </h4>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Société de Transport</p>
                  <p className="font-black text-slate-900 text-base">{bl.transporteur?.nom || 'N/A'}</p>
                  <p className="text-xs text-slate-600 font-medium">Responsable: {bl.transporteur?.responsable} ({bl.transporteur?.telephone})</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Camion Citerne Habilité</p>
                  <p className="font-black text-slate-900 font-mono text-base">{bl.camion?.immatriculation || 'N/A'}</p>
                  <p className="text-xs text-slate-600 font-medium">{bl.camion?.marque} • Capacité Totale: {capaciteFormatee} L</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Chauffeur Conducteur</p>
                  <p className="font-black text-slate-900 text-base">{bl.chauffeur?.nom || 'N/A'}</p>
                  <p className="text-xs text-slate-600 font-medium">Permis N°: {bl.chauffeur?.numero_permis} (Tél: {bl.chauffeur?.telephone})</p>
                </div>
              </div>

              {/* Right Column: Client & Destination */}
              <div className="border-2 border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-3">
                <h4 className="font-black text-xs uppercase text-slate-800 tracking-wider border-b-2 border-slate-300 pb-2 flex items-center justify-between">
                  <span>2. Client & Lieu de Livraison</span>
                  <span className="text-[10px] text-slate-500 font-mono">CLI-DEST</span>
                </h4>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Client Destinataire</p>
                  <p className="font-black text-slate-900 text-base">{bl.client?.nom || 'N/A'}</p>
                  <p className="text-xs text-slate-600 font-medium">{bl.client?.adresse} • Tél: {bl.client?.telephone}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Lieu de Livraison (Destination)</p>
                  <p className="font-black text-slate-900 text-base">{bl.destination?.nom || 'N/A'}</p>
                  <p className="text-xs text-slate-600 font-medium">Région: {bl.destination?.region} • Distance: {bl.destination?.distance} km</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase">Statut Administratif & Liquidation</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-black px-3 py-0.5 rounded-lg text-xs bg-slate-900 text-white uppercase">{bl.statut}</span>
                    {bl.date_liquidation && <span className="text-xs text-slate-700 font-semibold">Liquidé le: <strong>{bl.date_liquidation}</strong></span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            {bl.observation && (
              <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl">
                <span className="text-xs font-black uppercase text-slate-800 block mb-1">Observations & Consignes de Chargement Dépôt</span>
                <p className="text-xs text-slate-800 italic font-medium">{bl.observation}</p>
              </div>
            )}

            {/* Signatures Area (Returned to original position in body flow) */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 text-center mb-6">
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
                <p className="text-xs font-black uppercase text-slate-800 mb-12">Le Chef de Dépôt (Émetteur)</p>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">Signature & Cachet Officiel</p>
              </div>
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
                <p className="text-xs font-black uppercase text-slate-800 mb-12">Le Chauffeur Conducteur</p>
                <p className="text-[10px] text-slate-700 font-mono font-black">{bl.chauffeur?.nom}</p>
              </div>
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
                <p className="text-xs font-black uppercase text-slate-800 mb-12">Le Client Réceptionnaire</p>
                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">Nom, Date & Cachet de Réception</p>
              </div>
            </div>
          </div>

          {/* EXCLUSIVE SECURITY & VERIFICATION FOOTER AT THE VERY BOTTOM */}
          <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 mt-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Document officiel sécurisé avec QR Code scannable émis par GESTION BL - YES ENERGY GUINÉE</span>
            </div>
            <p className="font-mono font-bold">ID-VERIF: {bl.id}-{bl.numero_bl}-{bl.date_bl}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrintBlModal;
