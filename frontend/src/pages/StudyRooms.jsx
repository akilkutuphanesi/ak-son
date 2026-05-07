import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Users, Timer, Plus, X, Search, Coffee,
  Zap, Lock, Globe, ChevronRight, ArrowLeft, Flame,
  GraduationCap, Clock, Star
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const DEPARTMENTS = [
  'Tümü', 'Bilgisayar Mühendisliği', 'Yazılım Mühendisliği',
  'Elektrik-Elektronik Müh.', 'Makine Mühendisliği', 'Genel',
];

const DUMMY_ROOMS = [
  {
    id: 1, name: 'Vize Öncesi Algoritma Maratonu',
    topic: 'Algoritma ve Veri Yapıları', dept: 'Bilgisayar Mühendisliği',
    desc: 'Big-O analizi ve sorting algoritmaları üzerine yoğun çalışma seansı.',
    participants: 6, max: 10, session: 3, isBreak: false,
    tags: ['#algoritma', '#vize', '#BFS'], status: 'active',
    host: 'Ahmet Y.', timeLeft: '18:32', isPublic: true, hot: true,
  },
  {
    id: 2, name: 'Calculus II Final Hazırlık',
    topic: 'İntegral ve Seriler', dept: 'Genel',
    desc: 'Çok değişkenli integraller ve seri yakınsaklığı çalışıyoruz.',
    participants: 4, max: 8, session: 1, isBreak: true,
    tags: ['#matematik', '#final', '#integral'], status: 'break',
    host: 'Zeynep K.', timeLeft: '04:15', isPublic: true, hot: false,
  },
  {
    id: 3, name: 'Devre Analizi Ortak Çalışma',
    topic: 'Kirchhoff Yasaları', dept: 'Elektrik-Elektronik Müh.',
    desc: 'Karmaşık devre problemleri üzerine adım adım çözümler.',
    participants: 3, max: 6, session: 2, isBreak: false,
    tags: ['#devre', '#KVL', '#KCL'], status: 'active',
    host: 'Caner U.', timeLeft: '22:10', isPublic: false, hot: false,
  },
  {
    id: 4, name: 'Web Geliştirme Bootcamp',
    topic: 'React & Tailwind', dept: 'Yazılım Mühendisliği',
    desc: 'React hooks, state yönetimi ve Tailwind CSS pratikleri.',
    participants: 8, max: 8, session: 4, isBreak: false,
    tags: ['#react', '#tailwind', '#frontend'], status: 'full',
    host: 'Elif B.', timeLeft: '11:45', isPublic: true, hot: true,
  },
  {
    id: 5, name: 'Termodinamik Ödev Saati',
    topic: 'Carnot Çevrimi', dept: 'Makine Mühendisliği',
    desc: 'Termodinamik ödevleri birlikte çözüyoruz, sorular bekleniyor.',
    participants: 2, max: 8, session: 1, isBreak: false,
    tags: ['#termodinamik', '#ödev', '#ME'], status: 'active',
    host: 'Mert A.', timeLeft: '24:59', isPublic: true, hot: false,
  },
  {
    id: 6, name: 'Makine Öğrenmesi Kitap Kulübü',
    topic: 'Yapay Sinir Ağları', dept: 'Bilgisayar Mühendisliği',
    desc: '"Hands-On ML" kitabını birlikte okuyup tartışıyoruz.',
    participants: 5, max: 12, session: 6, isBreak: true,
    tags: ['#ML', '#yapayZeka', '#python'], status: 'break',
    host: 'Selin T.', timeLeft: '02:50', isPublic: true, hot: false,
  },
];

