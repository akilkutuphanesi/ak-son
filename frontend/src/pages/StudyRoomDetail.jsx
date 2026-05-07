import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Timer, Coffee, Play, Pause, RotateCcw,
  Users, MessageSquare, BookOpen, Send, Bell, BellOff,
  ChevronRight, CheckCircle2, Zap, Clock, Star, GraduationCap
} from 'lucide-react';

// ── Pomodoro Sabitleri ──────────────────────────────────────────
const WORK_SECS   = 25 * 60;
const SHORT_BREAK =  5 * 60;
const LONG_BREAK  = 15 * 60;

// ── SVG Daire ──────────────────────────────────────────────────
const RADIUS = 54;
const CIRC   = 2 * Math.PI * RADIUS;

// ── Dummy Oda Verisi ───────────────────────────────────────────
const ROOMS_MAP = {
  1: { name: 'Vize Öncesi Algoritma Maratonu', topic: 'Algoritma ve Veri Yapıları', dept: 'Bilgisayar Mühendisliği', host: 'Ahmet Y.', participants: 6 },
  2: { name: 'Calculus II Final Hazırlık',     topic: 'İntegral ve Seriler',        dept: 'Genel',                   host: 'Zeynep K.', participants: 4 },
  3: { name: 'Devre Analizi Ortak Çalışma',   topic: 'Kirchhoff Yasaları',         dept: 'Elektrik-Elektronik Müh.',host: 'Caner U.',  participants: 3 },
  4: { name: 'Web Geliştirme Bootcamp',        topic: 'React & Tailwind',           dept: 'Yazılım Mühendisliği',    host: 'Elif B.',   participants: 8 },
  5: { name: 'Termodinamik Ödev Saati',        topic: 'Carnot Çevrimi',             dept: 'Makine Mühendisliği',     host: 'Mert A.',   participants: 2 },
  6: { name: 'Makine Öğrenmesi Kitap Kulübü',  topic: 'Yapay Sinir Ağları',         dept: 'Bilgisayar Mühendisliği', host: 'Selin T.',  participants: 5 },
};

const DUMMY_MEMBERS = [
  { name: 'Ahmet Y.',  color: 'from-red-600    to-red-800',    status: 'work' },
  { name: 'Zeynep K.', color: 'from-purple-600 to-purple-800', status: 'work' },
  { name: 'Caner U.',  color: 'from-blue-600   to-blue-800',   status: 'break' },
  { name: 'Elif B.',   color: 'from-emerald-600 to-emerald-800', status: 'work' },
  { name: 'Mert A.',   color: 'from-amber-600  to-amber-800',  status: 'work' },
  { name: 'Sen',       color: 'from-indigo-600 to-indigo-800', status: 'work' },
];

const DUMMY_QUESTIONS = {
  'Algoritma ve Veri Yapıları': [
    { id:1, author:'Zeynep K.',  title:'BFS ile DFS farkı nedir?',               answers:5,  time:'10 dk önce' },
    { id:2, author:'Caner U.',   title:'Heap Sort neden O(n log n)?',             answers:3,  time:'25 dk önce' },
    { id:3, author:'Mert A.',    title:'Dinamik programlamada memoization ne zaman kullanılır?', answers:7, time:'1 sa önce' },
    { id:4, author:'Elif B.',    title:'Graph\'ta negatif kenar olursa Dijkstra bozulur mu?',   answers:2, time:'2 sa önce' },
  ],
  'default': [
    { id:10, author:'Ahmet Y.',  title:'Bu konuda kaynak önerir misiniz?',        answers:2,  time:'5 dk önce' },
    { id:11, author:'Zeynep K.', title:'Ödev teslim tarihi ne zamana uzatıldı?',  answers:4,  time:'30 dk önce' },
    { id:12, author:'Caner U.',  title:'Geçen yılın vize soruları nerede?',       answers:8,  time:'1 sa önce' },
  ],
};

const DUMMY_NOTES = [
  { id:1, author:'Ahmet Y.',  text:'Ders kitabının 3. bölümü önce bitirin, oradan sorular gelecek kesin.',   time:'08:15' },
  { id:2, author:'Selin T.',  text:'Geçen senenin vize soruları hocadan aldım, paylaşıyorum yarın.',         time:'08:22' },
  { id:3, author:'Zeynep K.', text:'Şu an 3. seansı bitirdim, biraz mola lazım 😅',                          time:'08:40' },
  { id:4, author:'Sistem',    text:'🍅 Pomodoro seansı tamamlandı! 5 dakika kısa mola.',                     time:'08:50', isSystem:true },
];

