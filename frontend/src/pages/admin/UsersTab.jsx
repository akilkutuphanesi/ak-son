import React, { useState } from 'react';
import { Edit, Ban, CheckCircle, X } from 'lucide-react';

export default function UsersTab() {
  const [users, setUsers] = useState([
    { id: 1, name: "Ahmet Yılmaz", no: "2024101", dept: "Bilgisayar Müh.", role: "User", status: "Aktif" },
    { id: 2, name: "Zeynep Kaya", no: "2024102", dept: "Yazılım Müh.", role: "Admin", status: "Aktif" },
    { id: 3, name: "Caner Uysal", no: "2024103", dept: "Makine Müh.", role: "User", status: "Banlı" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', no: '', dept: 'Bilgisayar Müh.', role: 'User', status: 'Aktif' });

  const handleToggleBan = (id) => setUsers(users.map(user => user.id === id ? { ...user, status: user.status === 'Aktif' ? 'Banlı' : 'Aktif' } : user));
  
  const handleOpenModal = (user = null) => {
    if (user) { setFormData(user); setEditingId(user.id); } 
    else { setFormData({ name: '', no: '', dept: 'Bilgisayar Müh.', role: 'User', status: 'Aktif' }); setEditingId(null); }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingId) setUsers(users.map(user => user.id === editingId ? { ...formData, id: editingId } : user));
    else setUsers([...users, { ...formData, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">Öğrenci Veritabanı</h2>
      
      {/* KULLANICI MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#121826] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Ad Soyad</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Öğrenci No</label><input required type="text" name="no" value={formData.no} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-4">{editingId ? 'Güncelle' : 'Kaydet'}</button>
            </form>
          </div>
        </div>
      )}

      {/* TABLO */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Kullanıcı Yönetimi</h3>
          <button onClick={() => handleOpenModal()} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-lg">Yeni Kullanıcı Ekle</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="pb-3">Öğrenci No</th><th className="pb-3">Ad Soyad</th><th className="pb-3">Bölüm</th><th className="pb-3">Rol</th><th className="pb-3">Durum</th><th className="pb-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {users.map((user) => (
              <tr key={user.id} className={`border-b border-white/5 hover:bg-white/[0.02] ${user.status === 'Banlı' ? 'opacity-50' : ''}`}>
                <td className="py-4 font-mono">{user.no}</td><td className="py-4 font-bold text-white">{user.name}</td><td className="py-4">{user.dept}</td>
                <td className="py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>{user.role}</span></td>
                <td className="py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${user.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                <td className="py-4 flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleToggleBan(user.id)} className={`p-2 rounded-lg ${user.status === 'Aktif' ? 'text-slate-400 hover:text-red-400' : 'text-red-400 hover:text-emerald-400'}`}>
                    {user.status === 'Aktif' ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}