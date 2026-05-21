import React, { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function DashboardTab() {
  const [stats, setStats] = useState([
    { title: "Toplam Kullanıcı", value: "...", increase: "", color: "text-blue-400" },
    { title: "Aktif Hesap", value: "...", increase: "", color: "text-emerald-400" },
    { title: "Toplam İçerik", value: "...", increase: "", color: "text-amber-400" },
    { title: "Çözülen Sorular", value: "...", increase: "", color: "text-purple-400" }
  ]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
        const resChart = await fetch(`${API_BASE}/admin/stats/chart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resChart.ok) {
          const dataChart = await resChart.json();
          setChartData(dataChart);
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-black text-white mb-8">Sisteme Genel Bakış</h2>
      
      <div className="space-y-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-current ${stat.color}`}></div>
              <p className="text-slate-400 text-sm font-medium mb-2">{stat.title}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                <span className={`text-xs font-bold ${stat.color} bg-white/5 px-2 py-1 rounded-lg`}>{stat.increase}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Etkileşim Grafiği (Bar Chart - Custom CSS) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative z-0">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2"><Activity size={20} className="text-purple-400"/> Son 7 Günlük Etkileşim (Soru & Cevap)</h3>
          
          <div className="flex items-end justify-between gap-1 md:gap-4 h-56 pt-4 border-b border-white/10 pb-0 pl-8 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0 pl-8">
              {[100, 75, 50, 25, 0].map((line, i) => (
                <div key={i} className="w-full border-t border-white/10 relative">
                  <span className="absolute -top-2.5 -left-8 text-[10px] font-mono text-slate-400">{line}</span>
                </div>
              ))}
            </div>
            
            {/* Bars */}
            {chartData.length > 0 ? chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group z-10 h-full justify-end cursor-pointer">
                <div className="w-6 sm:w-10 md:w-16 bg-gradient-to-t from-purple-900/40 via-purple-600/80 to-purple-400 rounded-t-xl transition-all duration-300 group-hover:brightness-125 relative shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]" style={{ height: `${d.val}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a2035] border border-white/10 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl flex items-center justify-center min-w-[32px]">
                    {d.val}
                  </div>
                </div>
                <span className="text-slate-400 text-[10px] md:text-xs font-bold mt-3 uppercase tracking-wider">{d.day}</span>
              </div>
            )) : <p className="text-slate-400 text-sm italic py-10 w-full text-center absolute">Veri yükleniyor...</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sistem Sağlığı */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Server size={20} className="text-blue-400"/> Sistem Sağlığı</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">CPU Kullanımı</span><span className="text-emerald-400 font-bold">%24</span></div>
                <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">RAM (Veritabanı)</span><span className="text-amber-400 font-bold">%68</span></div>
                <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '68%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Ağ Trafiği</span><span className="text-blue-400 font-bold">Normal</span></div>
                <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
              </div>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity size={20} className="text-emerald-400"/> Son Canlı Aktiviteler</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle size={18} /></div>
                <div><p className="text-sm font-bold text-slate-300">Yeni bir soru çözüme kavuştu (Masa #07)</p><p className="text-xs text-slate-400">2 dakika önce</p></div>
              </div>
              <div className="flex items-center gap-4 py-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><AlertTriangle size={18} /></div>
                <div><p className="text-sm font-bold text-slate-300">"Sınav Soruları" başlıklı içeriğe şikayet geldi.</p><p className="text-xs text-slate-400">15 dakika önce</p></div>
              </div>
              <div className="flex items-center gap-4 py-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Users size={18} /></div>
                <div><p className="text-sm font-bold text-slate-300">Elif B. sisteme yeni kayıt oldu.</p><p className="text-xs text-slate-400">1 saat önce</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}