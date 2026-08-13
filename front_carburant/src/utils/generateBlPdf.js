import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from './logoBase64';

// Correct VFS initialization for pdfmake in Vite ESM / Webpack
const vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : (pdfFonts.vfs || pdfFonts);
pdfMake.vfs = vfs;

export const buildDocDefinition = (bl, qrCodeBase64) => {
  const isEssence = bl.produit === 'Essence';
  const themeColor = isEssence ? '#d97706' : '#2563eb'; // Amber Gold or Royal Blue
  const themeBgColor = isEssence ? '#fffbeb' : '#eff6ff';
  const themeBorderColor = isEssence ? '#f59e0b' : '#3b82f6';

  // Format quantities with strict spaces
  const quantiteFormatee = Number(bl.quantite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');
  const capaciteFormatee = Number(bl.camion?.capacite || 0).toLocaleString('fr-FR').replace(/\u8998/g, ' ');

  return {
    pageSize: 'A4',
    pageMargins: [35, 25, 35, 30],
    content: [
      // 1. Executive Top Header Banner
      {
        columns: [
          // Left Column: Official Logo Image & Company Subtitles
          {
            width: '*',
            stack: [
              logoBase64 ? {
                image: logoBase64,
                width: 70,
                margin: [0, 0, 0, 4]
              } : { text: 'YES ENERGY', fontSize: 20, bold: true, color: '#2563eb' },
              { text: 'YES ENERGY GUINÉE', fontSize: 16, bold: true, color: '#0f172a', letterSpacing: 0.5 },
              { text: 'LA RÉFÉRENCE NATIONALE', fontSize: 8, bold: true, color: '#dc2626', margin: [0, 1, 0, 2] },
              { text: 'Société Guinéenne d\'Énergie & Distribution Pétrolière', fontSize: 7.5, color: '#334155', bold: true },
              { text: 'Dépôt Central de Carburants • Conakry, Guinée • Tél: +224 622 00 00 00', fontSize: 7, color: '#64748b', margin: [0, 1, 0, 0] }
            ]
          },
          // Middle Column: Real Valid Scannable QR Code Image
          qrCodeBase64 ? {
            width: 'auto',
            alignment: 'center',
            margin: [10, 0, 10, 0],
            stack: [
              {
                image: qrCodeBase64,
                width: 62,
                height: 62,
                alignment: 'center'
              },
              { text: 'SCANNER QR VERIF', fontSize: 6.5, bold: true, color: '#64748b', alignment: 'center', margin: [0, 2, 0, 0] }
            ]
          } : { width: 0, text: '' },
          // Right Column: Official BL Document Number Box & Date
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              {
                table: {
                  body: [
                    [
                      {
                        stack: [
                          { text: 'BON DE LIVRAISON', fontSize: 7.5, bold: true, color: '#94a3b8', alignment: 'center' },
                          { text: bl.numero_bl || 'BL-0000', fontSize: 13, bold: true, color: '#fbbf24', alignment: 'center', margin: [0, 2, 0, 0] }
                        ],
                        fillColor: '#0f172a',
                        borderColor: ['#0f172a', '#0f172a', '#0f172a', '#0f172a'],
                        margin: [10, 6, 10, 6]
                      }
                    ]
                  ]
                }
              },
              { text: `Date d'Émission : ${bl.date_bl || ''}`, fontSize: 8, bold: true, color: '#334155', margin: [0, 6, 0, 0] }
            ]
          }
        ]
      },

      // Horizontal Executive Accent Line
      { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 525, y2: 10, lineWidth: 2, lineColor: '#0f172a' }] },

      // 2. Product & Quantity Highlight Banner
      {
        margin: [0, 12, 0, 12],
        table: {
          widths: ['*'],
          body: [
            [
              {
                fillColor: themeBgColor,
                borderColor: [themeBorderColor, themeBorderColor, themeBorderColor, themeBorderColor],
                margin: [14, 10, 14, 10],
                columns: [
                  {
                    stack: [
                      { text: 'PRODUIT PÉTROLIER TRANSPORTÉ', fontSize: 7.5, bold: true, color: '#475569' },
                      { text: (bl.produit || '').toUpperCase(), fontSize: 16, bold: true, color: themeColor, margin: [0, 2, 0, 0] }
                    ]
                  },
                  {
                    alignment: 'right',
                    stack: [
                      { text: 'VOLUME TOTAL CHARGÉ AU DÉPÔT', fontSize: 7.5, bold: true, color: '#475569' },
                      { text: `${quantiteFormatee} LITRES`, fontSize: 18, bold: true, color: '#0f172a', margin: [0, 2, 0, 0] }
                    ]
                  }
                ]
              }
            ]
          ]
        }
      },

      // 3. Two Column Executive Details Section
      {
        columns: [
          // Left Box: Transporteur & Camion
          {
            width: '49%',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    fillColor: '#f8fafc',
                    borderColor: ['#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1'],
                    margin: [10, 8, 10, 8],
                    stack: [
                      { text: '1. TRANSPORTEUR & CAMION CITERNE', fontSize: 8, bold: true, color: '#0f172a', margin: [0, 0, 0, 4] },
                      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 230, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }] },
                      
                      { text: 'Société de Transport :', fontSize: 7.5, color: '#64748b', margin: [0, 5, 0, 1] },
                      { text: bl.transporteur?.nom || 'N/A', fontSize: 9.5, bold: true, color: '#0f172a' },
                      { text: `Responsable: ${bl.transporteur?.responsable || ''} (${bl.transporteur?.telephone || ''})`, fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 5] },

                      { text: 'Camion Citerne Habilité :', fontSize: 7.5, color: '#64748b', margin: [0, 3, 0, 1] },
                      { text: bl.camion?.immatriculation || 'N/A', fontSize: 9.5, bold: true, color: '#2563eb' },
                      { text: `${bl.camion?.marque || ''} • Capacité: ${capaciteFormatee} L`, fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 5] },

                      { text: 'Chauffeur Conducteur :', fontSize: 7.5, color: '#64748b', margin: [0, 3, 0, 1] },
                      { text: bl.chauffeur?.nom || 'N/A', fontSize: 9, bold: true, color: '#0f172a' },
                      { text: `Permis N°: ${bl.chauffeur?.numero_permis || ''} (Tél: ${bl.chauffeur?.telephone || ''})`, fontSize: 7.5, color: '#475569' }
                    ]
                  }
                ]
              ]
            }
          },
          { width: '2%', text: '' },
          // Right Box: Client & Destination
          {
            width: '49%',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    fillColor: '#f8fafc',
                    borderColor: ['#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1'],
                    margin: [10, 8, 10, 8],
                    stack: [
                      { text: '2. CLIENT & LIEU DE LIVRAISON', fontSize: 8, bold: true, color: '#0f172a', margin: [0, 0, 0, 4] },
                      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 230, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }] },
                      
                      { text: 'Client Destinataire :', fontSize: 7.5, color: '#64748b', margin: [0, 5, 0, 1] },
                      { text: bl.client?.nom || 'N/A', fontSize: 9.5, bold: true, color: '#0f172a' },
                      { text: `${bl.client?.adresse || ''} • Tél: ${bl.client?.telephone || ''}`, fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 5] },

                      { text: 'Lieu de Livraison (Destination) :', fontSize: 7.5, color: '#64748b', margin: [0, 3, 0, 1] },
                      { text: bl.destination?.nom || 'N/A', fontSize: 9.5, bold: true, color: '#0f172a' },
                      { text: `Région: ${bl.destination?.region || ''} • Distance: ${bl.destination?.distance || 0} km`, fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 5] },

                      { text: 'Statut Administratif & Liquidation :', fontSize: 7.5, color: '#64748b', margin: [0, 3, 0, 1] },
                      { text: (bl.statut || '').toUpperCase(), fontSize: 9, bold: true, color: '#059669' },
                      { text: bl.date_liquidation ? `Liquidé le: ${bl.date_liquidation}` : 'Non encore liquidé', fontSize: 7.5, color: '#475569' }
                    ]
                  }
                ]
              ]
            }
          }
        ]
      },

      // 4. Observations & Special Notes Box
      bl.observation ? {
        margin: [0, 10, 0, 0],
        table: {
          widths: ['*'],
          body: [
            [
              {
                fillColor: '#f1f5f9',
                borderColor: ['#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1'],
                margin: [10, 6, 10, 6],
                stack: [
                  { text: 'OBSERVATIONS & CONSIGNES SPÉCIALES DÉPÔT', fontSize: 7.5, bold: true, color: '#334155' },
                  { text: bl.observation, fontSize: 8, italics: true, color: '#0f172a', margin: [0, 2, 0, 0] }
                ]
              }
            ]
          ]
        }
      } : { text: '', margin: [0, 0, 0, 0] },

      // 5. Signatures & Approvals Section (Restored in flow)
      {
        margin: [0, 18, 0, 0],
        columns: [
          {
            width: '32%',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    height: 62,
                    fillColor: '#ffffff',
                    borderColor: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
                    margin: [6, 6, 6, 6],
                    stack: [
                      { text: 'Chef de Dépôt (Émetteur)', fontSize: 7.5, bold: true, alignment: 'center', color: '#0f172a' },
                      { text: 'Signature & Cachet Officiel', fontSize: 6.5, color: '#94a3b8', alignment: 'center', margin: [0, 32, 0, 0] }
                    ]
                  }
                ]
              ]
            }
          },
          { width: '2%', text: '' },
          {
            width: '32%',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    height: 62,
                    fillColor: '#ffffff',
                    borderColor: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
                    margin: [6, 6, 6, 6],
                    stack: [
                      { text: 'Chauffeur Conducteur', fontSize: 7.5, bold: true, alignment: 'center', color: '#0f172a' },
                      { text: bl.chauffeur?.nom || '', fontSize: 7.5, bold: true, alignment: 'center', color: '#334155', margin: [0, 30, 0, 0] }
                    ]
                  }
                ]
              ]
            }
          },
          { width: '2%', text: '' },
          {
            width: '32%',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    height: 62,
                    fillColor: '#ffffff',
                    borderColor: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
                    margin: [6, 6, 6, 6],
                    stack: [
                      { text: 'Client Réceptionnaire', fontSize: 7.5, bold: true, alignment: 'center', color: '#0f172a' },
                      { text: 'Nom, Date & Cachet', fontSize: 6.5, color: '#94a3b8', alignment: 'center', margin: [0, 32, 0, 0] }
                    ]
                  }
                ]
              ]
            }
          }
        ]
      }
    ],

    // 6. Security Footer Line strictly at the bottom of the page
    footer: function(currentPage, pageCount) {
      return {
        margin: [35, 0, 35, 10],
        columns: [
          { text: 'Document officiel sécurisé avec QR Code scannable émis par GESTION BL - YES ENERGY GUINÉE', fontSize: 7, color: '#64748b' },
          { text: `ID-VERIF: ${bl.id}-${bl.numero_bl}-${bl.date_bl}`, fontSize: 7, bold: true, color: '#0f172a', alignment: 'right' }
        ]
      };
    }
  };
};

