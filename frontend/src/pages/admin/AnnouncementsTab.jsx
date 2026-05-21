import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit, X, Pin, PinOff, CheckCircle2, Clock, AlertCircle, Globe } from 'lucide-react';


const PRIORITY_CONFIG = {
  'yüksek': { label: 'Yüksek', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'orta':   { label: 'Orta',   class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'düşük':  { label: 'Düşük',  class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const STATUS_CONFIG = {
  'Yayında': { icon: <CheckCircle2 size={12}/>, class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Taslak':  { icon: <Clock size={12}/>,        class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const EMPTY_FORM = {
  title: '', content: '', target: 'Tüm Kullanıcılar', priority: 'orta', status: 'Taslak', pinned: false,
};

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('Tümü');

  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/announcements`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) setAnnouncements(await res.json());
      } catch(err) { console.error(err); }
    };
    fetchAnn();
  }, []);

  const targets = ['Tüm Kullanıcılar', 'Tüm Öğrenciler', 'Bilgisayar Müh.', 'Yazılım Müh.', 'Makine Müh.', 'Elektrik-Elektronik Müh.'];

  const filtered = filter === 'Tümü'
    ? announcements
    : announcements.filter(a => a.status === filter);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (ann) => {
    setForm({ ...ann });
    setEditingId(ann.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        if(editingId) {
            setAnnouncements(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
        } else {
            const res = await fetch(`${API_BASE}/admin/announcements`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if(res.ok) {
                setAnnouncements(prev => [{
                    ...form, id: Date.now(), author: 'Admin', date: new Date().toISOString().split('T')[0], views: 0
                }, ...prev]);
            }
        }
    } catch(err) {}
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
        try {
            const token = localStorage.getItem("token");
            const API_BASE = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_BASE}/admin/announcements/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch(err) {}
    }
  };

  const togglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const toggleStatus = (id) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'Yayında' ? 'Taslak' : 'Yayında' } : a
    ));
  };

  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.status === 'Yayında').length,
    pinned: announcements.filter(a => a.pinned).length,
    totalViews: announcements.reduce((s, a) => s + a.views, 0),
  };

  return (
    <>
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#161b2c] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-red-900/30 to-slate-900/30 p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Megaphone size={18} className="text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  {editingId ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Başlık *</label>
                <input
                  required type="text"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Duyuru başlığı..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">İçerik *</label>
                <textarea
                  required rows={4}
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Duyuru metni..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hedef Kitle</label>
                  <select
                    value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
                  >
                    {targets.map(t => <option key={t} value={t} className="bg-[#1a2035]">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Öncelik</label>
                  <select
                    value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
                  >
                    <option value="yüksek" className="bg-[#1a2035]">Yüksek</option>
                    <option value="orta"   className="bg-[#1a2035]">Orta</option>
                    <option value="düşük"  className="bg-[#1a2035]">Düşük</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-white text-sm font-bold">Sayfanın Başına Sabitle</p>
                  <p className="text-slate-400 text-xs mt-0.5">Tüm kullanıcılara önce göster</p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, pinned: !form.pinned })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${form.pinned ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                  {form.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                  {form.pinned ? 'Sabitlendi' : 'Sabitle'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  {editingId ? 'Güncelle' : 'Yayınla'}
                </button>
                {!editingId && (
                  <button type="button" onClick={() => { setForm({...form, status: 'Taslak'}); }}
                    className="px-5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl border border-white/10 transition-all text-sm">
                    Taslak Kaydet
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Duyuru Yönetimi</h2>
          <p className="text-slate-400 text-sm mt-1">Öğrencilere ve kullanıcılara duyuru yayınla</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-red-900/40 hover:scale-105 active:scale-95">
          <Plus size={18} /> Yeni Duyuru
        </button>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toplam Duyuru', value: stats.total,      color: 'text-blue-400',    bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Aktif Duyuru',  value: stats.active,     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Sabitlenmiş',   value: stats.pinned,     color: 'text-amber-400',   bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Toplam Görüntülenme', value: stats.totalViews.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FİLTRE TABLARı */}
      <div className="flex items-center gap-2 mb-6">
        {['Tümü', 'Yayında', 'Taslak'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${filter === f ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-slate-400 text-xs">{filtered.length} duyuru</span>
      </div>

      {/* DUYURU LİSTESİ */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-slate-400">
            <Megaphone size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold">Bu kategoride duyuru yok.</p>
          </div>
        )}
        {filtered.map(ann => (
          <div key={ann.id}
            className={`bg-[#161b2c] border rounded-2xl p-5 transition-all hover:border-white/20 group relative overflow-hidden ${ann.pinned ? 'border-amber-500/30' : 'border-white/10'}`}>
            {ann.pinned && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
            )}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {ann.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                      <Pin size={10} /> Sabitlenmiş
                    </span>
                  )}
                  <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${STATUS_CONFIG[ann.status]?.class}`}>
                    {STATUS_CONFIG[ann.status]?.icon}
                    {ann.status}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${PRIORITY_CONFIG[ann.priority]?.class}`}>
                    {PRIORITY_CONFIG[ann.priority]?.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                    <Globe size={10} /> {ann.target}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-red-400 transition-colors">{ann.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                  <span>{ann.date}</span>
                  <span>•</span>
                  <span>{ann.views.toLocaleString()} görüntülenme</span>
                  <span>•</span>
                  <span>Yazar: {ann.author}</span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <button onClick={() => togglePin(ann.id)} title={ann.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                  className={`p-2.5 rounded-xl border transition-all ${ann.pinned ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-400 hover:bg-amber-500/10'}`}>
                  {ann.pinned ? <Pin size={15} /> : <PinOff size={15} />}
                </button>
                <button onClick={() => toggleStatus(ann.id)} title="Durumu Değiştir"
                  className={`p-2.5 rounded-xl border transition-all ${ann.status === 'Yayında' ? 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-400' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                  {ann.status === 'Yayında' ? <Clock size={15} /> : <CheckCircle2 size={15} />}
                </button>
                <button onClick={() => openEdit(ann)} title="Düzenle"
                  className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                  <Edit size={15} />
                </button>
                <button onClick={() => handleDelete(ann.id)} title="Sil"
                  className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
