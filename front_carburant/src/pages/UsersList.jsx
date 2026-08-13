import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Plus, Edit, Trash2, X, Upload, Download } from 'lucide-react';
import { generateTablePdf } from '../utils/generateTablePdf';
import { getAvatarUrl } from '../utils/avatar';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consultation');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role || 'consultation');
      setSelectedFile(null);
      setPreviewUrl(user.avatar || '');
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('password');
      setRole('exploitation');
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) formData.append('password', password);
      formData.append('role', role);
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      if (editingUser) {
        await api.post(`/users/${editingUser.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur d\'enregistrement de l\'utilisateur');
    }
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Supprimer l'utilisateur ${userName} ?`)) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleExportPdf = () => {
    generateTablePdf({
      title: 'Liste des Utilisateurs et Privilèges',
      subtitle: 'Administration du personnel et habilitations sur l\'application GESTION BL',
      summaryText: `Total : ${users.length} Compte(s) d'utilisateur actif(s)`,
      action: 'download',
      filename: 'Liste_Utilisateurs_YES_ENERGY.pdf',
      columns: [
        { header: 'Nom et Prénom', accessor: (u) => u.name, bold: true, width: '*' },
        { header: 'Adresse Email', accessor: (u) => u.email, width: '*' },
        { header: 'Rôle & Privilèges', accessor: (u) => (u.role || '').toUpperCase(), alignment: 'center', bold: true, width: 'auto' },
        { header: 'Date de Création', accessor: (u) => new Date(u.created_at).toLocaleDateString('fr-FR'), alignment: 'center', width: 'auto' }
      ],
      rows: users
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Administration des Utilisateurs & Photos Réelles
          </h2>
          <p className="text-sm text-slate-400">Gestion des comptes, privilèges et photos d'identité des utilisateurs</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exporter PDF</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Photo</th>
              <th className="py-3.5 px-4">Nom Complet</th>
              <th className="py-3.5 px-4">Adresse Email</th>
              <th className="py-3.5 px-4">Rôle Attribué</th>
              <th className="py-3.5 px-4">Date de Création</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Chargement...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <img
                      src={getAvatarUrl(u.avatar, u.name)}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-purple-400"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      u.role === 'exploitation' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(u)} className="p-1.5 bg-slate-800 text-blue-400 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 bg-slate-800 text-red-400 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit User Modal with Photo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-lg font-bold text-white">{editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Photo Input */}
              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <img
                  src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=f59e0b&color=000`}
                  alt="Aperçu"
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-400"
                />
                <div className="flex-1">
                  <label className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir une photo (appareil)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">Image réelle (JPG/PNG)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom et Prénom</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mot de Passe {editingUser && '(Laisser vide pour conserver)'}</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rôle & Privilèges</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-sm text-white"
                >
                  <option value="admin">Admin (Accès Total & Utilisateurs)</option>
                  <option value="exploitation">Exploitation (Création, Édition, Liquidation)</option>
                  <option value="consultation">Consultation (Lecture seule)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold cursor-pointer">Enregistrer l'Utilisateur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
