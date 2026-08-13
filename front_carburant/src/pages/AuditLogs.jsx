import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, ShieldCheck, User, Clock, Search, Terminal, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {}
    setLoading(false);
  };

  const filteredLogs = logs.filter(l =>
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPdf = () => {
    generateTablePdf({
      title: 'Journal d\'Audit & Traçabilité Sécurité',
      subtitle: 'Historique des actions, créations, modifications et suppressions système',
      summaryText: `Total : ${filteredLogs.length} Événement(s) d'audit répertorié(s)`,
      action: 'download',
      filename: 'Journal_Audit_YES_ENERGY.pdf',
      columns: [
        { header: 'Horodatage', accessor: (l) => l.created_at, width: 'auto' },
        { header: 'Utilisateur', accessor: (l) => l.user_name || 'Système', bold: true, width: 'auto' },
        { header: 'Action', accessor: (l) => l.action, alignment: 'center', bold: true, width: 'auto' },
        { header: 'Module', accessor: (l) => (l.table_name || '-').toUpperCase(), width: 'auto' },
        { header: 'Détails & Description', accessor: (l) => l.details || '-', width: '*' },
        { header: 'Adresse IP', accessor: (l) => l.ip_address || '-', width: 'auto' }
      ],
      rows: filteredLogs
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Journal des Activités & Audit Trail
          </h2>
          <p className="text-sm text-slate-400">Traçabilité complète des événements et modifications effectuées dans le système</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche utilisateur, action, détail..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Horodatage</th>
              <th className="py-3.5 px-4">Utilisateur</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Module / Table</th>
              <th className="py-3.5 px-4">Détails & Description</th>
              <th className="py-3.5 px-4">Adresse IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500 font-sans">Chargement des logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500 font-sans">Aucun log d'activité enregistré.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{log.created_at}</td>
                  <td className="py-3.5 px-4 text-purple-300 font-semibold">{log.user_name || 'Système'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'CREATE' || log.action === 'CREATE_USER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.action === 'DELETE' || log.action === 'DELETE_USER' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      log.action === 'LIQUIDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-bold uppercase">{log.table_name || '-'}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-200">{log.details}</td>
                  <td className="py-3.5 px-4 text-slate-500">{log.ip_address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
