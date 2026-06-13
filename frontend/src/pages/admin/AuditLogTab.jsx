import React, { useState, useEffect } from 'react';
import {
  Activity, Shield, User, FileText, Settings, LogIn, LogOut, Trash2,
  AlertTriangle, CheckCircle2, Filter, Search, RefreshCw, Eye, Download
} from 'lucide-react';

const ACTION_TYPES = {
  login:          { label: 'Giriş Yapıldı',        icon: LogIn,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  logout:         { label: 'Çıkış Yapıldı',         icon: LogOut,       color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20' },
  user_banned:    { label: 'Kullanıcı Banlandı',    icon: Shield,       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  user_unbanned:  { label: 'Ban Kaldırıldı',        icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  user_edited:    { label: 'Kullanıcı Düzenlendi',  icon: User,         color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  content_delete: { label: 'İçerik Silindi',        icon: Trash2,       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  content_suspend:{ label: 'İçerik Askıya Alındı',  icon: AlertTriangle,color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  settings_saved: { label: 'Ayarlar Kaydedildi',    icon: Settings,     color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  announcement:   { label: 'Duyuru Yayınlandı',     icon: FileText,     color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
};



function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('Tümü');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) {
            const data = await res.json();
            const mapped = data.map(l => ({
                id: l.id, action: l.action || 'settings_saved', actor: l.admin || 'Admin', target: 'Sistem Kaydı', ip: l.ip || '127.0.0.1',
                timestamp: new Date().toISOString(), detail: l.details || '-'
            }));
            setLogs(mapped);
        }
      } catch(err) { console.error(err); }
    };
    fetchLogs();
  }, []);

  const actionKeys = ['Tümü', ...Object.keys(ACTION_TYPES)];

  const filtered = logs.filter(log => {
    const matchSearch = search === '' ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'Tümü' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const stats = {
    total: logs.length,
    danger: logs.filter(l => ['user_banned', 'content_delete'].includes(l.action)).length,
    today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    actors: [...new Set(logs.map(l => l.actor))].length,
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="h-9 w-9 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Activity size={18} className="text-red-400" />
            </span>
            Denetim Kaydı
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-12">Tüm admin işlemleri ve sistem olayları</p>
        </div>
        <button
          className="flex items-center gap-2 text-slate-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 font-bold px-5 py-3 rounded-xl transition-all text-sm"
          onClick={() => alert('Rapor dışa aktarma özelliği backend bağlantısı ile aktif olacak.')}>
          <Download size={16} /> Dışa Aktar
        </button>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toplam Kayıt',   value: stats.total,  color: 'text-white',       bg: 'bg-white/5',        border: 'border-white/10' },
          { label: 'Kritik İşlem',   value: stats.danger, color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
          { label: 'Bugünkü İşlem',  value: stats.today,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Aktif Yönetici', value: stats.actors, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FİLTRE VE ARAMA */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Aktör, hedef veya detay ile ara..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none min-w-[200px]"
          >
            {actionKeys.map(k => (
              <option key={k} value={k} className="bg-[#1a2035]">
                {k === 'Tümü' ? 'Tüm İşlemler' : (ACTION_TYPES[k]?.label || k)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOG LİSTESİ */}
      <div className="bg-[#161b2c] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={12} /> {filtered.length} kayıt
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Canlı</span>
          </div>
        </div>

        <div className="divide-y divide-theme-border">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Eye size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold">Eşleşen kayıt bulunamadı.</p>
            </div>
          )}

          {filtered.map(log => {
            const cfg = ACTION_TYPES[log.action] || ACTION_TYPES['login'];
            const IconComp = cfg.icon;
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id}
                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                <div className="flex items-center gap-4 p-4">
                  {/* İkon */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <IconComp size={16} className={cfg.color} />
                  </div>

                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      <span className="text-white font-bold text-sm truncate">{log.actor}</span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className="text-slate-300 text-sm truncate">{log.target}</span>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 bg-black/20 rounded-xl p-3 border border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-slate-300 text-xs leading-relaxed">{log.detail}</p>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                          <span>IP: {log.ip}</span>
                          <span>•</span>
                          <span>Log ID: #{log.id}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zaman */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 font-mono">{formatTime(log.timestamp)}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{log.ip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-slate-600 font-bold italic">
            Bu denetim kaydı yalnızca son 30 güne ait verileri göstermektedir. Arşiv için dışa aktarma kullanın.
          </p>
        </div>
      </div>
    </>
  );
}
