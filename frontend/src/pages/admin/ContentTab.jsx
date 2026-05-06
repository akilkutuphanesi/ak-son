import React, { useState } from 'react';
import { AlertTriangle, Eye, Trash2, X, Ban, CheckCircle, MessageSquare } from 'lucide-react';

export default function ContentTab() {
  // Dinamik İçerik State'i
  const [contents, setContents] = useState([
    { 
      id: 101, 
      author: "Ahmet Y.", 
      title: "Java OOP Konusunda Takıldım", 
      content: "Arkadaşlar interface ve abstract class arasındaki farkı bir türlü tam oturtamadım, Spring Boot'ta hangisini nerede kullanmalıyım? Müsait olan biri kısaca özetleyebilir mi?",
      reports: 0, 
      status: "Yayında", 
      category: "Yazılım",
      date: "10 dk önce"
    },
    { 
      id: 102, 
      author: "Caner U.", 
      title: "Sınav soruları sızdırıldı (Linkli)", 
      content: "Beyler yarınki vize sorularını buldum bu linkten indirebilirsiniz: http://calinti-link-ornegi.com",
      reports: 12, 
      status: "Askıya Alındı", 
      category: "Genel",
      date: "1 saat önce"
    },
    { 
      id: 103, 
      author: "Elif B.", 
      title: "Türev integral özet notlarım", 
      content: "Vize öncesi kendi çıkardığım PDF notları paylaşıyorum, umarım işinize yarar.",
      reports: 1, 
      status: "Yayında", 
      category: "Matematik",
      date: "3 saat önce"
    },
  ]);

  // Modal State'i
  const [selectedContent, setSelectedContent] = useState(null);

  // Otomatik hesaplanan şikayetli içerik sayısı
  const reportedCount = contents.filter(c => c.reports > 0).length;

  // --- İŞLEVSEL FONKSİYONLAR ---

  // İçeriği Sil
  const handleDelete = (id) => {
    if (window.confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz?")) {
      setContents(contents.filter(c => c.id !== id));
      if (selectedContent?.id === id) setSelectedContent(null); // Eğer modal açıksa onu da kapat
    }
  };

  // İçeriğin Durumunu Değiştir (Yayında <-> Askıya Alındı)
  const handleToggleStatus = (id) => {
    setContents(contents.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Yayında' ? 'Askıya Alındı' : 'Yayında';
        // Eğer modal açıksa, içindeki veriyi de anlık güncellemek için state'i kopyalıyoruz
        if (selectedContent?.id === id) {
            setSelectedContent({ ...c, status: newStatus });
        }
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">İçerik ve Şikayet Denetimi</h2>

      {/* --- İÇERİK İNCELEME MODALI --- */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121826] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Üst Başlık */}
            <div className="p-6 border-b border-white/5 bg-[#1a2035] flex justify-between items-center pr-16">
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
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-6">
                  <span>Yazar: <span className="text-slate-300">{selectedContent.author}</span></span>
                  <span>•</span>
                  <span>{selectedContent.date}</span>
                </div>
                
                {/* Soru Metni */}
                <div className="bg-[#0a0f1d] border border-white/5 rounded-2xl p-6 text-slate-300 leading-relaxed text-sm">
                  {selectedContent.content}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
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
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
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
              <tr key={c.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${c.status === 'Askıya Alındı' ? 'opacity-60' : ''}`}>
                <td className="py-4 font-bold text-white max-w-[200px] truncate px-4">{c.title}</td>
                <td className="py-4"><span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-[#0a0f1d] border border-white/5 px-2.5 py-1.5 rounded-lg">{c.category}</span></td>
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
                    onClick={() => setSelectedContent(c)} 
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
                <td colSpan="6" className="text-center py-12 text-slate-500 italic">Hiç içerik bulunmuyor.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}