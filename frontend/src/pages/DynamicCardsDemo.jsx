import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare, Share2, Code2, FlaskConical, ImageIcon, FileText, Layers, ChevronRight, Copy, Check } from 'lucide-react';
import SmartQuestionForm from '../components/SmartQuestionForm';

// ── KART TİPİ KONFIG ──────────────────────────────────────────
const TYPES = [
  { key: 'all',     label: 'Tümü',    icon: Layers,       color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
  { key: 'code',    label: 'Kod',     icon: Code2,        color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
  { key: 'formula', label: 'Formül',  icon: FlaskConical, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  { key: 'image',   label: 'Görsel',  icon: ImageIcon,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  { key: 'text',    label: 'Metin',   icon: FileText,     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

// ── SAHTE SORULAR ─────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1, type: 'code',
    author: 'Ahmet Y.', dept: 'Bilgisayar Mühendisliği', time: '12 dk önce',
    title: 'Bu Python kodunda neden RecursionError alıyorum?',
    body: 'Fibonacci fonksiyonu yazıyorum ama büyük sayılarda hata veriyor.',
    lang: 'Python',
    code: `def fibonacci(n):
    if n <= 0:
        return 0
    return fibonacci(n-1) + fibonacci(n-2)

# RecursionError: maximum recursion depth exceeded
print(fibonacci(1000))`,
    likes: 14, answers: 6,
  },
  {
    id: 2, type: 'formula',
    author: 'Zeynep K.', dept: 'Elektrik-Elektronik Müh.', time: '28 dk önce',
    title: 'Kirchhoff Akım Yasasını bu devreye nasıl uygularım?',
    body: 'Düğüm noktasında toplam akımı bulmaya çalışıyorum.',
    formulas: [
      { label: 'KAY (Kirchhoff Akım Yasası)', expr: '∑I_giren = ∑I_çıkan' },
      { label: 'Düğüm Denklemi', expr: 'I₁ + I₂ - I₃ - I₄ = 0' },
      { label: 'Kirchhoff Gerilim Yasası', expr: '∑V = 0  →  V₁ - V₂ - V₃ = 0' },
    ],
    likes: 9, answers: 4,
  },
  {
    id: 3, type: 'image',
    author: 'Caner U.', dept: 'Makine Mühendisliği', time: '1 sa önce',
    title: 'Bu kiriş kesitindeki iç kuvvet diyagramı doğru mu?',
    body: 'Serbest cisim diyagramını çizdim fakat sonuçlar tutarsız geliyor.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
    imageAlt: 'Kiriş kesit analizi diyagramı',
    likes: 22, answers: 11,
  },
  {
    id: 4, type: 'code',
    author: 'Elif B.', dept: 'Yazılım Mühendisliği', time: '2 sa önce',
    title: 'React\'ta useEffect sonsuz döngüye giriyor, neden?',
    body: 'API çağrısı yapıyorum ama component sürekli re-render oluyor.',
    lang: 'JavaScript',
    code: `useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data)); // ← Sorun burada!
}, [data]); // data dependency'si sonsuz döngü yaratıyor`,
    likes: 31, answers: 8,
  },
  {
    id: 5, type: 'formula',
    author: 'Mert A.', dept: 'Genel', time: '3 sa önce',
    title: 'Integral hesabında hangi yöntemi kullanmalıyım?',
    body: 'Trigonometrik integralleri çözerken hangi formülü seçeceğimi bilemiyorum.',
    formulas: [
      { label: 'Parçalı İntegral', expr: '∫u dv = uv - ∫v du' },
      { label: 'Trigonometrik', expr: '∫sin²(x)dx = x/2 - sin(2x)/4 + C' },
      { label: 'Substitüsyon', expr: 'u = g(x)  →  ∫f(g(x))g\'(x)dx = ∫f(u)du' },
    ],
    likes: 7, answers: 3,
  },
  {
    id: 6, type: 'text',
    author: 'Selin T.', dept: 'Hukuk Fakültesi', time: '4 sa önce',
    title: 'Borçlar Hukuku\'nda "culpa in contrahendo" nedir?',
    body: 'Sözleşme görüşmeleri sırasında tarafların birbirine karşı sorumlulukları nelerdir? Özellikle sözleşme kurulmadan önce gerçekleşen ihlaller nasıl değerlendirilir? Konuyla ilgili Yargıtay kararlarını da biliyorsanız paylaşır mısınız?',
    tags: ['#borçlarHukuku', '#culpaInContrahendo', '#sözleşme'],
    likes: 5, answers: 2,
  },
];

// ── SYNTAX RENKLEME (Manuel) ──────────────────────────────────
function colorizeCode(code, lang) {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    let colored = line
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color:#a3e635">$1</span>')
      .replace(/\b(def|return|if|else|elif|for|while|import|from|class|print|fetch|then|const|let|var|function|async|await|useEffect|setData)\b/g, '<span style="color:#c084fc">$1</span>')
      .replace(/(\/\/.*|#.*)/g, '<span style="color:#64748b;font-style:italic">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#fb923c">$1</span>');
    return `<tr><td style="color:#475569;padding-right:16px;user-select:none;text-align:right;min-width:2rem">${i+1}</td><td><span dangerouslySetInnerHTML not needed /></td></tr>`;
  });
}

// ── KOD KARTI ────────────────────────────────────────────────
function CodeCard({ q }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(q.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-[#0d1117] border border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group shadow-lg shadow-emerald-900/10">
      {/* IDE Başlık Çubuğu */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-slate-400 text-xs font-mono ml-2 flex-1">
          {q.lang === 'Python' ? 'solution.py' : 'App.jsx'}
        </span>
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Code2 size={9} /> {q.lang}
        </span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors ml-2">
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
      {/* Soru Meta */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-[10px] font-black text-white">{q.author[0]}</div>
          <span className="text-white font-bold text-xs">{q.author}</span>
          <span className="text-slate-600 text-[10px]">•</span>
          <span className="text-slate-400 text-[10px]">{q.dept}</span>
          <span className="text-slate-600 text-[10px] ml-auto">{q.time}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-1 group-hover:text-emerald-300 transition-colors">{q.title}</h3>
        <p className="text-slate-400 text-sm">{q.body}</p>
      </div>
      {/* Kod Bloğu */}
      <div className="mx-4 mb-4 bg-[#0a0f1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse">
            <tbody>
              {q.code.split('\n').map((line, i) => (
                <tr key={i}>
                  <td className="text-slate-600 text-xs font-mono pr-5 select-none text-right align-top w-6">{i + 1}</td>
                  <td className="text-sm font-mono text-slate-300 whitespace-pre">
                    {line.split(/(["'].*?["']|\b(?:def|return|if|else|for|while|import|const|let|var|function|async|await|useEffect|setData|fetch|then)\b|#.*|\/\/.*)/).map((part, j) => {
                      if (/^["']/.test(part) || /^`/.test(part)) return <span key={j} className="text-lime-400">{part}</span>;
                      if (/^(def|return|if|else|for|while|import|const|let|var|function|async|await|useEffect|setData|fetch|then)$/.test(part)) return <span key={j} className="text-purple-400">{part}</span>;
                      if (/^(#|\/\/)/.test(part)) return <span key={j} className="text-slate-400 italic">{part}</span>;
                      return <span key={j}>{part}</span>;
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CardFooter q={q} accentColor="emerald" />
    </div>
  );
}

// ── FORMÜL KARTI ─────────────────────────────────────────────
function FormulaCard({ q }) {
  return (
    <div className="bg-[#130f05] border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:-translate-y-0.5 transition-all group shadow-lg shadow-amber-900/10">
      {/* Başlık Çubuğu */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1508] border-b border-amber-500/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-700/60" />
          <div className="w-3 h-3 rounded-full bg-amber-600/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
        </div>
        <span className="text-amber-700/60 text-xs font-mono ml-2 flex-1">formulas.tex</span>
        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
          <FlaskConical size={9} /> Formül
        </span>
      </div>
      {/* Soru Meta */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-[10px] font-black text-white">{q.author[0]}</div>
          <span className="text-white font-bold text-xs">{q.author}</span>
          <span className="text-slate-400 text-[10px]">{q.dept}</span>
          <span className="text-slate-600 text-[10px] ml-auto">{q.time}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-1 group-hover:text-amber-300 transition-colors">{q.title}</h3>
        <p className="text-slate-400 text-sm mb-3">{q.body}</p>
      </div>
      {/* Formül Blokları */}
      <div className="mx-4 mb-4 space-y-2">
        {q.formulas.map((f, i) => (
          <div key={i} className="bg-[#0f0b02] border border-amber-500/10 rounded-xl px-4 py-3">
            <p className="text-amber-600/70 text-[10px] font-bold uppercase tracking-widest mb-1.5">{f.label}</p>
            <p className="text-amber-300 font-mono text-lg tracking-wide">{f.expr}</p>
          </div>
        ))}
      </div>
      <CardFooter q={q} accentColor="amber" />
    </div>
  );
}

// ── GÖRSEL KARTI ──────────────────────────────────────────────
function ImageCard({ q }) {
  return (
    <div className="bg-[#060c18] border border-blue-500/20 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:-translate-y-0.5 transition-all group shadow-lg shadow-blue-900/10">
      {/* Üst: Görsel */}
      <div className="relative overflow-hidden" style={{ maxHeight: 220 }}>
        <img src={q.imageUrl} alt={q.imageAlt} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ maxHeight: 220 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-transparent" />
        <span className="absolute top-3 right-3 text-[10px] font-black text-blue-400 bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <ImageIcon size={9} /> Görsel Soru
        </span>
      </div>
      {/* Soru Meta */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-[10px] font-black text-white">{q.author[0]}</div>
          <span className="text-white font-bold text-xs">{q.author}</span>
          <span className="text-slate-400 text-[10px]">{q.dept}</span>
          <span className="text-slate-600 text-[10px] ml-auto">{q.time}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-1 group-hover:text-blue-300 transition-colors">{q.title}</h3>
        <p className="text-slate-400 text-sm">{q.body}</p>
      </div>
      <CardFooter q={q} accentColor="blue" />
    </div>
  );
}

// ── METİN KARTI ─────────────────────────────────────────────
function TextCard({ q }) {
  return (
    <div className="bg-[#0e0a1a] border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 hover:-translate-y-0.5 transition-all group shadow-lg shadow-purple-900/10">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#130f22] border-b border-purple-500/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-700/60" />
          <div className="w-3 h-3 rounded-full bg-purple-600/60" />
          <div className="w-3 h-3 rounded-full bg-purple-500/60" />
        </div>
        <span className="text-purple-700/60 text-xs font-mono ml-2 flex-1">question.md</span>
        <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
          <FileText size={9} /> Metin
        </span>
      </div>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-[10px] font-black text-white">{q.author[0]}</div>
          <span className="text-white font-bold text-xs">{q.author}</span>
          <span className="text-slate-400 text-[10px]">{q.dept}</span>
          <span className="text-slate-600 text-[10px] ml-auto">{q.time}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-2 group-hover:text-purple-300 transition-colors">{q.title}</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
          <p className="text-slate-300 text-sm leading-relaxed">{q.body}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {q.tags.map(t => (
            <span key={t} className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/10 px-2 py-0.5 rounded-md">{t}</span>
          ))}
        </div>
      </div>
      <CardFooter q={q} accentColor="purple" />
    </div>
  );
}

// ── ORTAK ALT BÖLÜM ──────────────────────────────────────────
const accentMap = {
  emerald: { like: 'hover:text-emerald-400', ans: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  amber:   { like: 'hover:text-amber-400',   ans: 'text-amber-400   bg-amber-500/10   border-amber-500/20' },
  blue:    { like: 'hover:text-blue-400',    ans: 'text-blue-400    bg-blue-500/10    border-blue-500/20' },
  purple:  { like: 'hover:text-purple-400',  ans: 'text-purple-400  bg-purple-500/10  border-purple-500/20' },
};
function CardFooter({ q, accentColor }) {
  const [liked, setLiked] = useState(false);
  const a = accentMap[accentColor] || accentMap.emerald;
  return (
    <div className="flex items-center justify-between px-5 pb-4 pt-2 border-t border-white/10 mt-1">
      <div className="flex items-center gap-4">
        <button onClick={() => setLiked(l => !l)} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${liked ? 'text-red-400' : 'text-slate-400 ' + a.like}`}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {q.likes + (liked ? 1 : 0)}
        </button>
        <button className={`flex items-center gap-1.5 text-xs font-bold text-slate-400 ${a.like} transition-colors`}>
          <MessageSquare size={14} /> {q.answers} cevap
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-300 transition-colors">
          <Share2 size={14} />
        </button>
      </div>
      <button className={`flex items-center gap-1 text-[10px] font-black border px-3 py-1.5 rounded-xl transition-all hover:scale-105 ${a.ans}`}>
        Cevapla <ChevronRight size={11} />
      </button>
    </div>
  );
}

// ── ANA SAYFA ─────────────────────────────────────────────────
export default function DynamicCardsDemo() {
  const [activeType, setActiveType] = useState('all');
  const [questions, setQuestions]   = useState(QUESTIONS);
  const displayName = localStorage.getItem('custom_display_name') || 'Sen';
  const avatarUrl   = localStorage.getItem('selected_avatar_url') || null;

  const displayed = activeType === 'all' ? questions : questions.filter(q => q.type === activeType);

  const handleNewQuestion = ({ title, content, cardType, imagePreview }) => {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newQ = {
      id: Date.now(),
      type: cardType,
      author: displayName,
      dept: 'Sen',
      time: 'Az önce',
      title,
      body: content.replace(/```[\s\S]*?```/g, '').replace(/\$\$[\s\S]*?\$\$/g, '').trim(),
      likes: 0,
      answers: 0,
      // kod
      ...(cardType === 'code' && {
        lang: (() => { const m = content.match(/```(\w+)/); return m ? m[1] : 'KOD'; })(),
        code: (() => { const m = content.match(/```(?:\w+)?\n?([\s\S]*?)```/); return m ? m[1].trim() : content; })()
      }),
      // formül
      ...(cardType === 'formula' && {
        formulas: [{ label: 'Formül', expr: (() => { const m = content.match(/\$\$([\s\S]*?)\$\$/); return m ? m[1].trim() : content.trim(); })() }],
      }),
      // görsel
      ...(cardType === 'image' && { imageUrl: imagePreview, imageAlt: title }),
      // metin tag
      ...(cardType === 'text' && { tags: [] }),
    };
    setQuestions(prev => [newQ, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-300 font-sans">
      {/* Arka Plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[40vw] h-[40vh] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vh] bg-blue-900/8 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-purple-400" />
            <h1 className="text-white font-black text-lg">Akıllı <span className="text-purple-400">Soru Akışı</span></h1>
          </div>
        </div>
        <p className="text-slate-400 text-xs hidden md:block">İçeriğe göre otomatik kart şablonu</p>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 relative z-10">
        {/* Akıllı Soru Formu */}
        <div className="mb-6">
          <SmartQuestionForm
            onSubmit={handleNewQuestion}
            displayName={displayName}
            avatarUrl={avatarUrl}
          />
        </div>

        {/* Filtreler */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TYPES.map(t => (
            <button key={t.key} onClick={() => setActiveType(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${activeType === t.key ? `${t.bg} ${t.color} ${t.border}` : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
              <t.icon size={12} />
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeType === t.key ? 'bg-white/20' : 'bg-white/5 text-slate-600'}`}>
                {t.key === 'all' ? questions.length : questions.filter(q => q.type === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Kart Akışı */}
        <div className="space-y-5 pb-20">
          {displayed.map(q => {
            if (q.type === 'code')    return <CodeCard    key={q.id} q={q} />;
            if (q.type === 'formula') return <FormulaCard key={q.id} q={q} />;
            if (q.type === 'image')   return <ImageCard   key={q.id} q={q} />;
            return <TextCard key={q.id} q={q} />;
          })}
        </div>
      </div>
    </div>
  );
}