export const generateBlPdf = (bl, action = 'download', qrCodeBase64 = null) => {
  if (!bl) return;

  try {
    const docDefinition = buildDocDefinition(bl, qrCodeBase64);
    const pdfDoc = pdfMake.createPdf(docDefinition);

    if (action === 'download') {
      pdfDoc.download(`BL_YES_ENERGY_${bl.numero_bl}.pdf`);
    } else if (action === 'open') {
      // Synchronously open clean white tab with PDF viewer
      const targetWindow = window.open('about:blank', '_blank');
      if (targetWindow) {
        targetWindow.document.write('<html><head><title>Impression Bon de Livraison YES ENERGY</title></head><body style="margin:0;padding:0;background:#ffffff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#64748b;"><div style="text-align:center;"><h2>Chargement du Document PDF YES ENERGY...</h2><p>Le document va s\'afficher dans un instant.</p></div></body></html>');
      }

      pdfDoc.getBlob((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        if (targetWindow) {
          targetWindow.location.href = blobUrl;
        } else {
          pdfDoc.download(`BL_YES_ENERGY_${bl.numero_bl}.pdf`);
        }
      });
    } else {
      pdfDoc.download(`BL_YES_ENERGY_${bl.numero_bl}.pdf`);
    }
  } catch (err) {
    console.error('generateBlPdf execution error:', err);
    if (action === 'open') window.print();
  }
};
