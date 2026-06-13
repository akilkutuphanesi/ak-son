import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BarChart, Settings, Search, Bell, LogOut, User as UserIcon, CheckCircle2, BellOff, ChevronDown, CheckCheck, ShieldAlert, BookOpen } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Menü Stateleri
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // --- ARAMA (SEARCH) STATELERİ VE SAHTE VERİLER ---
  const [searchQuery, setSearchQuery] = useState('');

  // Arama yapılacak global veritabanı simülasyonu
  const globalSearchData = [];

  // Arama metnine göre filtreleme
  const filteredSearch = globalSearchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- BİLDİRİM STATE'LERİ ---
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
    setSearchQuery(''); // Menü açılırken aramayı temizle
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const closeAllMenus = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setSearchQuery('');
  };

  const displayName = localStorage.getItem('custom_display_name') || "Admin";
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "A";

  const menuItems = [
    { id: 'dashboard', path: '/admin',          icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users',     path: '/admin/users',     icon: Users,           label: 'Kullanıcı Yönetimi' },
    { id: 'content',   path: '/admin/content',   icon: FileText,        label: 'İçerik Denetimi' },
    { id: 'rooms',     path: '/admin/rooms',     icon: BookOpen,        label: 'Çalışma Odaları' },
    { id: 'reports',   path: '/admin/reports',   icon: BarChart,        label: 'Raporlar & Analiz' },
    { id: 'settings',  path: '/admin/settings',  icon: Settings,        label: 'Sistem Ayarları' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0f1d] text-slate-300 font-sans selection:bg-red-500/30 overflow-hidden relative">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0a0f1d]/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-20">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 cursor-pointer" onClick={() => navigate('/admin')}>
          <img src="/logo.png" className="w-10 h-10 brightness-0 invert object-contain" alt="Logo" onError={(e) => e.target.style.display='none'} />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Akıl <span className="text-red-600">Panel</span></h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Yönetici Modülü</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.id} to={item.path} onClick={closeAllMenus} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- ANA İÇERİK BÖLÜMÜ --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* --- ÜST BAR (TOPBAR) --- */}
        <header className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-20 flex justify-between items-center px-8">
          
          {/* ARAMA ÇUBUĞU VE AÇILIR MENÜSÜ */}
          <div className="relative w-96 hidden md:block group z-50">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-red-500' : 'text-slate-500'}`} size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsProfileOpen(false);
                setIsNotificationsOpen(false);
              }}
              placeholder="Sistemde ara (Kullanıcı, İçerik, Ayar)..." 
              className="w-full bg-[#161b2c] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all" 
            />
            
            {/* Arama Sonuçları */}
            {searchQuery.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-[#161b2c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredSearch.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredSearch.map((item, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { navigate(item.path); setSearchQuery(''); }} 
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-colors">
                          {item.type === 'user' && <Users size={14} className="text-blue-400" />}
                          {item.type === 'content' && <FileText size={14} className="text-amber-400" />}
                          {item.type === 'setting' && <Settings size={14} className="text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover/item:text-white transition-colors">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 flex flex-col items-center">
                    <Search size={24} className="mb-2 opacity-50" />
                    <p className="text-sm font-bold text-white">Sonuç bulunamadı</p>
                    <p className="text-xs mt-1">"{searchQuery}" için eşleşen bir kayıt yok.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto relative">
            <div className="hidden md:flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                <ShieldAlert size={14} className="text-red-400" /><span className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Yetkili Erişim</span>
            </div>

            {/* GECE LAMBASI TOGGLE */}
            <ThemeToggle size="sm" label={false} />

            {/* BİLDİRİMLER */}
            <div className="relative">
              <button onClick={toggleNotifications} className={`p-2.5 rounded-full border transition-all ${isNotificationsOpen ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0f1d] animate-bounce">{unreadCount}</span>}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#1a2035] flex justify-between items-center">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Sistem Bildirimleri</h3>
                      {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                              <CheckCheck size={14} /> Tümü Okundu
                          </button>
                      )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 ${notif.read ? 'opacity-50' : ''}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-white/5' : 'bg-blue-500/20'}`}>
                            <CheckCircle2 size={14} className={notif.read ? 'text-slate-500' : 'text-blue-400'} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">{notif.content}</p>
                            <span className="text-[10px] text-slate-600 mt-1 block">{new Date(notif.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                        <BellOff size={32} className="mb-3 opacity-50" />
                        <p className="text-xs font-bold italic">Okunmamış bildirim yok.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFİL */}
            <div className="relative">
              <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); setSearchQuery(''); }} className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0f1d] shadow-lg">
                  {getInitial(displayName)}
                </div>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-red-500' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-900/50 to-red-600/50 p-6 flex flex-col items-center border-b border-white/5">
                    <div className="h-16 w-16 bg-white text-red-600 rounded-full flex items-center justify-center text-2xl font-black mb-3 shadow-xl">{getInitial(displayName)}</div>
                    <h3 className="text-white font-bold text-lg">{displayName}</h3>
                    <span className="text-xs text-red-200 bg-black/20 px-3 py-1 rounded-full mt-1 backdrop-blur-sm">Süper Admin</span>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button onClick={() => { navigate('/admin/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-white/5 rounded-xl text-sm group transition-colors">
                      <Settings size={16} className="text-blue-400 group-hover:scale-110 transition-transform" /> Sistem Ayarları
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm group transition-colors">
                      <LogOut size={16} className="text-red-400 group-hover:-translate-x-1 transition-transform" /> Güvenli Çıkış
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* İÇERİK BÖLÜMÜ (Tıklanınca menüleri kapatır) */}
        <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar" onClick={closeAllMenus}>
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
}