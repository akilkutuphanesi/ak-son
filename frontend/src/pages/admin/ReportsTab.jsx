import React from 'react';
import { BarChart, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsTab() {
  // Görsellik için sahte veriler
  const departmentData = [
    { dept: "Bilgisayar Müh.", val: 65, color: "bg-blue-500" },
    { dept: "Yazılım Müh.", val: 45, color: "bg-indigo-500" },
    { dept: "Makine Müh.", val: 25, color: "bg-emerald-500" },
    { dept: "Diğer", val: 15, color: "bg-slate-500" }
  ];

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">Raporlar ve Detaylı Analiz</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bölümlere Göre Aktivite */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PieChart size={20} className="text-blue-400" /> 
              Bölümlere Göre Soru Dağılımı
            </h3>
            <div className="space-y-6">
                {departmentData.map((d, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm text-white mb-2">
                          <span className="font-medium">{d.dept}</span>
                          <span className="font-bold">%{d.val}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5">
                          <div className={`${d.color} h-2.5 rounded-full`} style={{ width: `${d.val}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Gelecek Grafikler İçin Yer Tutucu */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center text-center text-slate-400 min-h-[300px]">
            <BarChart size={64} className="mb-4 opacity-50 text-red-400"/>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Gelişmiş Grafik Modülü</h3>
            <p className="text-sm max-w-xs leading-relaxed">
              Bu alan, Spring Boot backend'i bağlandığında haftalık aktiflik ve çözülen soru eğrilerini gösterecek şekilde aktif olacaktır.
            </p>
            <div className="mt-6 px-4 py-2 bg-white/5 rounded-lg text-xs font-bold text-slate-400 uppercase tracking-widest border border-white/10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              API Bekleniyor
            </div>
        </div>
        
        {/* Ekstra İstatistik Kartı */}
        <div className="md:col-span-2 bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-400" />
              Haftalık Büyüme Oranı
            </h3>
            <p className="text-sm text-slate-400">Geçen haftaya göre kütüphane sistemine katılım istatistiği</p>
          </div>
          <div className="text-4xl font-black text-red-400">
            +%34.2
          </div>
        </div>

      </div>
    </>
  );
}