import React, { useState, useRef } from 'react';
import {
  Code2, FlaskConical, ImageIcon, FileText, Layers,
  Send, X, ChevronDown, ChevronUp, Eye, EyeOff,
  Paperclip, Zap
} from 'lucide-react';

// ── Otomatik Kart Tipi Algılama ───────────────────────────────
function detectCardType(content, hasImage) {
  if (hasImage) return 'image';
  // Kod bloğu: ``` ile başlayan satır
  if (/```[\s\S]/.test(content)) return 'code';
  // Kod satırı: `inline kod`
  if (/`[^`]+`/.test(content)) return 'code';
  // Formül: $$ veya matematiksel semboller
  if (/\$\$[\s\S]*\$\$/.test(content)) return 'formula';
  if (/[∑∫√π∂∆∞αβγθλμσΣΩ±×÷≠≤≥∈∉⊂⊃∪∩→←↔]/.test(content)) return 'formula';
  if (/\b(sin|cos|tan|log|ln|lim|det|div|grad|curl)\s*[\(\d]/.test(content)) return 'formula';
  return 'text';
}

// Kod bloğundaki dili al
function detectLang(content) {
  const m = content.match(/```(\w+)/);
  return m ? m[1].toUpperCase() : 'KOD';
}

// ── Kart Tipi Konfigürasyonu ──────────────────────────────────
const TYPE_CFG = {
  text:    { label: 'Metin Kartı',   icon: FileText,     color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  glow: 'shadow-purple-900/20' },
  code:    { label: 'Kod Kartı',     icon: Code2,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-900/20' },
  formula: { label: 'Formül Kartı',  icon: FlaskConical, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   glow: 'shadow-amber-900/20' },
  image:   { label: 'Görsel Kartı',  icon: ImageIcon,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    glow: 'shadow-blue-900/20' },
};

// ── Hızlı Ekle Şablonları ─────────────────────────────────────
const SNIPPETS = {
  code: '```python\n# Kodunu buraya yaz\n\n```',
  formula: '$$\n\\formül buraya\n$$',
};

// ── Mini Önizleme Bileşeni ────────────────────────────────────
function MiniPreview({ title, content, type, imagePreview }) {
  const cfg = TYPE_CFG[type];
  const Icon = cfg.icon;
  const lang = detectLang(content);

  // İçerikten kod bloğunu çıkar
  const codeMatch = content.match(/```(?:\w+)?\n?([\s\S]*?)```/);
  const codeOnly  = codeMatch ? codeMatch[1].trim() : '';

  // Formül satırlarını çıkar
  const formulaMatch = content.match(/\$\$([\s\S]*?)\$\$/);
  const formulaOnly  = formulaMatch ? formulaMatch[1].trim() : content.trim();

  return (
    <div className={`rounded-xl overflow-hidden border ${cfg.border} shadow-lg ${cfg.glow} text-[11px] animate-in fade-in duration-200`}>
      {/* Simge başlık */}
      <div className={`flex items-center gap-2 px-3 py-1.5 ${cfg.bg} border-b ${cfg.border}`}>
        {type === 'code' && (
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/70" />
            <div className="w-2 h-2 rounded-full bg-amber-500/70" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
          </div>
        )}
        <Icon size={10} className={cfg.color} />
        <span className={`font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
        {type === 'code' && <span className={`ml-auto font-mono font-bold ${cfg.color}`}>{lang}</span>}
      </div>

      {/* Önizleme içeriği */}
      <div className="bg-[#0c1120] p-3">
        {title && <p className="text-white font-bold mb-1.5 text-xs leading-snug">{title}</p>}

        {type === 'code' && codeOnly && (
          <div className="bg-[#060c18] rounded-lg p-2 font-mono text-slate-400 text-[10px] whitespace-pre-wrap max-h-20 overflow-hidden">
            {codeOnly.split('\n').slice(0, 5).map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-700 select-none w-3 text-right">{i + 1}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        )}

        {type === 'formula' && (
          <div className="bg-[#0f0b02] border border-amber-500/10 rounded-lg p-2 font-mono text-amber-300 text-sm tracking-wide">
            {formulaOnly || '∑, ∫, √ ... formülünüz burada görünür'}
          </div>
        )}

        {type === 'image' && imagePreview && (
          <img src={imagePreview} alt="önizleme" className="h-16 w-full object-cover rounded-lg" />
        )}

        {type === 'text' && (
          <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
            {content.trim() || 'Sorunuzun detayları burada görünecek...'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Formül Karakter Paleti ────────────────────────────────────
const FORMULA_CHARS = [
  '∑', '∫', '√', 'π', '∂', '∆', '∞', 'α', 'β', 'γ',
  'θ', 'λ', 'μ', 'σ', '≤', '≥', '≠', '±', '×', '÷',
  '→', '←', '∈', '∉', '⊂', '⊃', '∪', '∩',
];

// ── ANA BILEŞEN ───────────────────────────────────────────────
export default function SmartQuestionForm({ onSubmit, displayName = 'Sen', avatarUrl = null }) {
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview]   = useState(true);
  const [showPalette, setShowPalette]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileRef    = useRef();
  const contentRef = useRef();

  const cardType = detectCardType(content, !!imagePreview);
  const cfg      = TYPE_CFG[cardType];
  const Icon     = cfg.icon;

  // Textarea'ya metin ekle (imleç pozisyonuna)
  const insertAt = (text) => {
    const el    = contentRef.current;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSubmit?.({ title, content, cardType, imagePreview });
    setTitle('');
    setContent('');
    setImagePreview(null);
    setIsSubmitting(false);
  };

  const getInitial = (n) => n?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`bg-[#111827] border ${cfg.border} rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ${cfg.glow}`}>
      {/* Üst şerit — kart tipi göstergesi */}
      <div className={`h-0.5 w-full ${
        cardType === 'code'    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
        cardType === 'formula' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        cardType === 'image'   ? 'bg-gradient-to-r from-blue-500 to-cyan-500'    :
        'bg-gradient-to-r from-red-500 via-purple-500 to-blue-500'
      } transition-all duration-500`} />

      <div className="p-5">
        {/* Yazar + kart tipi rozeti */}
        <div className="flex items-center gap-3 mb-4">
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-sm">{getInitial(displayName)}</div>
          }
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{displayName}</p>
            <p className="text-slate-500 text-[10px]">Yeni soru paylaşıyor</p>
          </div>
          {/* Canlı kart tipi rozeti */}
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-300 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <Icon size={11} />
            {cfg.label}
          </div>
        </div>

        {/* Başlık */}
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Sorunun başlığını yaz..."
          className="w-full bg-transparent text-lg text-white placeholder:text-slate-600 focus:outline-none font-bold mb-3"
        />

        {/* Araç Çubuğu */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mr-1">Ekle:</span>
          <button onClick={() => insertAt(SNIPPETS.code)}
            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all">
            <Code2 size={10} /> Kod Bloğu
          </button>
          <button onClick={() => insertAt(SNIPPETS.formula)}
            className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg transition-all">
            <FlaskConical size={10} /> Formül
          </button>
          <button onClick={() => setShowPalette(p => !p)}
            className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${showPalette ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 bg-white/5 border-white/10 hover:bg-white/10'}`}>
            ∑ π ∫ {showPalette ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          </button>
          <button onClick={() => fileRef.current.click()}
            className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg transition-all">
            <Paperclip size={10} /> Görsel
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        {/* Sembol paleti */}
        {showPalette && (
          <div className="flex flex-wrap gap-1 mb-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl animate-in fade-in duration-150">
            <p className="w-full text-[9px] text-amber-600 font-black uppercase tracking-widest mb-1">Matematiksel Semboller — tıkla ekle</p>
            {FORMULA_CHARS.map(ch => (
              <button key={ch} onClick={() => insertAt(ch)}
                className="w-8 h-8 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-sm font-mono transition-all hover:scale-110">
                {ch}
              </button>
            ))}
          </div>
        )}

        {/* İçerik textarea */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={
            cardType === 'code'    ? 'Detayları buraya yaz. Kod için ``` kullan...' :
            cardType === 'formula' ? 'Formül için $$ ... $$ sözdizimini veya ∑ π ∫ sembollerini kullan...' :
            'Sorunun detaylarını buraya yazabilirsin...'
          }
          rows={4}
          className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none transition-all font-mono"
        />

        {/* Görsel önizleme */}
        {imagePreview && (
          <div className="relative inline-block mt-2">
            <img src={imagePreview} alt="önizleme" className="h-24 rounded-xl border border-white/10 object-cover" />
            <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:scale-110 transition-transform">
              <X size={11} />
            </button>
          </div>
        )}

        {/* Alt çubuk */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <button onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-slate-300 transition-colors">
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPreview ? 'Önizlemeyi Gizle' : 'Canlı Önizleme'}
          </button>
          <button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 shadow-lg ${
              cardType === 'code'    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/40' :
              cardType === 'formula' ? 'bg-amber-600   hover:bg-amber-700   shadow-amber-900/40'   :
              cardType === 'image'   ? 'bg-blue-600    hover:bg-blue-700    shadow-blue-900/40'     :
              'bg-red-600 hover:bg-red-700 shadow-red-900/40'
            }`}>
            {isSubmitting ? <Zap size={14} className="animate-spin" /> : <Send size={14} />}
            Yayınla
          </button>
        </div>
      </div>

      {/* Canlı Önizleme */}
      {showPreview && (title || content || imagePreview) && (
        <div className="border-t border-white/5 px-5 pb-5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 mt-3 flex items-center gap-1.5">
            <Eye size={9} /> Kart Önizlemesi
          </p>
          <MiniPreview title={title} content={content} type={cardType} imagePreview={imagePreview} />
        </div>
      )}
    </div>
  );
}
