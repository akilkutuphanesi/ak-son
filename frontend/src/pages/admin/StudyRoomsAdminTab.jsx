import React, { useState } from 'react';
import {
  BookOpen, Users, Timer, Search, Trash2, XCircle,
  Eye, AlertTriangle, CheckCircle2, Coffee, Zap,
  MessageSquare, Flag, Shield, ChevronDown, ChevronUp,
  BarChart2, Clock, Lock, Globe
} from 'lucide-react';

// ── Dummy Veri ──────────────────────────────────────────────────
const DUMMY_ROOMS = [
  {
    id: 1, name: 'Vize Öncesi Algoritma Maratonu',
    topic: 'Algoritma ve Veri Yapıları', dept: 'Bilgisayar Mühendisliği',
    host: 'Ahmet Y.', participants: 6, max: 10, session: 3,
    isBreak: false, isPublic: true,
    messages: 24, reports: 2, status: 'active',
    createdAt: '45 dk önce', duration: '1s 15dk',
  },
  {
    id: 2, name: 'Calculus II Final Hazırlık',
    topic: 'İntegral ve Seriler', dept: 'Genel',
    host: 'Zeynep K.', participants: 4, max: 8, session: 1,
    isBreak: true, isPublic: true,
    messages: 11, reports: 0, status: 'break',
    createdAt: '2 sa önce', duration: '55dk',
  },
  {
    id: 3, name: 'Devre Analizi Ortak Çalışma',
    topic: 'Kirchhoff Yasaları', dept: 'Elektrik-Elektronik Müh.',
    host: 'Caner U.', participants: 3, max: 6, session: 2,
    isBreak: false, isPublic: false,
    messages: 7, reports: 0, status: 'active',
    createdAt: '3 sa önce', duration: '1s 40dk',
  },
  {
    id: 4, name: 'Web Geliştirme Bootcamp',
    topic: 'React & Tailwind', dept: 'Yazılım Mühendisliği',
    host: 'Elif B.', participants: 8, max: 8, session: 4,
    isBreak: false, isPublic: true,
    messages: 58, reports: 1, status: 'full',
    createdAt: '4 sa önce', duration: '2s 10dk',
  },
  {
    id: 5, name: 'Kötüye Kullanım Test Odası',
    topic: 'Bilinmiyor', dept: 'Genel',
    host: 'Anonim', participants: 1, max: 8, session: 0,
    isBreak: false, isPublic: true,
    messages: 2, reports: 5, status: 'active',
    createdAt: '15 dk önce', duration: '15dk',
  },
];

const DUMMY_REPORTS = [
  { id: 1, roomId: 1, roomName: 'Vize Öncesi Algoritma Maratonu', reporter: 'Selin T.', reason: 'Konu dışı içerik', message: '"Git push ve PR ne zaman öğreneceğiz?" diye soruyorlar sürekli.', status: 'pending', time: '20 dk önce' },
  { id: 2, roomId: 1, roomName: 'Vize Öncesi Algoritma Maratonu', reporter: 'Mert A.', reason: 'Spam', message: 'Aynı mesajı 10 kez gönderdi.', status: 'pending', time: '35 dk önce' },
  { id: 3, roomId: 4, roomName: 'Web Geliştirme Bootcamp', reporter: 'Ahmet Y.', reason: 'Uygunsuz dil', message: 'Hakaret içeren bir mesaj gönderildi.', status: 'pending', time: '1 sa önce' },
  { id: 4, roomId: 5, roomName: 'Kötüye Kullanım Test Odası', reporter: 'Zeynep K.', reason: 'Şüpheli aktivite', message: 'Oda içeriği platformla alakasız.', status: 'resolved', time: '2 sa önce' },
  { id: 5, roomId: 5, roomName: 'Kötüye Kullanım Test Odası', reporter: 'Caner U.', reason: 'Reklam/Spam', message: 'Harici sitelere yönlendirme yapılıyor.', status: 'pending', time: '10 dk önce' },
];

