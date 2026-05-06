/**
 * AdminLayout2.jsx
 * ─────────────────────────────────────────────
 * Mevcut AdminLayout.jsx dosyasına DOKUNULMADAN oluşturulmuş
 * genişletilmiş admin layout'u.
 *
 * YENİ SEKMELER:
 *   /admin2/announcements  → AnnouncementsTab
 *   /admin2/audit-log      → AuditLogTab
 *   /admin2/departments    → DepartmentsTab
 *
 * KULLANIM (App.jsx'e eklenecek — şu an dokunulmamıştır):
 *   import AdminLayout2      from './pages/admin/AdminLayout2';
 *   import AnnouncementsTab  from './pages/admin/AnnouncementsTab';
 *   import AuditLogTab       from './pages/admin/AuditLogTab';
 *   import DepartmentsTab    from './pages/admin/DepartmentsTab';
 *
 *   <Route path="/admin2" element={<AdminLayout2 />}>
 *     <Route index             element={<DashboardTab />} />
 *     <Route path="users"        element={<UsersTab />} />
 *     <Route path="content"      element={<ContentTab />} />
 *     <Route path="reports"      element={<ReportsTab />} />
 *     <Route path="settings"     element={<SettingsTab />} />
 *     <Route path="announcements" element={<AnnouncementsTab />} />
 *     <Route path="audit-log"    element={<AuditLogTab />} />
 *     <Route path="departments"  element={<DepartmentsTab />} />
 *   </Route>
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart, Settings, Search,
  Bell, LogOut, ChevronDown, CheckCheck, ShieldAlert, Megaphone,
  Activity, GraduationCap, BellOff, CheckCircle2
} from 'lucide-react';

const BASE = '/admin2';

export default function AdminLayout2() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const globalSearchData = [
    { type: 'user',         title: 'Ahmet Yılmaz',                  desc: '2024101 - Bilgisayar Müh.',   path: `${BASE}/users` },
    { type: 'user',         title: 'Zeynep Kaya',                   desc: '2024102 - Yazılım Müh.',      path: `${BASE}/users` },
    { type: 'content',      title: 'Java OOP Konusunda Takıldım',   desc: 'Soru - Yazar: Ahmet Y.',      path: `${BASE}/content` },
    { type: 'announcement', title: '🎓 Dönem Sonu Sınav Takvimi',   desc: 'Duyuru - Yayında',            path: `${BASE}/announcements` },
    { type: 'setting',      title: 'Bakım Modu',                    desc: 'Sistem Ayarları',              path: `${BASE}/settings` },
    { type: 'department',   title: 'Bilgisayar Mühendisliği',       desc: 'CS - 420 öğrenci',            path: `${BASE}/departments` },
  ];

  const filteredSearch = globalSearchData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [notifications, setNotifications] = useState([
    { id: 1, content: 'Sistem yedeği başarıyla alındı.', created_at: new Date(Date.now() - 600000).toISOString(), read: false },
    { id: 2, content: 'Yeni kullanıcı sisteme kayıt oldu.', created_at: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 3, content: '"Sınav Soruları" içeriğine yeni şikayet geldi.', created_at: new Date(Date.now() - 7200000).toISOString(), read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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

  const displayName = localStorage.getItem('custom_display_name') || 'Admin';
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'A';

  const menuItems = [
    { id: 'dashboard',     path: BASE,                     icon: LayoutDashboard, label: 'Dashboard',            exact: true },
    { id: 'users',         path: `${BASE}/users`,          icon: Users,           label: 'Kullanıcı Yönetimi' },
    { id: 'content',       path: `${BASE}/content`,        icon: FileText,        label: 'İçerik Denetimi' },
    { id: 'departments',   path: `${BASE}/departments`,    icon: GraduationCap,   label: 'Bölüm Yönetimi',       isNew: true },
    { id: 'announcements', path: `${BASE}/announcements`,  icon: Megaphone,       label: 'Duyurular',             isNew: true },
    { id: 'reports',       path: `${BASE}/reports`,        icon: BarChart,        label: 'Raporlar & Analiz' },
    { id: 'audit-log',     path: `${BASE}/audit-log`,      icon: Activity,        label: 'Denetim Kaydı',         isNew: true },
    { id: 'settings',      path: `${BASE}/settings`,       icon: Settings,        label: 'Sistem Ayarları' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const ICON_COLOR = {
    'departments':   'text-indigo-400',
    'announcements': 'text-amber-400',
    'audit-log':     'text-emerald-400',
  };

  return (
    <div className="flex h-screen bg-[#0a0f1d] text-slate-300 font-sans selection:bg-red-500/30 overflow-hidden relative">

      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0f1d]/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-20">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 cursor-pointer shrink-0"
          onClick={() => navigate(BASE)}>
          <img src="/logo.png" className="w-10 h-10 brightness-0 invert object-contain" alt="Logo"
            onError={e => e.target.style.display = 'none'} />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">
              Akıl <span className="text-red-600">Panel</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Yönetici Modülü v2</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Separator label */}
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 pb-2 pt-1">Yönetim</p>

          {menuItems.slice(0, 4).map((item) => {
            const active = isActive(item);
            const newIcon = item.isNew;
            return (
              <Link key={item.id} to={item.path} onClick={closeAllMenus}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={17} className={!active && ICON_COLOR[item.id] ? ICON_COLOR[item.id] : ''} />
                {item.label}
                {newIcon && !active && (
                  <span className="ml-auto text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                    Yeni
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-3 border-t border-white/5" />
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 pb-2">İçerik</p>

          {menuItems.slice(4, 7).map((item) => {
            const active = isActive(item);
            const newIcon = item.isNew;
            return (
              <Link key={item.id} to={item.path} onClick={closeAllMenus}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={17} className={!active && ICON_COLOR[item.id] ? ICON_COLOR[item.id] : ''} />
                {item.label}
                {newIcon && !active && (
                  <span className="ml-auto text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                    Yeni
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-3 border-t border-white/5" />
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 pb-2">Sistem</p>

          {menuItems.slice(7).map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.id} to={item.path} onClick={closeAllMenus}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ALT ÇIKIŞ BUTONU */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut size={16} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/10 h-20 flex justify-between items-center px-8">

          {/* ARAMA */}
          <div className="relative w-96 hidden md:block z-50">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-red-500' : 'text-slate-500'}`} size={17} />
            <input type="text" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setIsProfileOpen(false); setIsNotificationsOpen(false); }}
              placeholder="Sistemde ara..."
              className="w-full bg-[#161b2c] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-inner transition-all"
            />
            {searchQuery.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-[#161b2c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredSearch.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredSearch.map((item, idx) => (
                      <button key={idx} onClick={() => { navigate(item.path); setSearchQuery(''); }}
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group/item">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          {item.type === 'user'         && <Users size={13} className="text-blue-400" />}
                          {item.type === 'content'      && <FileText size={13} className="text-amber-400" />}
                          {item.type === 'setting'      && <Settings size={13} className="text-slate-400" />}
                          {item.type === 'announcement' && <Megaphone size={13} className="text-red-400" />}
                          {item.type === 'department'   && <GraduationCap size={13} className="text-indigo-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover/item:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <Search size={22} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-white">Sonuç bulunamadı</p>
                    <p className="text-xs mt-1">"{searchQuery}" için kayıt yok.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto relative">
            <div className="hidden md:flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
              <ShieldAlert size={13} className="text-red-400" />
              <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Yetkili Erişim</span>
            </div>

            {/* BİLDİRİMLER */}
            <div className="relative">
              <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); setSearchQuery(''); }}
                className={`p-2.5 rounded-full border transition-all ${isNotificationsOpen ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0f1d] animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-16 right-0 w-80 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#1a2035] flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20 transition-colors">
                        <CheckCheck size={13} /> Tümü Okundu
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex gap-3 ${notif.read ? 'opacity-50' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-white/5' : 'bg-blue-500/20'}`}>
                          <CheckCircle2 size={13} className={notif.read ? 'text-slate-500' : 'text-blue-400'} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">{notif.content}</p>
                          <span className="text-[10px] text-slate-600 mt-1 block">
                            {new Date(notif.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                        <BellOff size={30} className="mb-3 opacity-50" />
                        <p className="text-xs font-bold italic">Bildirim yok.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFİL */}
            <div className="relative">
              <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); setSearchQuery(''); }}
                className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0f1d] shadow-lg">
                  {getInitial(displayName)}
                </div>
                <ChevronDown size={15} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-red-500' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute top-16 right-0 w-72 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-900/50 to-red-600/50 p-5 flex flex-col items-center border-b border-white/5">
                    <div className="h-14 w-14 bg-white text-red-600 rounded-full flex items-center justify-center text-xl font-black mb-2 shadow-xl">
                      {getInitial(displayName)}
                    </div>
                    <h3 className="text-white font-bold">{displayName}</h3>
                    <span className="text-xs text-red-200 bg-black/20 px-3 py-1 rounded-full mt-1">Süper Admin</span>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { navigate(`${BASE}/settings`); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-white/5 rounded-xl text-sm group transition-colors">
                      <Settings size={15} className="text-blue-400" /> Sistem Ayarları
                    </button>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm transition-colors">
                      <LogOut size={15} className="text-red-400" /> Güvenli Çıkış
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* İÇERİK */}
        <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar" onClick={closeAllMenus}>
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
