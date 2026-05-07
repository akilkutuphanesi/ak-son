import React, { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function DashboardTab() {
  const [stats, setStats] = useState([
    { title: "Toplam Kullanıcı", value: "...", increase: "", color: "text-blue-400" },
    { title: "Aktif Hesap", value: "...", increase: "", color: "text-emerald-400" },
    { title: "Toplam İçerik", value: "...", increase: "", color: "text-amber-400" },
    { title: "Çözülen Sorular", value: "...", increase: "", color: "text-purple-400" }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
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
              <div className="flex items-center gap-4 py-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle size={18} /></div>
                <div><p className="text-sm font-bold text-slate-200">Yeni bir soru çözüme kavuştu (Masa #07)</p><p className="text-xs text-slate-500">2 dakika önce</p></div>
              </div>
              <div className="flex items-center gap-4 py-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><AlertTriangle size={18} /></div>
                <div><p className="text-sm font-bold text-slate-200">"Sınav Soruları" başlıklı içeriğe şikayet geldi.</p><p className="text-xs text-slate-500">15 dakika önce</p></div>
              </div>
              <div className="flex items-center gap-4 py-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Users size={18} /></div>
                <div><p className="text-sm font-bold text-slate-200">Elif B. sisteme yeni kayıt oldu.</p><p className="text-xs text-slate-500">1 saat önce</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}