const STATUS_CFG = {
  active: { label: 'Aktif',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse' },
  break:  { label: 'Mola',   cls: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    dot: 'bg-blue-400' },
  full:   { label: 'Dolu',   cls: 'bg-amber-500/10   text-amber-400   border-amber-500/20',   dot: 'bg-amber-400' },
  closed: { label: 'Kapalı', cls: 'bg-slate-500/10   text-slate-400   border-slate-500/20',   dot: 'bg-slate-400' },
};

export default function StudyRoomsAdminTab() {
  const [rooms, setRooms] = useState(DUMMY_ROOMS);
  const [reports, setReports] = useState(DUMMY_REPORTS);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('rooms'); // 'rooms' | 'reports'
  const [expandedId, setExpandedId] = useState(null);

  const filtered = rooms.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.host.toLowerCase().includes(search.toLowerCase())
  );

  const closeRoom = (id) => {
    if (window.confirm('Bu odayı kapatmak istediğinize emin misiniz? Tüm katılımcılar çıkarılacak.')) {
      setRooms(prev => prev.map(r => r.id === id ? { ...r, status: 'closed', participants: 0 } : r));
    }
  };

  const deleteRoom = (id) => {
    if (window.confirm('Bu odayı kalıcı olarak silmek istediğinize emin misiniz?')) {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  const resolveReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const dismissReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  const totalStudents = rooms.reduce((s, r) => s + r.participants, 0);
  const totalMsgs     = rooms.reduce((s, r) => s + r.messages, 0);
  const totalReports  = pendingReports.length;

  return (
    <>
      {/* BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <BookOpen size={24} className="text-purple-400" />
            Çalışma Odaları Yönetimi
          </h2>
          <p className="text-slate-500 text-sm mt-1">Aktif odaları izle, sorunlu odaları kapat, şikayetleri yönet</p>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Aktif Oda',       value: rooms.filter(r => r.status === 'active').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Çalışan Kişi',    value: totalStudents,                                   color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
          { label: 'Toplam Mesaj',    value: totalMsgs,                                        color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
          { label: 'Bekleyen Şikayet',value: totalReports,                                     color: totalReports > 0 ? 'text-red-400' : 'text-slate-400', bg: totalReports > 0 ? 'bg-red-500/10' : 'bg-white/5', border: totalReports > 0 ? 'border-red-500/20' : 'border-white/10' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TAB SEÇİCİ */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'rooms',   label: 'Odalar',            count: rooms.length },
          { key: 'reports', label: 'Şikayetler',        count: totalReports, alert: totalReports > 0 },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider border transition-all ${tab === t.key ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${tab === t.key ? 'bg-white/20 text-white' : t.alert ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── ODA LİSTESİ ────────────────────────────────── */}
      {tab === 'rooms' && (
        <>
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Oda adı veya ev sahibi ara..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" />
          </div>

          <div className="space-y-3">
            {filtered.map(room => {
              const st = STATUS_CFG[room.status] || STATUS_CFG.active;
              const isExpanded = expandedId === room.id;
              const hasReports = reports.some(r => r.roomId === room.id && r.status === 'pending');

              return (
                <div key={room.id}
                  className={`bg-[#161b2c] border rounded-2xl overflow-hidden transition-all ${hasReports ? 'border-red-500/30' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="flex items-center gap-4 p-5">
                    {/* Renk dot + ikon */}
                    <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-purple-400" />
                    </div>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-white font-bold text-sm">{room.name}</h3>
                        {hasReports && <span className="flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg"><AlertTriangle size={9} /> Şikayet</span>}
                        {!room.isPublic && <Lock size={12} className="text-slate-500" />}
                      </div>
                      <p className="text-slate-500 text-xs">{room.topic} • {room.dept}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">Ev sahibi: <span className="text-slate-400 font-bold">{room.host}</span> • {room.createdAt} açıldı • Süre: {room.duration}</p>
                    </div>

                    {/* Sayılar */}
                    <div className="hidden md:flex items-center gap-5 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1"><Users size={12} className="text-blue-400" /><span className="font-black text-sm text-white">{room.participants}/{room.max}</span></div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Kişi</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1"><MessageSquare size={12} className="text-slate-400" /><span className="font-black text-sm text-white">{room.messages}</span></div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Mesaj</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1"><Timer size={12} className="text-purple-400" /><span className="font-black text-sm text-white">{room.session}</span></div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Seans</p>
                      </div>
                    </div>

                    {/* Durum + Aksiyonlar */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${st.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      <button onClick={() => setExpandedId(isExpanded ? null : room.id)}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      {room.status !== 'closed' && (
                        <button onClick={() => closeRoom(room.id)}
                          className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all"
                          title="Odayı Kapat">
                          <XCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => deleteRoom(room.id)}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                        title="Odayı Sil">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* GENİŞLETİLMİŞ DETAY */}
                  {isExpanded && (
                    <div className="border-t border-white/5 px-5 py-4 bg-white/[0.02] animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: 'Durum',       value: room.isBreak ? '☕ Mola' : '🍅 Çalışma', color: room.isBreak ? 'text-blue-400' : 'text-emerald-400' },
                          { label: 'Gizlilik',    value: room.isPublic ? '🌐 Herkese Açık' : '🔒 Gizli', color: 'text-slate-300' },
                          { label: 'Şikayet',     value: `${reports.filter(r => r.roomId === room.id).length} adet`, color: reports.filter(r => r.roomId === room.id && r.status === 'pending').length > 0 ? 'text-red-400' : 'text-slate-400' },
                          { label: 'Mesaj Sayısı',value: `${room.messages} mesaj`, color: 'text-purple-400' },
                        ].map((d, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{d.label}</p>
                            <p className={`text-sm font-black ${d.color}`}>{d.value}</p>
                          </div>
                        ))}
                      </div>
                      {reports.filter(r => r.roomId === room.id && r.status === 'pending').length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                          <p className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Flag size={11} /> Bu Odadaki Şikayetler</p>
                          {reports.filter(r => r.roomId === room.id && r.status === 'pending').map(rep => (
                            <div key={rep.id} className="text-xs text-slate-400 py-1.5 border-t border-white/5 first:border-0 flex items-start justify-between gap-2">
                              <span><span className="text-white font-bold">{rep.reporter}</span>: {rep.reason} — "{rep.message}"</span>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => resolveReport(rep.id)} className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/10 rounded-lg transition-colors"><CheckCircle2 size={13} /></button>
                                <button onClick={() => dismissReport(rep.id)} className="text-slate-500 hover:text-slate-300 p-1 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={13} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ŞİKAYET LİSTESİ ────────────────────────────── */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-slate-500">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">Şikayet bulunamadı.</p>
            </div>
          )}
          {reports.map(rep => (
            <div key={rep.id}
              className={`bg-[#161b2c] border rounded-2xl p-5 transition-all ${rep.status === 'resolved' ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex items-start gap-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${rep.status === 'resolved' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {rep.status === 'resolved'
                    ? <CheckCircle2 size={18} className="text-emerald-400" />
                    : <Flag size={18} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-bold text-sm">{rep.roomName}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${rep.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {rep.status === 'resolved' ? 'Çözüldü' : 'Bekliyor'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">
                    <span className="text-purple-400 font-bold">{rep.reporter}</span> şikayet etti — <span className="text-amber-400 font-bold">{rep.reason}</span>
                  </p>
                  <p className="text-slate-500 text-xs italic">"{rep.message}"</p>
                  <p className="text-slate-600 text-[10px] mt-1">{rep.time}</p>
                </div>
                {rep.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resolveReport(rep.id)}
                      className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black px-3 py-2 rounded-xl transition-all">
                      <CheckCircle2 size={13} /> Çözüldü
                    </button>
                    <button onClick={() => dismissReport(rep.id)}
                      className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-xs font-black px-3 py-2 rounded-xl transition-all">
                      <Trash2 size={13} /> Yok Say
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
