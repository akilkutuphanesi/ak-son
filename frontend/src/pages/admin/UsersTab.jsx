import React, { useState, useEffect } from 'react';
import { Edit, Ban, CheckCircle, X, Loader2 } from 'lucide-react';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          const mappedUsers = data.map(u => ({
            id: u.id,
            name: u.display_name || u.email.split('@')[0],
            email: u.email,
            no: u.id.toString(),
            dept: u.department || "Belirtilmemiş",
            role: u.is_admin ? "Admin" : "User",
            status: u.is_active ? "Aktif" : "Banlı",
            reputation: u.reputation || 0,
            badge: u.badge || "Çaylak"
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error("Kullanıcılar çekilemedi", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', no: '', dept: 'Bilgisayar Müh.', role: 'User', status: 'Aktif', reputation: 0, badge: 'Çaylak' });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const toggleSelectUser = (id) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  
  const handleBulkDelete = async () => {
    if(window.confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinize emin misiniz?`)) {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/users/bulk-delete`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedUsers })
        });
        if (res.ok) {
          setUsers(users.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
        }
      } catch (e) {
        console.error("Bulk delete error", e);
      }
    }
  };

  const handleToggleBan = (id) => setUsers(users.map(user => user.id === id ? { ...user, status: user.status === 'Aktif' ? 'Banlı' : 'Aktif' } : user));
  
  const handleOpenModal = (user = null) => {
    if (user) { setFormData(user); setEditingId(user.id); } 
    else { setFormData({ name: '', email: '', no: '', dept: 'Bilgisayar Müh.', role: 'User', status: 'Aktif', reputation: 0, badge: 'Çaylak' }); setEditingId(null); }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        if (editingId) {
            const res = await fetch(`${API_BASE}/admin/users/${editingId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name, email: formData.email, no: formData.no, 
                    dept: formData.dept, reputation: parseInt(formData.reputation) || 0, badge: formData.badge
                })
            });
            if (res.ok) setUsers(users.map(user => user.id === editingId ? { ...formData, id: editingId } : user));
        } else {
            // Yeni kullanıcı ekleme işlemi için backend bağlantısı eklenebilir, şimdilik UI güncellenir
            setUsers([...users, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    } catch(err) {
        console.error("Save error", err);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">Öğrenci Veritabanı</h2>
      
      {/* KULLANICI MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161b2c] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-[11px] font-bold text-slate-400 uppercase">Ad Soyad</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
                <div className="col-span-2"><label className="text-[11px] font-bold text-slate-400 uppercase">E-posta</label><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
                <div><label className="text-[11px] font-bold text-slate-400 uppercase">Öğrenci No</label><input required type="text" name="no" value={formData.no} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
                <div><label className="text-[11px] font-bold text-slate-400 uppercase">Puan</label><input required type="number" name="reputation" value={formData.reputation} onChange={handleInputChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none" /></div>
                <div className="col-span-2"><label className="text-[11px] font-bold text-slate-400 uppercase">Rozet</label>
                  <select name="badge" value={formData.badge} onChange={handleInputChange} className="mt-1 w-full bg-[#161b2c] border border-white/10 rounded-xl py-3 px-4 text-white outline-none">
                    <option value="Çaylak">Çaylak</option>
                    <option value="Deneyimli">Deneyimli</option>
                    <option value="Bilge">Bilge</option>
                    <option value="Moderatör">Moderatör</option>
                    <option value="Efsane">Efsane</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-4">{editingId ? 'Güncelle' : 'Kaydet'}</button>
            </form>
          </div>
        </div>
      )}

      {/* TABLO */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Kullanıcı Yönetimi</h3>
          <div className="flex gap-3">
            {selectedUsers.length > 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4">
                <span className="text-sm text-red-400 font-bold">{selectedUsers.length} seçili</span>
                <div className="w-px h-4 bg-red-500/20 mx-1"></div>
                <button onClick={handleBulkDelete} className="text-xs font-bold text-red-400 hover:text-white transition-colors">Sil</button>
              </div>
            )}
            <button onClick={() => handleOpenModal()} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-lg">Yeni Kullanıcı Ekle</button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="pb-3 w-10 text-center"><input type="checkbox" checked={selectedUsers.length > 0 && selectedUsers.length === users.length} onChange={toggleSelectAll} className="accent-red-500 cursor-pointer w-4 h-4" /></th>
              <th className="pb-3">Öğrenci No</th><th className="pb-3">Ad Soyad</th><th className="pb-3">E-posta</th><th className="pb-3">Bölüm</th><th className="pb-3">Puan/Rozet</th><th className="pb-3">Durum</th><th className="pb-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {isLoading ? (
              <tr><td colSpan="7" className="py-12 text-center text-slate-400"><Loader2 className="animate-spin inline-block mr-2" size={24} />Kullanıcılar Yükleniyor...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">Kayıtlı kullanıcı bulunamadı.</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className={`border-b border-white/10 hover:bg-white/[0.02] ${user.status === 'Banlı' ? 'opacity-50' : ''}`}>
                <td className="py-4 text-center"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="accent-red-500 cursor-pointer w-4 h-4" /></td>
                <td className="py-4 font-mono">{user.no}</td><td className="py-4 font-bold text-white">{user.name}</td><td className="py-4 text-slate-400">{user.email}</td><td className="py-4">{user.dept}</td>
                <td className="py-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-yellow-400 font-bold text-xs flex items-center gap-1">{user.reputation} Puan</span>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">{user.badge}</span>
                  </div>
                </td>
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