const STATUS_CFG = {
  active: { label: 'Aktif',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse' },
  break:  { label: 'Mola',   cls: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    dot: 'bg-blue-400' },
  full:   { label: 'Dolu',   cls: 'bg-red-500/10     text-red-400     border-red-500/20',     dot: 'bg-red-400' },
};

const EMPTY_FORM = { name: '', topic: '', dept: DEPARTMENTS[1], desc: '', max: '8', isPublic: true };

export default function StudyRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(DUMMY_ROOMS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const displayName = localStorage.getItem('custom_display_name') || 'Sen';

  const filtered = rooms.filter(r => {
    const matchDept = deptFilter === 'Tümü' || r.dept === deptFilter;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.topic.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const newRoom = {
      id: Date.now(), name: form.name, topic: form.topic,
      dept: form.dept, desc: form.desc,
      participants: 1, max: parseInt(form.max) || 8,
      session: 1, isBreak: false, tags: [], status: 'active',
      host: displayName, timeLeft: '25:00', isPublic: form.isPublic, hot: false,
    };
    setRooms(prev => [newRoom, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    navigate(`/study-rooms/${newRoom.id}`);
  };

  const stats = {
    active: rooms.filter(r => r.status === 'active').length,
    total: rooms.reduce((s, r) => s + r.participants, 0),
    sessions: rooms.reduce((s, r) => s + r.session, 0),
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans">

      {/* ARKA PLAN */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-purple-400" />
            <h1 className="text-white font-black text-lg">Çalışma <span className="text-purple-400">Odaları</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" label={false} />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
          >
            <Plus size={16} /> Oda Oluştur
          </button>
        </div>
      </nav>

      {/* ODA OLUŞTUR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121826] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-900/40 to-slate-900/30 p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={18} className="text-purple-400" />
                </div>
                <h2 className="text-white font-bold text-lg">Yeni Çalışma Odası</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Oda Adı *</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ör: Vize Öncesi Algoritma Maratonu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Konu / Ders *</label>
                <input required type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ör: Algoritma ve Veri Yapıları"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Bölüm</label>
                  <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all">
                    {DEPARTMENTS.filter(d => d !== 'Tümü').map(d => <option key={d} value={d} className="bg-[#1a2035]">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Maks. Kişi</label>
                  <select value={form.max} onChange={e => setForm({ ...form, max: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all">
                    {[4,6,8,10,12,16].map(n => <option key={n} value={n} className="bg-[#1a2035]">{n} kişi</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">Açıklama</label>
                <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
                  rows={2} placeholder="Odanın amacını kısaca anlat..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  {form.isPublic ? <Globe size={14} className="text-blue-400" /> : <Lock size={14} className="text-slate-400" />}
                  <span className="text-white text-sm font-bold">{form.isPublic ? 'Herkese Açık' : 'Gizli Oda'}</span>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.isPublic ? 'bg-blue-500' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublic ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2">
                <Zap size={16} /> Odayı Başlat
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Aktif Oda',       value: stats.active,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <Zap size={20} /> },
            { label: 'Çalışan Öğrenci', value: stats.total,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: <Users size={20} /> },
            { label: 'Toplam Seans',    value: stats.sessions, color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: <Timer size={20} /> },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}>
              <div className={`${s.color} opacity-80`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ARAMA + FİLTRE */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Oda adı veya konu ara..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all whitespace-nowrap ${deptFilter === d ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                {d === 'Tümü' ? 'Tüm Odalar' : d.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* ODA KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-slate-500">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold">Oda bulunamadı.</p>
            </div>
          )}
          {filtered.map(room => {
            const st = STATUS_CFG[room.status] || STATUS_CFG.active;
            const isFull = room.status === 'full';
            return (
              <div key={room.id}
                className="bg-[#161b2c] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:-translate-y-1 transition-all group relative">

                {room.hot && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                    <Flame size={10} /> Popüler
                  </div>
                )}

                <div className="p-5">
                  {/* Başlık */}
                  <div className="flex items-start gap-3 mb-3 pr-16">
                    <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-tight group-hover:text-purple-300 transition-colors">{room.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                        <GraduationCap size={10} /> {room.dept}
                      </p>
                    </div>
                  </div>

                  {/* Açıklama */}
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">{room.desc}</p>

                  {/* Durum + Zamanlayıcı */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                      {room.isBreak ? <Coffee size={10} className="text-blue-400" /> : <Timer size={10} className="text-emerald-400" />}
                      {room.timeLeft}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg font-bold">
                      Seans {room.session}
                    </span>
                    {!room.isPublic && <Lock size={12} className="text-slate-500 ml-auto" />}
                  </div>

                  {/* Etiketler */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.tags.map(t => (
                      <span key={t} className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/10 px-2 py-0.5 rounded-md font-bold">{t}</span>
                    ))}
                  </div>

                  {/* Alt bilgi + Buton */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(room.participants, 4) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border border-[#161b2c] flex items-center justify-center text-[9px] font-black text-white">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="font-bold">{room.participants}/{room.max}</span>
                    </div>
                    <button
                      onClick={() => !isFull && navigate(`/study-rooms/${room.id}`)}
                      disabled={isFull}
                      className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl border transition-all ${
                        isFull
                          ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-lg hover:scale-105 active:scale-95'
                      }`}>
                      {isFull ? 'Dolu' : <><span>Katıl</span><ChevronRight size={14} /></>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
