import React, { useState } from 'react';
import {
  GraduationCap, Plus, Edit, Trash2, X, Users, MessageSquare,
  CheckCircle2, TrendingUp, BookOpen, ChevronDown, ChevronRight
} from 'lucide-react';

const DUMMY_DEPARTMENTS = [
  {
    id: 1, name: 'Bilgisayar Mühendisliği', code: 'CS', color: '#3b82f6',
    faculty: 'Mühendislik Fakültesi', studentCount: 420, questionCount: 312,
    active: true,
    categories: ['Yazılım', 'Algoritma', 'Veritabanı', 'Ağ & Güvenlik'],
  },
  {
    id: 2, name: 'Yazılım Mühendisliği', code: 'SE', color: '#8b5cf6',
    faculty: 'Mühendislik Fakültesi', studentCount: 310, questionCount: 198,
    active: true,
    categories: ['Frontend', 'Backend', 'Mobil', 'DevOps'],
  },
  {
    id: 3, name: 'Elektrik-Elektronik Mühendisliği', code: 'EE', color: '#f59e0b',
    faculty: 'Mühendislik Fakültesi', studentCount: 280, questionCount: 115,
    active: true,
    categories: ['Devre Analizi', 'Sinyal İşleme', 'Güç Elektroniği'],
  },
  {
    id: 4, name: 'Makine Mühendisliği', code: 'ME', color: '#10b981',
    faculty: 'Mühendislik Fakültesi', studentCount: 255, questionCount: 89,
    active: true,
    categories: ['Termodinamik', 'Mekanik', 'CAD/CAM'],
  },
  {
    id: 5, name: 'Endüstri Mühendisliği', code: 'IE', color: '#f97316',
    faculty: 'Mühendislik Fakültesi', studentCount: 190, questionCount: 67,
    active: true,
    categories: ['Operasyon Araştırması', 'Kalite Yönetimi', 'İstatistik'],
  },
  {
    id: 6, name: 'İnşaat Mühendisliği', code: 'CE', color: '#64748b',
    faculty: 'Mühendislik Fakültesi', studentCount: 175, questionCount: 42,
    active: false,
    categories: ['Yapı Statiği', 'Zemin Mekaniği'],
  },
  {
    id: 7, name: 'Havacılık ve Uzay Mühendisliği', code: 'AE', color: '#06b6d4',
    faculty: 'Mühendislik Fakültesi', studentCount: 140, questionCount: 56,
    active: true,
    categories: ['Aerodinamik', 'Uçuş Mekaniği', 'Uzay Sistemleri'],
  },
  {
    id: 8, name: 'Ekonomi', code: 'ECON', color: '#84cc16',
    faculty: 'İşletme ve Yönetim Bilimleri Fakültesi', studentCount: 220, questionCount: 78,
    active: true,
    categories: ['Mikro Ekonomi', 'Makro Ekonomi', 'Ekonometri'],
  },
];

const FACULTIES = ['Mühendislik Fakültesi', 'İşletme ve Yönetim Bilimleri Fakültesi', 'Fen-Edebiyat Fakültesi', 'Tıp Fakültesi'];

