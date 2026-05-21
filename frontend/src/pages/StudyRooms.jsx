import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Users, Timer, Plus, X, Search, Coffee,
  Zap, Lock, Globe, ChevronRight, ArrowLeft, Flame,
  GraduationCap, Clock, Star, Loader2, AlertCircle
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL;

const DEPARTMENTS = [
  'Tümü', 'Bilgisayar Mühendisliği', 'Yazılım Mühendisliği',
  'Elektrik-Elektronik Müh.', 'Makine Mühendisliği', 'Genel',
];

const STATUS_CFG = {
  active: { label: 'Aktif',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse' },
  break:  { label: 'Mola',   cls: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    dot: 'bg-blue-400' },
  full:   { label: 'Dolu',   cls: 'bg-red-500/10     text-red-400     border-red-500/20',     dot: 'bg-red-400' },
  closed: { label: 'Kapandı',cls: 'bg-slate-500/10   text-slate-400   border-slate-500/20',   dot: 'bg-slate-400' },
};

const EMPTY_FORM = { name: '', topic: '', dept: DEPARTMENTS[1], desc: '', max: '8', isPublic: true };

export default function StudyRooms() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [deptFilter, setDeptFilter] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [creating, setCreating]   = useState(false);

  // Katılım İstekleri States
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRoomId, setPendingRoomId] = useState(null);
  const [requestStatus, setRequestStatus] = useState("waiting"); // waiting | rejected
  const [pendingRoom, setPendingRoom]     = useState(null);

  // ── API: Odaları Çek ─────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Odalar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchRooms(); 
    
    // Aktif kullanıcı bilgisini çek
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCurrentUser(await res.json());
        }
      } catch (err) {
        console.error('Kullanıcı bilgisi çekilemedi:', err);
      }
    };
    fetchUser();
  }, []);

  // ── API: Oda Oluştur ─────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          topic: form.topic,
          department: form.dept,
          description: form.desc,
          max_participants: parseInt(form.max) || 8,
          is_public: form.isPublic,
        }),
      });
      if (res.ok) {
        const newRoom = await res.json();
        toast.success('Oda oluşturuldu!');
        setShowModal(false);
        setForm(EMPTY_FORM);
        navigate(`/study-rooms/${newRoom.id}`);
      } else {
        // --- DEĞİŞEN VE DÜZELEN KISIM BURASI ---
        const errData = await res.json();
        
        if (Array.isArray(errData.detail)) {
          console.error("FastAPI Hata Detayı:", errData.detail);
          const hataliAlan = errData.detail[0].loc[errData.detail[0].loc.length - 1];
          toast.error(`FastAPI şu alanı beğenmedi: ${hataliAlan}`);
        } else {
          toast.error(typeof errData.detail === 'string' ? errData.detail : "Oda oluşturulamadı.");
        }
        // ---------------------------------------
      }
    } catch (err) {
      toast.error('Bağlantı hatası');
    } finally {
      setCreating(false);
    }
  };

  // ── API: Odaya Katıl (İstek/Onay Akışı) ──────────────────────
  const handleJoin = async (roomObj) => {
    const roomId = roomObj.id;
    setPendingRoom(roomObj);
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/request-join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.detail || 'İstek gönderilemedi');
        return;
      }
      
      const data = await res.json();
      if (data.status === 'already_approved') {
        // Zaten onaylı veya kurucu, direkt katıl
        const joinRes = await fetch(`${API_BASE}/rooms/${roomId}/join`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (joinRes.ok) {
          navigate(`/study-rooms/${roomId}`);
        } else {
          const err = await joinRes.json();
          toast.error(err.detail || 'Odaya katılamadınız');
        }
      } else if (data.status === 'pending') {
        // Bekleme durumuna al
        setPendingRoomId(roomId);
        setRequestStatus("waiting");
        
        // WS bağlantısı kur ve bekle
        const wsUrl = API_BASE.replace(/^http/, 'ws');
        const tempWs = new WebSocket(`${wsUrl}/rooms/ws/${roomId}?token=${token}`);
        
        tempWs.onmessage = async (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === 'request_approved' && msg.user_id === currentUser?.id) {
            tempWs.close();
            toast.success('Oda kurucusu katılımınızı onayladı! Giriş yapılıyor...');
            
            // Son kaydı tamamla ve odaya yönlendir
            const joinRes = await fetch(`${API_BASE}/rooms/${roomId}/join`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            setPendingRoomId(null);
            setPendingRoom(null);
            if (joinRes.ok) {
              navigate(`/study-rooms/${roomId}`);
            } else {
              toast.error('Odaya katılım tamamlanamadı.');
            }
          } else if (msg.type === 'request_rejected' && msg.user_id === currentUser?.id) {
            tempWs.close();
            setRequestStatus("rejected");
            toast.error('Oda kurucusu katılım isteğinizi reddetti.');
          }
        };
        
        tempWs.onerror = () => {
          tempWs.close();
        };
      }
    } catch (err) {
      toast.error('Bağlantı hatası');
    }
  };

  // ── Filtrele ─────────────────────────────────────────────────
  const filtered = rooms.filter(r => {
    const matchDept = deptFilter === 'Tümü' || r.department === deptFilter;
    const matchSearch = !search
      || r.name.toLowerCase().includes(search.toLowerCase())
      || r.topic.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const stats = {
    active: rooms.filter(r => r.status === 'active').length,
    total:  rooms.reduce((s, r) => s + (r.participant_count || 0), 0),
    rooms:  rooms.length,
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans">
      <Toaster position="top-center" />

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
              <button type="submit" disabled={creating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {creating ? 'Oluşturuluyor...' : 'Odayı Başlat'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Aktif Oda',       value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <Zap size={20} /> },
            { label: 'Çalışan Öğrenci', value: stats.total,  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: <Users size={20} /> },
            { label: 'Toplam Oda',      value: stats.rooms,  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: <Timer size={20} /> },
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

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* ODA KARTLARI */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-slate-500">
                <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-bold">Henüz oda yok.</p>
                <p className="text-xs mt-1">İlk odayı oluşturmak için "Oda Oluştur" butonuna tıkla!</p>
              </div>
            )}
            {filtered.map(room => {
              const isFull = room.participant_count >= room.max_participants;
              const statusKey = isFull ? 'full' : (room.status || 'active');
              const st = STATUS_CFG[statusKey] || STATUS_CFG.active;
              return (
                <div key={room.id}
                  className="bg-[#161b2c] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:-translate-y-1 transition-all group relative">

                  <div className="p-5">
                    {/* Başlık */}
                    <div className="flex items-start gap-3 mb-3 pr-16">
                      <div className="h-10 w-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm leading-tight group-hover:text-purple-300 transition-colors">{room.name}</h3>
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <GraduationCap size={10} /> {room.department || 'Genel'}
                        </p>
                      </div>
                    </div>

                    {/* Açıklama */}
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                      {room.description || room.topic}
                    </p>

                    {/* Durum */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${st.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg font-bold">
                        Konu: {room.topic}
                      </span>
                      {!room.is_public && <Lock size={12} className="text-slate-500 ml-auto" />}
                    </div>

                    {/* Host bilgisi */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Star size={10} className="text-amber-400" />
                      <span>Kurucu: <span className="text-white font-bold">{room.host_name || 'Anonim'}</span></span>
                    </div>

                    {/* Alt bilgi + Buton */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex -space-x-1.5">
                          {Array.from({ length: Math.min(room.participant_count || 0, 4) }).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border border-[#161b2c] flex items-center justify-center text-[9px] font-black text-white">
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="font-bold">{room.participant_count || 0}/{room.max_participants}</span>
                      </div>
                      <button
                        onClick={() => !isFull && handleJoin(room)}
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
        )}
      </div>

      {/* KATILIM İSTEĞİ BEKLEME MODAL */}
      {pendingRoomId && pendingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#121826] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-6">
            <div className="flex flex-col items-center">
              {requestStatus === "waiting" ? (
                <>
                  <div className="relative mb-4">
                    <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center animate-pulse">
                      <Lock size={28} className="text-purple-400" />
                    </div>
                    <span className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping" />
                  </div>
                  <h3 className="text-white font-black text-lg">Katılım İsteği Gönderildi</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    <span className="text-purple-400 font-bold">"{pendingRoom.name}"</span> odasının kurucusunun onay vermesi bekleniyor...
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-4 text-xs font-bold text-slate-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full w-fit">
                    <Loader2 size={12} className="animate-spin text-purple-400" />
                    Bekleniyor
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={28} className="text-red-400" />
                  </div>
                  <h3 className="text-white font-black text-lg">İstek Reddedildi</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Üzgünüz, oda kurucusu bu odaya katılımınızı onaylamadı.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setPendingRoomId(null);
                setPendingRoom(null);
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            >
              {requestStatus === "waiting" ? "İsteği İptal Et" : "Tamam"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
