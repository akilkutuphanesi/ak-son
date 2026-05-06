import React, { useState } from 'react';
import { Settings, ToggleRight, ToggleLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({ maintenance: false, registrations: true, autoBan: false });
  
  // Kaydetme animasyonu için stateler
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setShowSuccess(false);
    
    // Backend'e gidiyormuş gibi 1.5 saniye bekletiyoruz
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      
      // Başarı mesajını 3 saniye sonra gizle
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">Sistem Kontrol Paneli</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl relative">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings size={20}/> Sistem Ayarları</h3>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div>
                    <h4 className="text-white font-bold text-sm">Bakım Modu</h4>
                    <p className="text-xs text-slate-400 mt-1">Uygulamayı geçici olarak öğrencilerin erişimine kapatır.</p>
                </div>
                <button onClick={() => setSettings({...settings, maintenance: !settings.maintenance})} className={settings.maintenance ? "text-red-500" : "text-slate-500"}>
                    {settings.maintenance ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div>
                    <h4 className="text-white font-bold text-sm">Yeni Kayıtları Al</h4>
                    <p className="text-xs text-slate-400 mt-1">Öğrencilerin sisteme yeni kayıt olmasını sağlar.</p>
                </div>
                <button onClick={() => setSettings({...settings, registrations: !settings.registrations})} className={settings.registrations ? "text-emerald-500" : "text-slate-500"}>
                    {settings.registrations ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div>
                    <h4 className="text-white font-bold text-sm">Otomatik Şikayet Banı</h4>
                    <p className="text-xs text-slate-400 mt-1">5 şikayet alan içeriği otomatik olarak askıya alır.</p>
                </div>
                <button onClick={() => setSettings({...settings, autoBan: !settings.autoBan})} className={settings.autoBan ? "text-emerald-500" : "text-slate-500"}>
                    {settings.autoBan ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
            </div>
            
            {/* KAYDET BUTONU VE MESAJ */}
            <div className="pt-4">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <><Loader2 className="animate-spin" size={18} /> Kaydediliyor...</>
                ) : (
                  'Ayarları Veritabanına Kaydet'
                )}
              </button>
              
              {/* Başarı Mesajı */}
              {showSuccess && (
                <div className="absolute bottom-[-50px] left-0 right-0 flex justify-center animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={16} /> Sistem ayarları başarıyla güncellendi!
                  </div>
                </div>
              )}
            </div>
            
        </div>
      </div>
    </>
  );
}