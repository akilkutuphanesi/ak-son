import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Timer, Coffee, Play, Pause, RotateCcw,
  Users, MessageSquare, BookOpen, Send, Bell, BellOff,
  Zap, Clock, Star, GraduationCap, Loader2, LogOut,
  Trash2, Check, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL;
const WS_BASE = API_BASE.replace(/^http/, 'ws');

const WORK_SECS   = 25 * 60;
const SHORT_BREAK  =  5 * 60;
const LONG_BREAK   = 15 * 60;
const RADIUS = 54;
const CIRC   = 2 * Math.PI * RADIUS;

function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function fmtTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function StudyRoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const chatEndRef = useRef(null);
  const wsRef = useRef(null);

  // Room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');

  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak]     = useState(false);
  const [session, setSession]     = useState(1);
  const [timeLeft, setTimeLeft]   = useState(WORK_SECS);
  const [soundOn, setSoundOn]     = useState(true);

  // New Custom States for Host & Join Requests
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const isHost = room && currentUser && room.host_id === currentUser.id;
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const totalTime = isBreak ? (session % 4 === 0 ? LONG_BREAK : SHORT_BREAK) : WORK_SECS;
  const progress  = timeLeft / totalTime;
  const dashOffset = CIRC * (1 - progress);
  const ringColor = isBreak ? '#3b82f6' : '#a855f7';

  // ── API: Aktif Kullanıcı Profil Çek ─────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCurrentUser(await res.json());
        }
      } catch (err) {
        console.error('Kullanıcı bilgisi alınamadı:', err);
      }
    };
    fetchUser();
  }, [token]);

  // ── API: Bekleyen Katılım İstekleri Çek (Sadece Host için) ──
  useEffect(() => {
    if (!isHost) return;
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${id}/pending-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setPendingRequests(await res.json());
        }
      } catch (err) {
        console.error('Bekleyen katılım istekleri alınamadı:', err);
      }
    };
    fetchPendingRequests();
  }, [id, isHost, token]);

  // ── API: Oda bilgisi ───────────────────────────────────────
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { navigate('/study-rooms'); return; }
        setRoom(await res.json());
      } catch { navigate('/study-rooms'); }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${id}/messages?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMessages(await res.json());
      } catch {}
    };

    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setParticipants(await res.json());
      } catch {}
    };

    Promise.all([fetchRoom(), fetchMessages(), fetchParticipants()])
      .finally(() => setLoading(false));
  }, [id]);

  // ── WebSocket bağlantısı ───────────────────────────────────
  useEffect(() => {
    if (!token || !id) return;
    const ws = new WebSocket(`${WS_BASE}/rooms/ws/${id}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat' || data.type === 'system') {
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          sender_id: data.sender_id || null,
          sender_name: data.sender_name || null,
          sender_avatar: data.sender_avatar || null,
          content: data.content,
          is_system: data.type === 'system',
          is_hidden: false,
          sent_at: data.timestamp || new Date().toISOString(),
        }]);
      } else if (data.type === 'participants') {
        setParticipants(data.users || []);
      } else if (data.type === 'timer') {
        if (data.action === 'start')  setIsRunning(true);
        else if (data.action === 'pause')  setIsRunning(false);
        else if (data.action === 'reset') {
          setIsRunning(false);
          setIsBreak(false);
          setTimeLeft(WORK_SECS);
          setSession(1);
        } else if (data.action === 'sync') {
          setIsRunning(data.is_running);
          setIsBreak(data.timer_type === 'break');
          if (data.session) setSession(data.session);
        }
        if (data.remaining !== undefined) setTimeLeft(data.remaining);
      } else if (data.type === 'join_request') {
        setPendingRequests(prev => {
          if (prev.some(req => req.id === data.request_id)) return prev;
          return [...prev, {
            id: data.request_id,
            user_id: data.user_id,
            display_name: data.display_name,
            avatar_url: data.avatar_url,
            created_at: data.timestamp
          }];
        });
        toast.success(`👋 ${data.display_name} odaya katılmak istiyor!`, { icon: '🔔', duration: 4000 });
      } else if (data.type === 'request_approved' || data.type === 'request_rejected') {
        setPendingRequests(prev => prev.filter(req => req.id !== data.request_id));
      } else if (data.type === 'kicked') {
        toast.error('Oda sahibi tarafından odadan atıldınız!', { duration: 3000 });
        setTimeout(() => {
          navigate('/study-rooms');
        }, 1500);
      } else if (data.type === 'room_closed') {
        toast.error('Oda kapatıldı veya silindi.', { duration: 3000 });
        setTimeout(() => {
          navigate('/study-rooms');
        }, 1500);
      }
    };

    ws.onerror = (err) => {
      console.log("WS anlık kopma (Strict Mode):", err);
    };

    ws.onclose = (event) => {
      console.log("WebSocket kapandı. Kapanma Kodu:", event.code);
      if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005 && event.code !== 1006) {
        toast.error('Oda sunucusuyla bağlantı koptu.');
      }
    };

    return () => { ws.close(); wsRef.current = null; };
  }, [id, token]);

  // ── Scroll to bottom on new message ────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Pomodoro geri sayım ────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          
          if (isHost) {
            const nextBreak = !isBreak;
            let nextSession = session;
            if (!isBreak) {
              nextSession = session + 1;
            }
            
            const nextDuration = nextBreak 
              ? (nextSession % 4 === 0 ? LONG_BREAK : SHORT_BREAK) 
              : WORK_SECS;
              
            setIsBreak(nextBreak);
            setSession(nextSession);
            
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'timer',
                action: 'sync',
                remaining: nextDuration,
                duration: nextDuration,
                timer_type: nextBreak ? 'break' : 'work',
                session: nextSession
              }));
            }
            return nextDuration;
          } else {
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [isRunning, isBreak, session, isHost]);

  // ── Timer WS broadcast ─────────────────────────────────────
  const sendTimerAction = (action, customParams = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'timer',
        action,
        remaining: customParams.remaining !== undefined ? customParams.remaining : timeLeft,
        duration: customParams.duration !== undefined ? customParams.duration : totalTime,
        timer_type: customParams.timer_type !== undefined ? customParams.timer_type : (isBreak ? 'break' : 'work'),
        session: customParams.session !== undefined ? customParams.session : session
      }));
    }
  };

  const handlePlayPause = () => {
    if (!isHost) return;
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    sendTimerAction(nextRunning ? 'start' : 'pause');
  };

  const handleReset = () => {
    if (!isHost) return;
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_SECS);
    setSession(1);
    sendTimerAction('reset');
  };

  const handleSelectWork = () => {
    if (!isHost) return;
    setIsBreak(false);
    setTimeLeft(WORK_SECS);
    setIsRunning(false);
    sendTimerAction('sync', { remaining: WORK_SECS, duration: WORK_SECS, timer_type: 'work' });
  };

  const handleSelectBreak = () => {
    if (!isHost) return;
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(SHORT_BREAK);
    sendTimerAction('sync', { remaining: SHORT_BREAK, duration: SHORT_BREAK, timer_type: 'break' });
  };

  // ── Host İşlemleri (Katılım İstekleri & Katılımcı Atma) ─────
  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Katılım isteği onaylandı.');
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        const err = await res.json();
        toast.error(err.detail || 'İstek onaylanamadı.');
      }
    } catch {
      toast.error('Bağlantı hatası');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Katılım isteği reddedildi.');
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        const err = await res.json();
        toast.error(err.detail || 'İstek reddedilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası');
    }
  };

  const handleKickParticipant = async (userId, name) => {
    if (!window.confirm(`${name} kullanıcısını odadan atmak istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}/kick/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`${name} odadan atıldı.`);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Kullanıcı odadan atılamadı.');
      }
    } catch {
      toast.error('Bağlantı hatası');
    }
  };

  // ── Chat mesaj gönder ──────────────────────────────────────
  const sendMessage = () => {
    const text = msgText.trim();
    if (!text) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', content: text }));
      setMsgText('');
    } else {
      toast.error('Bağlantı koptu');
    }
  };

  // ── Odadan ayrıl ──────────────────────────────────────────
  const handleLeave = async () => {
    try {
      await fetch(`${API_BASE}/rooms/${id}/leave`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    navigate('/study-rooms');
  };

  // ── Odayı kapat/sil (Sadece kurucu için) ────────────────────
  const handleDeleteRoom = async () => {
    if (!window.confirm('Bu odayı kapatmak ve tüm katılımcıları çıkarmak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Oda başarıyla kapatıldı.');
        navigate('/study-rooms');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Oda kapatılamadı.');
      }
    } catch {
      toast.error('Bağlantı hatası');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans flex flex-col">
      <Toaster position="top-center" />

      {/* ARKA PLAN */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/8 rounded-full blur-[100px]" />
      </div>

      {/* TOPBAR */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-14 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/study-rooms" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft size={15} /> Odalar
          </Link>
          <span className="text-white/20">|</span>
          <BookOpen size={16} className="text-purple-400" />
          <h1 className="text-white font-bold text-sm truncate max-w-xs">{room.name}</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {participants.length} Katılımcı
          </div>
          <span className="text-slate-500 hidden md:block">Kurucu: <span className="text-white font-bold">{room.host_name}</span></span>
        </div>
      </header>

      {/* ANA LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative z-10">

        {/* SOL: Pomodoro */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0c1120]/60 backdrop-blur-sm flex flex-col shrink-0 lg:overflow-y-auto">
          <div className="p-6 flex flex-col items-center">
            {isHost ? (
              <div className="flex gap-2 mb-6 w-full">
                <button onClick={handleSelectWork}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${!isBreak ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                  Çalışma
                </button>
                <button onClick={handleSelectBreak}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${isBreak ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                  Mola
                </button>
              </div>
            ) : null}

            {/* SVG Timer */}
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke={ringColor} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono tracking-tight leading-none">{fmtTime(timeLeft)}</span>
                <span className="text-xs font-bold mt-1" style={{ color: ringColor }}>{isBreak ? '☕ Mola' : '🍅 Çalışma'}</span>
              </div>
            </div>

            {/* Kontroller */}
            {isHost ? (
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleReset} className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <RotateCcw size={16} />
                </button>
                <button onClick={handlePlayPause}
                  className={`px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${isRunning ? 'bg-white/10 border border-white/20 text-white' : 'text-white'}`}
                  style={!isRunning ? { backgroundColor: ringColor, boxShadow: `0 8px 24px ${ringColor}44` } : {}}>
                  {isRunning ? <><Pause size={16} /> Duraklat</> : <><Play size={16} /> Başlat</>}
                </button>
                <button onClick={() => setSoundOn(s => !s)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  {soundOn ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full mb-6 gap-4">
                <div className="text-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-purple-300 font-medium flex items-center gap-2 justify-center shadow-inner">
                  <Clock size={14} className="text-purple-400 animate-pulse" />
                  <span>Süre oda kurucusu tarafından kontrol ediliyor</span>
                </div>
                <button onClick={() => setSoundOn(s => !s)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold">
                  {soundOn ? <><Bell size={14} /> Bildirim Sesi Açık</> : <><BellOff size={14} /> Bildirim Sesi Kapalı</>}
                </button>
              </div>
            )}

            {/* Seans noktaları */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < (session - 1) % 4 ? 'bg-purple-500' : 'bg-white/10'}`} />
              ))}
              <span className="text-slate-500 text-xs ml-2 font-bold">Seans {session}</span>
            </div>

            <div className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs leading-relaxed">
                {isBreak ? '☕ Ekrandan uzaklaşın. Biraz esneyin ve su için.' : '🎯 Odaklanma zamanı. Bildirimleri kapatın.'}
              </p>
            </div>
          </div>

          {/* Katılımcılar */}
          <div className="border-t border-white/5 p-5">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={11} /> Katılımcılar ({participants.length})
            </p>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p.user_id || i} className="flex items-center gap-2.5 group/part animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {(p.display_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-slate-300 text-xs font-bold flex-1 truncate">{p.display_name || 'Anonim'}</span>
                  <div className="flex items-center gap-1.5">
                    {p.user_id === room.host_id ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400">HOST</span>
                    ) : (
                      <>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">🍅</span>
                        {isHost && (
                          <button onClick={() => handleKickParticipant(p.user_id, p.display_name || 'Anonim')}
                            title="Katılımcıyı Odadan At"
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-0 group-hover/part:opacity-100 focus:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ORTA: Sohbet */}
        <div className="flex-1 w-full flex flex-col lg:border-r border-white/10 min-w-0 min-h-[500px] lg:min-h-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-400" /> Oda Sohbeti
            </h2>
            <span className="text-[10px] text-slate-600 font-bold">{messages.length} mesaj</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={m.id || idx} className={`flex gap-3 group ${m.is_system ? 'justify-center' : ''}`}>
                {m.is_system ? (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">
                    <Zap size={12} /> {m.content}
                  </div>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5">
                      {(m.sender_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{m.sender_name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{fmtTimestamp(m.sent_at)}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-none p-3">
                        <p className="text-slate-300 text-sm leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 shrink-0 bg-[#0c1120]/60 lg:bg-transparent backdrop-blur-md sticky bottom-0 z-20">
            <div className="flex gap-2">
              <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Odaya mesaj yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
              <button onClick={sendMessage}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ: Bilgi + Çıkış */}
        <aside className="w-full lg:w-80 bg-[#0c1120]/60 backdrop-blur-sm flex flex-col shrink-0 lg:overflow-hidden border-t lg:border-t-0 border-white/10">
          <div className="p-4 border-b border-white/5 shrink-0">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <BookOpen size={16} className="text-amber-400" />
              <span className="truncate">{room.topic}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
              <GraduationCap size={10} /> {room.department || 'Genel'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isHost && pendingRequests.length > 0 && (
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 shadow-lg animate-fade-in">
                <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  Katılım İstekleri ({pendingRequests.length})
                </p>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between gap-2 bg-white/5 border border-white/5 rounded-xl p-2 animate-fade-in">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                          {(req.display_name || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-slate-200 text-xs font-bold truncate max-w-[100px]" title={req.display_name}>
                          {req.display_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleApproveRequest(req.id)}
                          title="Onayla"
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all">
                          <Check size={12} />
                        </button>
                        <button onClick={() => handleRejectRequest(req.id)}
                          title="Reddet"
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Oda Bilgisi</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Kurucu</span><span className="text-white font-bold">{room.host_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kapasite</span><span className="text-white font-bold">{room.participant_count}/{room.max_participants}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Durum</span><span className="text-emerald-400 font-bold capitalize">{room.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Konu</span><span className="text-white font-bold">{room.topic}</span></div>
              </div>
            </div>

            {room.description && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Açıklama</p>
                <p className="text-slate-300 text-xs leading-relaxed">{room.description}</p>
              </div>
            )}

            <Link to="/dashboard"
              className="w-full flex items-center justify-center gap-2 text-xs font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 py-3 rounded-xl transition-all uppercase tracking-wider">
              <Send size={13} /> Dashboard'dan Soru Sor
            </Link>
          </div>

          <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
            {isHost && (
              <button onClick={handleDeleteRoom}
                className="w-full flex items-center justify-center gap-2 text-xs font-black text-red-200 border border-red-500/30 hover:border-red-500/60 bg-red-500/20 hover:bg-red-500/30 py-3 rounded-xl transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Trash2 size={14} className="text-red-400" /> Odayı Sil / Kapat
              </button>
            )}
            <button onClick={handleLeave}
              className="w-full flex items-center justify-center gap-2 text-xs font-black text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 py-3 rounded-xl transition-all uppercase tracking-wider">
              <LogOut size={14} /> Odadan Ayrıl
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
