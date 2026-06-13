import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Trash2, X, Ban, CheckCircle, MessageSquare } from 'lucide-react';

export default function ContentTab() {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/contents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContents(data);
        }
      } catch (err) {
        console.error("İçerikler çekilemedi", err);
      }
    };
    fetchContents();
  }, []);

  // Modal State'i
  const [selectedContent, setSelectedContent] = useState(null);
  const [answers, setAnswers] = useState([]);

  const handleOpenContent = async (c) => {
    setSelectedContent(c);
    setAnswers([]);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_BASE}/admin/contents/${c.id}/answers`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setAnswers(await res.json());
      }
    } catch(err) { console.error("Answers fetch error:", err); }
  };

  // Otomatik hesaplanan şikayetli içerik sayısı
  const reportedCount = contents.filter(c => c.reports > 0).length;

  // Toplu İşlemler State'i
  const [selectedContents, setSelectedContents] = useState([]);
  const toggleSelectContent = (id) => setSelectedContents(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedContents(selectedContents.length === contents.length ? [] : contents.map(c => c.id));
  
  const handleBulkDelete = async () => {
    if(window.confirm(`${selectedContents.length} içeriği kalıcı olarak silmek istediğinize emin misiniz?`)) {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/contents/bulk-delete`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedContents })
        });
        if(res.ok) {
          setContents(contents.filter(c => !selectedContents.includes(c.id)));
          setSelectedContents([]);
        }
      } catch(err) { console.error("Bulk delete error", err); }
    }
  };

  const handleDeleteAnswer = async (ansId) => {
    if(window.confirm("Yanıtı tamamen silmek istiyor musunuz?")) {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/answers/${ansId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) setAnswers(answers.filter(a => a.id !== ansId));
      } catch(err) { console.error(err); }
    }
  };

  const handleHideAnswer = async (ansId) => {
    try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/answers/${ansId}/hide`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) {
            const data = await res.json();
            setAnswers(answers.map(a => a.id === ansId ? {...a, is_hidden: data.is_hidden} : a));
        }
    } catch(err) { console.error(err); }
  };

  // --- İŞLEVSEL FONKSİYONLAR ---

  // İçeriği Sil
  const handleDelete = async (id) => {
    if (window.confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz? (Tüm cevapları da silinecektir)")) {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/contents/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          setContents(contents.filter(c => c.id !== id));
          if (selectedContent?.id === id) setSelectedContent(null);
        } else {
          alert("Silme işlemi başarısız oldu.");
        }
      } catch (err) {
        console.error("Silme hatası", err);
      }
    }
  };

  // İçeriğin Durumunu Değiştir (Yayında <-> Askıya Alındı)
  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_BASE}/admin/contents/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setContents(contents.map(c => {
          if (c.id === id) {
            if (selectedContent?.id === id) {
                setSelectedContent({ ...c, status: data.new_status });
            }
            return { ...c, status: data.new_status };
          }
          return c;
        }));
      } else {
        alert("Durum güncellenemedi.");
      }
    } catch (err) {
      console.error("Askıya alma hatası", err);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">İçerik ve Şikayet Denetimi</h2>

      {/* --- İÇERİK İNCELEME MODALI --- */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161b2c] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Üst Başlık */}
            <div className="p-6 border-b border-white/10 bg-[#1a2035] flex justify-between items-center pr-16">
              <h3 className="text-white font-bold flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400"/> İçerik Detayı
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10">
                  {selectedContent.category}
                </span>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-lg border ${selectedContent.status === 'Yayında' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {selectedContent.status}
                </span>
              </div>
            </div>

            {/* Kapat Butonu */}
            <button onClick={() => setSelectedContent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {/* İçerik Gövdesi */}
            <div className="p-8 space-y-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-black text-white">{selectedContent.title}</h4>
                  {selectedContent.reports > 0 && (
                    <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-500/20 shrink-0">
                      <AlertTriangle size={14} /> {selectedContent.reports} Şikayet
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
                  <span>Yazar: <span className="text-slate-300">{selectedContent.author}</span></span>
                  <span>•</span>
                  <span>{selectedContent.date}</span>
                </div>
                
                {/* Soru Metni */}
                <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl p-6 text-slate-300 leading-relaxed text-sm">
                  {selectedContent.content}
                </div>

                {/* Yanıtlar Bölümü */}
                <div className="mt-8">
                  <h5 className="text-white font-bold text-sm mb-4 flex items-center gap-2 border-b border-white/10 pb-3"><MessageSquare size={16} className="text-blue-400"/> Bu Soruya Verilen Yanıtlar</h5>
                  <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                    {answers.length > 0 ? answers.map((ans) => (
                      <div key={ans.id} className={`bg-white/5 border ${ans.is_hidden ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} rounded-xl p-4 relative group hover:bg-white/10 transition-colors`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            {ans.author}
                            {ans.is_hidden && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">Gizlendi</span>}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleHideAnswer(ans.id)} className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${ans.is_hidden ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'}`}>
                              {ans.is_hidden ? 'Göster' : 'Gizle'}
                            </button>
                            <button onClick={() => handleDeleteAnswer(ans.id)} className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors">Sil</button>
                          </div>
                        </div>
                        <p className={`text-sm ${ans.is_hidden ? 'text-slate-400 italic' : 'text-slate-300'}`}>{ans.content}</p>
                      </div>
                    )) : (
                      <p className="text-slate-400 text-sm italic text-center py-4">Bu soruya henüz yanıt verilmemiş.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => handleToggleStatus(selectedContent.id)} 
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${selectedContent.status === 'Yayında' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                >
                  {selectedContent.status === 'Yayında' ? <><Ban size={16}/> İçeriği Askıya Al</> : <><CheckCircle size={16}/> Yayına Geri Al</>}
                </button>
                <button 
                  onClick={() => handleDelete(selectedContent.id)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} /> İçeriği Tamamen Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLO --- */}
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 backdrop-blur-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Soru ve Cevaplar</h3>
          <div className="flex gap-3">
            {selectedContents.length > 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4">
                <span className="text-sm text-red-400 font-bold">{selectedContents.length} seçili</span>
                <div className="w-px h-4 bg-red-500/20 mx-1"></div>
                <button onClick={handleBulkDelete} className="text-xs font-bold text-red-400 hover:text-white transition-colors">Toplu Sil</button>
              </div>
            )}
            <div className="flex gap-2">
              {reportedCount > 0 ? (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <AlertTriangle size={14}/> {reportedCount} Şikayetli İçerik
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <CheckCircle size={14}/> Tüm İçerikler Temiz
                </span>
              )}
            </div>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="pb-3 w-12 text-center pl-4"><input type="checkbox" checked={selectedContents.length > 0 && selectedContents.length === contents.length} onChange={toggleSelectAll} className="accent-red-500 cursor-pointer w-4 h-4" /></th>
              <th className="pb-3 font-medium px-4">Soru Başlığı</th>
              <th className="pb-3 font-medium">Kategori</th>
              <th className="pb-3 font-medium">Yazar</th>
              <th className="pb-3 font-medium">Şikayet</th>
              <th className="pb-3 font-medium">Durum</th>
              <th className="pb-3 font-medium text-right px-4">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {contents.length > 0 ? contents.map((c) => (
              <tr key={c.id} className={`border-b border-white/10 hover:bg-white/5 transition-colors ${c.status === 'Askıya Alındı' ? 'opacity-60' : ''}`}>
                <td className="py-4 text-center pl-4"><input type="checkbox" checked={selectedContents.includes(c.id)} onChange={() => toggleSelectContent(c.id)} className="accent-red-500 cursor-pointer w-4 h-4" /></td>
                <td className="py-4 font-bold text-white max-w-[200px] truncate px-4">{c.title}</td>
                <td className="py-4"><span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-[#0a0f1d] border border-white/10 px-2.5 py-1.5 rounded-lg">{c.category}</span></td>
                <td className="py-4 text-slate-400 font-medium">{c.author}</td>
                <td className="py-4">
                  {c.reports > 0 ? (
                    <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg w-max text-xs font-bold border border-red-500/20">
                      <AlertTriangle size={14} /> {c.reports}
                    </span>
                  ) : (<span className="text-slate-600 font-bold pl-3">-</span>)}
                </td>
                <td className="py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider border ${c.status === 'Yayında' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                      {c.status}
                    </span>
                </td>
                <td className="py-4 flex justify-end gap-2 px-4">
                  <button 
                    onClick={() => handleOpenContent(c)} 
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" 
                    title="İçeriği İncele"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                    title="İçeriği Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400 italic">Hiç içerik bulunmuyor.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}