// ── Tarayıcı Bildirimi Yardımcı Fonksiyonu ─────────────────────
function sendBrowserNotification(title, body, icon = '/logo.png') {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon });
  }
}

function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}



export default function StudyRoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = ROOMS_MAP[id] || { name: 'Bilinmeyen Oda', topic: 'Genel', dept: 'Genel', host: '?', participants: 1 };

  // ── Pomodoro state ──────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak]     = useState(false);
  const [session, setSession]     = useState(1);
  const [timeLeft, setTimeLeft]   = useState(WORK_SECS);
  const [soundOn, setSoundOn]     = useState(true);

  // Tarayıcı bildirimi izni — sayfa yüklenince sor
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const totalTime = isBreak ? (session % 4 === 0 ? LONG_BREAK : SHORT_BREAK) : WORK_SECS;
  const progress  = timeLeft / totalTime;
  const dashOffset = CIRC * (1 - progress);

  const ringColor = isBreak ? '#3b82f6' : '#a855f7';

  // ── Geri sayım ─────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          if (!isBreak) {
            // Çalışma seansı bitti → mola
            sendBrowserNotification(
              '🍅 Pomodoro Tamamlandı!',
              'Harika iş! 5 dakika mola ver.'
            );
            setIsBreak(true);
            setSession(s => s + 1);
            const nextBreak = session % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
            return nextBreak;
          } else {
            // Mola bitti → çalışma
            sendBrowserNotification(
              '☕ Mola Bitti!',
              'Yeniden odaklanma vakti. Haydi başlayalım!'
            );
            setIsBreak(false);
            return WORK_SECS;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [isRunning, isBreak, session]);

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_SECS);
  };

  const skipToBreak = () => {
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(SHORT_BREAK);
  };

  // ── Sohbet ─────────────────────────────────────────────────
  const [notes, setNotes] = useState(DUMMY_NOTES);
  const [noteText, setNoteText] = useState('');
  const displayName = localStorage.getItem('custom_display_name') || 'Sen';

  const sendNote = () => {
    if (!noteText.trim()) return;
    const now = new Date();
    const hm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setNotes(prev => [...prev, { id: Date.now(), author: displayName, text: noteText, time: hm }]);
    setNoteText('');
  };

  // ── Soru Akışı ─────────────────────────────────────────────
  const questions = DUMMY_QUESTIONS[room.topic] || DUMMY_QUESTIONS['default'];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans flex flex-col">

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
            {room.participants} Katılımcı
          </div>
          <span className="text-slate-500 hidden md:block">Ev Sahibi: <span className="text-white font-bold">{room.host}</span></span>
        </div>
      </header>

      {/* ANA LAYOUT: Sol | Orta | Sağ */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ═══════════════════════════════════════════════
            SOL: Pomodoro Zamanlayıcısı
            ═══════════════════════════════════════════════ */}
        <aside className="w-72 border-r border-white/10 bg-[#0c1120]/60 backdrop-blur-sm flex flex-col shrink-0 overflow-y-auto">
          <div className="p-6 flex flex-col items-center">

            {/* Mod Etiketleri */}
            <div className="flex gap-2 mb-6 w-full">
              <button onClick={() => { setIsBreak(false); setTimeLeft(WORK_SECS); setIsRunning(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${!isBreak ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                Çalışma
              </button>
              <button onClick={skipToBreak}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${isBreak ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                Mola
              </button>
            </div>

            {/* SVG Daire Zamanlayıcısı */}
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Arka halka */}
                <circle cx="60" cy="60" r={RADIUS}
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                {/* İlerleme halkası */}
                <circle cx="60" cy="60" r={RADIUS}
                  fill="none" stroke={ringColor} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
                />
              </svg>
              {/* Merkez metin */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono tracking-tight leading-none">
                  {fmtTime(timeLeft)}
                </span>
                <span className="text-xs font-bold mt-1" style={{ color: ringColor }}>
                  {isBreak ? '☕ Mola' : '🍅 Çalışma'}
                </span>
              </div>
              {/* Glow efekti */}
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: `0 0 40px ${ringColor}22`, transition: 'box-shadow 0.4s ease' }} />
            </div>

            {/* Kontroller */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleReset}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <RotateCcw size={16} />
              </button>
              <button onClick={() => setIsRunning(r => !r)}
                className={`px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 ${
                  isRunning
                    ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
                    : 'text-white shadow-purple-900/50'
                }`}
                style={!isRunning ? { backgroundColor: ringColor, boxShadow: `0 8px 24px ${ringColor}44` } : {}}>
                {isRunning ? <><Pause size={16} /> Duraklat</> : <><Play size={16} /> Başlat</>}
              </button>
              <button onClick={() => setSoundOn(s => !s)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                {soundOn ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
            </div>

            {/* Seans noktaları */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}
                  className={`w-3 h-3 rounded-full transition-all ${i < (session - 1) % 4 ? 'bg-purple-500' : 'bg-white/10'}`}
                  title={`Seans ${i + 1}`} />
              ))}
              <span className="text-slate-500 text-xs ml-2 font-bold">Seans {session}</span>
            </div>

            {/* Bilgi */}
            <div className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs leading-relaxed">
                {isBreak
                  ? '☕ Ekrandan uzaklaşın. Biraz esneyin ve su için.'
                  : '🎯 Odaklanma zamanı. Bildirimleri kapatın ve çalışmaya başlayın.'}
              </p>
            </div>

            <div className="mt-4 w-full">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">Bugünkü İlerleme</p>
              <div className="space-y-2">
                {[
                  { label: 'Tamamlanan Seans', value: session - 1, max: 8 },
                  { label: 'Çalışma Süresi',  value: Math.round(((session - 1) * 25)), max: 200, suffix: 'dk' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="text-white font-bold">{s.value}{s.suffix || ''}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-purple-500 transition-all"
                        style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Katılımcılar */}
          <div className="border-t border-white/5 p-5">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={11} /> Katılımcılar ({room.participants})
            </p>
            <div className="space-y-2">
              {DUMMY_MEMBERS.slice(0, room.participants).map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                    {m.name[0]}
                  </div>
                  <span className="text-slate-300 text-xs font-bold flex-1 truncate">{m.name === 'Sen' ? `${displayName} (Sen)` : m.name}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${m.status === 'work' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {m.status === 'work' ? '🍅' : '☕'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════
            ORTA: Oda Sohbeti / Notlar
            ═══════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col border-r border-white/10 min-w-0">
          {/* Başlık */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-400" />
              Oda Sohbeti
            </h2>
            <span className="text-[10px] text-slate-600 font-bold">{notes.length} mesaj</span>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {notes.map(n => (
              <div key={n.id} className={`flex gap-3 group ${n.isSystem ? 'justify-center' : ''}`}>
                {n.isSystem ? (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full">
                    <Zap size={12} /> {n.text}
                  </div>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5">
                      {n.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{n.author}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{n.time}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-none p-3">
                        <p className="text-slate-300 text-sm leading-relaxed">{n.text}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Mesaj gönder */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text" value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendNote()}
                placeholder="Odaya mesaj yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
              <button onClick={sendNote}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SAĞ: Konuya Özel Soru Akışı
            ═══════════════════════════════════════════════ */}
        <aside className="w-80 bg-[#0c1120]/60 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 shrink-0">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <BookOpen size={16} className="text-amber-400" />
              <span className="truncate">{room.topic}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
              <GraduationCap size={10} /> {room.dept}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={10} className="text-amber-400" />
              Bu konudaki sorular ({questions.length})
            </p>

            {questions.map(q => (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group cursor-pointer">
                <h3 className="text-white text-sm font-bold leading-tight mb-2 group-hover:text-amber-300 transition-colors">
                  {q.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-[8px] font-black text-white">
                      {q.author[0]}
                    </div>
                    {q.author}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={9} className="text-blue-400" />
                      {q.answers}
                    </span>
                    <span>•</span>
                    <Clock size={9} />
                    <span>{q.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Soru sor */}
            <Link to="/dashboard"
              className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 py-3 rounded-xl transition-all uppercase tracking-wider">
              <Send size={13} /> Dashboard'dan Soru Sor
            </Link>
          </div>

          {/* Odadan çık */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => navigate('/study-rooms')}
              className="w-full flex items-center justify-center gap-2 text-xs font-black text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 py-3 rounded-xl transition-all uppercase tracking-wider">
              Odadan Ayrıl
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