const EMPTY_FORM = {
  name: '', code: '', color: '#ef4444', faculty: FACULTIES[0], active: true, categories: [],
};

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState(DUMMY_DEPARTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('Tümü');

  const totalStudents = departments.reduce((s, d) => s + d.studentCount, 0);
  const totalQuestions = departments.reduce((s, d) => s + d.questionCount, 0);
  const activeDepts = departments.filter(d => d.active).length;

  const faculties = ['Tümü', ...FACULTIES];
  const filtered = filterFaculty === 'Tümü' ? departments : departments.filter(d => d.faculty === filterFaculty);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsModalOpen(true);
    setNewCat('');
  };

  const openEdit = (dept) => {
    setForm({ ...dept, categories: [...dept.categories] });
    setEditingId(dept.id);
    setIsModalOpen(true);
    setNewCat('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setDepartments(prev => prev.map(d => d.id === editingId ? { ...d, ...form } : d));
    } else {
      setDepartments(prev => [...prev, {
        ...form, id: Date.now(), studentCount: 0, questionCount: 0,
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu bölümü silmek istediğinize emin misiniz?')) {
      setDepartments(prev => prev.filter(d => d.id !== id));
    }
  };

  const toggleActive = (id) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const addCat = () => {
    if (newCat.trim() && !form.categories.includes(newCat.trim())) {
      setForm(f => ({ ...f, categories: [...f.categories, newCat.trim()] }));
      setNewCat('');
    }
  };

  const removeCat = (cat) => {
    setForm(f => ({ ...f, categories: f.categories.filter(c => c !== cat) }));
  };

  return (
    <>
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121826] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-900/30 to-slate-900/30 p-6 border-b border-white/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <GraduationCap size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  {editingId ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Bölüm Adı *</label>
                  <input required type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Bilgisayar Mühendisliği"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Kısa Kod *</label>
                  <input required type="text" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    maxLength={6} placeholder="CS"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Fakülte</label>
                <select value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all">
                  {FACULTIES.map(f => <option key={f} value={f} className="bg-[#1a2035]">{f}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Renk</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                      className="w-12 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer" />
                    <span className="text-slate-400 text-sm font-mono">{form.color}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 flex-1">
                  <div>
                    <p className="text-white text-sm font-bold">Aktif</p>
                    <p className="text-slate-500 text-xs">Sistemde görünür</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`ml-auto w-11 h-6 rounded-full transition-all relative ${form.active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* KATEGORİLER */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Kategoriler / Konular</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCat())}
                    placeholder="Yeni kategori ekle..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                  <button type="button" onClick={addCat}
                    className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.categories.map(cat => (
                    <span key={cat} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                      {cat}
                      <button type="button" onClick={() => removeCat(cat)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {form.categories.length === 0 && (
                    <span className="text-slate-600 text-xs italic">Henüz kategori eklenmedi</span>
                  )}
                </div>
              </div>

              <button type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2">
                <CheckCircle2 size={16} />
                {editingId ? 'Güncelle' : 'Bölüm Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">Bölüm & Kategori Yönetimi</h2>
          <p className="text-slate-500 text-sm mt-1">Sistemdeki fakülte bölümleri ve konu kategorilerini yönet</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95">
          <Plus size={18} /> Yeni Bölüm
        </button>
      </div>

      {/* ÖZET KARTLAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toplam Bölüm',   value: departments.length, color: 'text-white',       bg: 'bg-white/5',          border: 'border-white/10' },
          { label: 'Aktif Bölüm',    value: activeDepts,        color: 'text-emerald-400', bg: 'bg-emerald-500/10',   border: 'border-emerald-500/20' },
          { label: 'Toplam Öğrenci', value: totalStudents.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Toplam Soru',    value: totalQuestions.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FAKÜLTEFİLTRESİ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {faculties.map(f => (
          <button key={f} onClick={() => setFilterFaculty(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${filterFaculty === f ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {f === 'Tümü' ? 'Tüm Fakülteler' : f}
          </button>
        ))}
      </div>

      {/* BÖLÜM LİSTESİ */}
      <div className="space-y-3">
        {filtered.map(dept => {
          const isExpanded = expandedId === dept.id;
          const pct = Math.round((dept.studentCount / totalStudents) * 100);
          return (
            <div key={dept.id}
              className={`bg-[#161b2c] border rounded-2xl overflow-hidden transition-all ${dept.active ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'}`}>
              <div className="flex items-center gap-4 p-5">
                {/* Renk badge */}
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white shadow-lg"
                  style={{ backgroundColor: dept.color + '33', border: `1px solid ${dept.color}55` }}>
                  <span style={{ color: dept.color }}>{dept.code}</span>
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold text-sm">{dept.name}</h3>
                    {!dept.active && (
                      <span className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-lg font-bold uppercase">Pasif</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">{dept.faculty}</p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: dept.color }} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">%{pct}</span>
                  </div>
                </div>

                {/* Sayılar */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-blue-400">
                      <Users size={12} />
                      <span className="font-black text-sm text-white">{dept.studentCount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Öğrenci</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-purple-400">
                      <MessageSquare size={12} />
                      <span className="font-black text-sm text-white">{dept.questionCount}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Soru</p>
                  </div>
                </div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setExpandedId(isExpanded ? null : dept.id)}
                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all">
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  <button onClick={() => toggleActive(dept.id)}
                    className={`p-2 rounded-xl border transition-all ${dept.active ? 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-400' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                    title={dept.active ? 'Pasife Al' : 'Aktif Et'}>
                    <CheckCircle2 size={15} />
                  </button>
                  <button onClick={() => openEdit(dept)}
                    className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(dept.id)}
                    className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* KATEGORİ PANEL */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen size={11} /> Konu Kategorileri ({dept.categories.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dept.categories.length > 0 ? dept.categories.map(cat => (
                      <span key={cat} className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-white/5 text-slate-300 border-white/10">
                        {cat}
                      </span>
                    )) : (
                      <span className="text-slate-600 text-xs italic">Bu bölüm için henüz kategori tanımlanmamış.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
