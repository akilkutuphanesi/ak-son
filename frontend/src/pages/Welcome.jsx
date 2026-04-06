import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ScanLine, MessageCircle, Users, GraduationCap, Lightbulb, X } from 'lucide-react';

export default function Welcome() {
  // ✅ FIX: Ekip bölümü hover yerine click ile çalışsın (mobil uyumluluk)
  const [isEkipOpen, setIsEkipOpen] = useState(false);

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-[#0a0f1d] selection:bg-red-500/30 overflow-x-hidden w-full">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      {/* ✅ FIX: pointer-events-none arka plan objeleri yatay taşmayı önlemek için overflow-hidden ile içinde tutuldu */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-amber-900/10 rounded-full blur-[100px] -translate-x-1/2"></div>
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-10 mix-blend-overlay"
          alt="Library Background"
        />
      </div>

      {/* --- ÜST MENÜ (Navbar) --- */}
      {/* ✅ FIX: Navbar px-4 ile mobilde sıkışma önlendi. Butonlar mobilde de görünür hale getirildi */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-5 md:p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3 group cursor-pointer min-w-0">
          <div className="p-1.5 flex-shrink-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl group-hover:scale-105 group-hover:bg-white/10 transition-all">
            <img 
                src="/logo.png" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                alt="Akıl Kütüphanesi Logo"
                onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/tr/6/66/%C4%B0skenderun_Teknik_%C3%9Cniversitesi_logo.png" }} 
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-white leading-none drop-shadow-lg truncate">
                Akıl <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">Kütüphanesi</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-red-200/60 uppercase tracking-widest mt-1 hidden sm:block">
                İskenderun Teknik Üniversitesi
            </p>
          </div>
        </div>

        {/* ✅ FIX: Mobilde de Giriş/Kayıt butonları görünsün (küçük ve kompakt) */}
        <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
          <Link to="/login" className="text-xs md:text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider">
            Giriş
          </Link>
          <Link to="/register" className="px-3 py-2 md:px-6 md:py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs md:text-sm font-bold uppercase tracking-wider transition-all backdrop-blur-md">
            Kayıt Ol
          </Link>
        </div>
      </nav>

      {/* --- ANA İÇERİK (Hero Section) --- */}
      {/* ✅ FIX: px-4 ile mobilde kenarlara yapışmayı önle, overflow-hidden taşmaları engelle */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-8 md:mt-0 max-w-5xl mx-auto w-full overflow-x-hidden">
        
        {/* --- UÇUŞAN HEDEFLER (Sadece Masaüstünde) --- */}
        {/* ✅ FIX: Sadece lg: breakpoint'te göster - mobilde yatay taşma yapıyordu */}
        <div className="hidden lg:flex absolute left-[-80px] top-[25%] animate-float items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-full shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <GraduationCap size={20} />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">Akran Eğitimi</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Birlikte Gelişim</p>
            </div>
        </div>

        <div className="hidden lg:flex absolute right-[-60px] top-[40%] animate-float-delayed items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-full shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Lightbulb size={20} />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">Anında Çözüm</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Hızlı Soru & Cevap</p>
            </div>
        </div>

        {/* Başlık */}
        {/* ✅ FIX: Mobilde text-3xl ile başla, büyük ekranda text-7xl */}
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-4 md:mb-6 leading-[1.1] mt-8 md:mt-10 w-full">
          Kütüphanede <br className="hidden md:block" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400">
            Yalnız Çalışmaya Son.
          </span>
        </h2>
        
        {/* Alt Metin */}
        {/* ✅ FIX: Mobilde text-sm, geniş ekranda text-lg */}
        <p className="max-w-2xl text-sm md:text-lg text-slate-400 mb-8 md:mb-12 leading-relaxed font-medium px-2">
          Masandaki QR kodu okut, İSTE kütüphanesindeki diğer öğrencilerle anında soru-cevap yap. 
          Çözümü bul, masanı paylaş, akran eğitiminin gücünü keşfet!
        </p>
        
        {/* Butonlar */}
        {/* ✅ FIX: flex-col sm:flex-row ile mobilde alt alta, geniş ekranda yan yana. z-20 ve w-full px-4 ile dış taşma engellendi */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 z-20">
          <Link to="/register" className="group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 md:px-10 rounded-2xl transition-all duration-300 shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:shadow-[0_10px_50px_rgba(220,38,38,0.6)] hover:-translate-y-1">
            <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="uppercase tracking-wider text-sm">Ağa Katıl ve Soru Sor</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Link>
        </div>

        {/* Alt Özellikler (Cam Kartlar) */}
        {/* ✅ FIX: grid-cols-1 sm:grid-cols-3, padding küçültüldü ve tam olarak taşma kontrol altına alındı */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full relative z-10">
          
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-3 hover:bg-[#121826]/80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-5 md:mb-6 border border-red-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-red-500/20 shadow-lg">
              <ScanLine size={28} />
            </div>
            <h3 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3 tracking-tight relative z-10">QR ile Bağlan</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium relative z-10">Masandaki kodu okut, hangi masada olduğunu sisteme anında bildir.</p>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-3 hover:bg-[#121826]/80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-5 md:mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500/20 shadow-lg">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3 tracking-tight relative z-10">Soru Sor & Çöz</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium relative z-10">Kendi bölümündeki öğrencilerin sorduğu soruları gör ve onlara yardım et.</p>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-3 hover:bg-[#121826]/80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-5 md:mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:bg-amber-500/20 shadow-lg">
              <Users size={28} />
            </div>
            <h3 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3 tracking-tight relative z-10">Masanı Paylaş</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium relative z-10">Doğru cevabı veren öğrenciyle masanı paylaşarak yüz yüze çalış.</p>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <div className="relative z-10 w-full text-center pb-10 md:pb-12 mt-12 md:mt-16 flex flex-col items-center gap-6">
        
        {/* ✅ CRITICAL FIX: Ekip bölümü
            Sorun: CSS :hover sınıfı mobil cihazlarda (dokunmatik) çalışmaz.
            Çözüm: React state (isEkipOpen) + onClick ile kontrol. 
            z-index: z-30 ile overlay/pointer-events sorunu çözüldü. */}
        <div className="relative flex items-center justify-center h-12 z-30">
          {/* Yanıp sönen arka plan - pointer-events-none ile tıklamayı engellemiyor */}
          <div className="absolute animate-ping w-24 h-8 rounded-full bg-red-500/30 pointer-events-none"></div>
          
          {/* Ana buton - onClick ile toggleleniyor */}
          <button
            onClick={() => setIsEkipOpen(!isEkipOpen)}
            className="relative z-10 flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden transition-all duration-700 ease-out h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            style={{ 
              width: isEkipOpen ? '300px' : '120px',
              boxShadow: isEkipOpen ? '0 0 30px rgba(239,68,68,0.4)' : undefined
            }}
            aria-label="Ekibi Göster"
          >
            {/* Kapalı hali: "Ekip" yaz */}
            <span 
              className="absolute inset-0 flex items-center justify-center text-sm font-bold tracking-widest text-white/90 transition-all duration-500"
              style={{ 
                opacity: isEkipOpen ? 0 : 1,
                transform: isEkipOpen ? 'translateY(-16px)' : 'translateY(0)'
              }}
            >
              <span className="animate-bounce mr-2">✨</span> Ekip
            </span>

            {/* Açık hali: İsimler */}
            <span 
              className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 transition-all duration-700 delay-100"
              style={{ 
                opacity: isEkipOpen ? 1 : 0,
                transform: isEkipOpen ? 'translateY(0)' : 'translateY(16px)'
              }}
            >
              İrem • Nil • Berfin
            </span>
          </button>
        </div>

        <p className="text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase">
            İSTE &copy; 2026
        </p>
      </div>
    </div>
  );
}