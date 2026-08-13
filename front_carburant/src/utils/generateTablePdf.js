import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from './logoBase64';

// Correct VFS initialization for pdfmake in Vite ESM / Webpack
const vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : (pdfFonts.vfs || pdfFonts);
pdfMake.vfs = vfs;

export const generateTablePdf = ({ title, subtitle, columns, rows, summaryText, action = 'open', filename = 'export.pdf' }) => {
  if (!rows || rows.length === 0) return;

  const nowFormatted = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isLandscape = columns.length > 5;
  const maxContentWidth = isLandscape ? 782 : 535;

  // Prepare table headers with crisp executive styling
  const tableHeaderRow = columns.map(col => ({
    text: col.header.toUpperCase(),
    fontSize: 8,
    bold: true,
    color: '#ffffff',
    fillColor: '#0f172a',
    margin: [6, 6, 6, 6],
    alignment: col.alignment || 'left'
  }));

  // Prepare table body rows with alternating row backgrounds
  const tableBodyRows = rows.map((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    const bg = isEven ? '#ffffff' : '#f8fafc';

    return columns.map(col => {
      const val = col.accessor(row);
      return {
        text: val !== undefined && val !== null ? String(val) : '',
        fontSize: 8,
        color: '#1e293b',
        fillColor: bg,
        margin: [6, 5, 6, 5],
        alignment: col.alignment || 'left',
        bold: col.bold || false
      };
    });
  });

  const columnWidths = columns.map(col => col.width || '*');

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: isLandscape ? 'landscape' : 'portrait',
    pageMargins: [30, 25, 30, 30],
    content: [
      // 1. Executive Header with Logo & Document Title Box
      {
        columns: [
          // Left: Logo & Company Name
          {
            width: '*',
            stack: [
              logoBase64 ? {
                image: logoBase64,
                width: 60,
                margin: [0, 0, 0, 3]
              } : { text: 'YES ENERGY', fontSize: 18, bold: true, color: '#2563eb' },
              { text: 'YES ENERGY GUINÉE', fontSize: 15, bold: true, color: '#0f172a', letterSpacing: 0.5 },
              { text: 'Société Guinéenne d\'Énergie & Distribution Pétrolière', fontSize: 7.5, color: '#475569', bold: true },
              { text: 'Direction des Opérations & Logistique • Conakry, Guinée', fontSize: 7, color: '#64748b' }
            ]
          },
          // Right: Document Title Box & Date
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
                          { text: title.toUpperCase(), fontSize: 11, bold: true, color: '#fbbf24', alignment: 'center' },
                          { text: subtitle || 'RAPPORT ET LISTE DE CONTRÔLE OFFICIELLE', fontSize: 7, color: '#94a3b8', alignment: 'center', margin: [0, 2, 0, 0] }
                        ],
                        fillColor: '#0f172a',
                        borderColor: ['#0f172a', '#0f172a', '#0f172a', '#0f172a'],
                        margin: [10, 6, 10, 6]
                      }
                    ]
                  ]
                }
              },
              { text: `Généré le : ${nowFormatted}`, fontSize: 7.5, bold: true, color: '#334155', margin: [0, 5, 0, 0] }
            ]
          }
        ]
      },

      // Horizontal Divider Line
      { canvas: [{ type: 'line', x1: 0, y1: 8, x2: maxContentWidth, y2: 8, lineWidth: 1.5, lineColor: '#0f172a' }] },

      // 2. Summary & Stats Banner (if provided)
      summaryText ? {
        margin: [0, 10, 0, 10],
        table: {
          widths: ['*'],
          body: [
            [
              {
                fillColor: '#f0f9ff',
                borderColor: ['#0284c7', '#0284c7', '#0284c7', '#0284c7'],
                margin: [12, 6, 12, 6],
                columns: [
                  {
                    text: summaryText,
                    fontSize: 8.5,
                    bold: true,
                    color: '#0369a1'
                  }
                ]
              }
            ]
          ]
        }
      } : { text: '', margin: [0, 4, 0, 4] },

      // 3. Data Table with Crisp Layout
      {
        table: {
          headerRows: 1,
          widths: columnWidths,
          body: [
            tableHeaderRow,
            ...tableBodyRows
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#e2e8f0'
        }
      }
    ],

    // 4. Executive Footer with Security Text & Page Counter
    footer: (currentPage, pageCount) => ({
      margin: [30, 0, 30, 10],
      columns: [
        { text: 'Document officiel sécurisé émis par GESTION BL - YES ENERGY GUINÉE', fontSize: 7, color: '#64748b' },
        { text: `Page ${currentPage} sur ${pageCount}`, fontSize: 7, bold: true, color: '#0f172a', alignment: 'right' }
      ]
    })
  };

  try {
    const pdfDoc = pdfMake.createPdf(docDefinition);

    if (action === 'download') {
      pdfDoc.download(filename);
    } else if (action === 'open') {
      const targetWindow = window.open('about:blank', '_blank');
      if (targetWindow) {
        targetWindow.document.write('<html><head><title>' + title + ' - YES ENERGY</title></head><body style="margin:0;padding:0;background:#ffffff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#64748b;"><div style="text-align:center;"><h2>Chargement de la Liste ' + title + '...</h2><p>Le document va s\'afficher dans un instant.</p></div></body></html>');
      }

      pdfDoc.getBlob((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        if (targetWindow) {
          targetWindow.location.href = blobUrl;
        } else {
          pdfDoc.download(filename);
        }
      });
    } else {
      pdfDoc.download(filename);
    }
  } catch (err) {
    console.error('generateTablePdf error:', err);
    window.print();
  }
};
