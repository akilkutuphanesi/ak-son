import React, { useState } from 'react';
import { ChevronLeft, Camera, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileSettings() {
  const [name, setName] = useState("İsim Soyisim");

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-red-500 mb-8 transition-colors">
          <ChevronLeft size={20} /> Geri Dön
        </Link>
        
        <h1 className="text-4xl font-black mb-12">Profil <span className="text-red-500">Ayarları</span></h1>

        <div className="space-y-8 bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
          {/* Avatar Değiştirme */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-32 w-32 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl">
                İN
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-red-600 rounded-full border-4 border-[#0a0f1d] hover:scale-110 transition-transform">
                <Camera size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Profil Fotoğrafını Güncelle</p>
          </div>

          {/* Form Alanları */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Kullanıcı İsmi</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Bölüm (Kayıtlı)</label>
              <input value="Bilgisayar Mühendisliği" readOnly className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-500 cursor-not-allowed outline-none" />
            </div>

            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/20">
              <Check size={20} /> Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}