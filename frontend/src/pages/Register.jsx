import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, Lock, User, ChevronDown, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get('table');

  // Form verilerini tutacak State
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    department: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input değişimlerini yakala
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Yazmaya başlayınca hatayı sil
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Basit Ön Kontroller
    if (!formData.department) {
      setError("Lütfen bölümünüzü seçiniz.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      setError("Şifreniz en az 4 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Backend'e İstek Atma (Fetch)
      // localhost yerine 127.0.0.1 kullanıyoruz ki Windows'ta sorun çıkmasın
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          department: formData.department
          // Not: İsim ve Soyisim şimdilik backend'e gönderilmiyor, veritabanına eklenince buraya ekleriz.
        }),
      });

      // 3. Backend'den Gelen Cevabı Okuma
      const data = await response.json();

      // Eğer hata varsa (Örn: Email zaten kayıtlı)
      if (!response.ok) {
        throw new Error(data.detail || "Kayıt işlemi başarısız oldu.");
      }

      // 4. Başarılı Olursa
      alert("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz... 🚀");
      navigate('/login');

    } catch (err) {
      // Hata yakalama (Sunucu kapalıysa veya internet yoksa)
      console.error("Kayıt Hatası:", err);
      setError(err.message === "Failed to fetch" ? "Sunucuya bağlanılamadı! Backend'in çalıştığından emin olun." : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans p-4 bg-[#0a0f1d] selection:bg-red-500/30">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-10 mix-blend-overlay"
          alt="Library"
        />
      </div>

      {/* --- ANA SAYFAYA DÖN BUTONU --- */}
      <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white transition-all text-xs font-bold tracking-widest uppercase shadow-lg">
        <ArrowLeft size={16} />
        Ana Sayfa
      </Link>

      {/* --- ANA KART --- */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-12 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* SOL PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#8b1a1a] to-[#5a1010] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div> 
          
          <div className="relative z-10 space-y-10 text-left">
            <div className="space-y-2">
                <div className="w-16 h-1.5 bg-red-500 rounded-full mb-6"></div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Akıl <br />
                    <span className="text-red-400">Kütüphanesİ</span>
                </h2>
                <p className="text-sm font-bold text-red-200/40 tracking-[0.3em] uppercase pt-2">
                    İskenderun Teknİk Ünİversİtesİ
                </p>
            </div>

            <div className="w-full h-px bg-white/10"></div>

            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white/90">
                    Bilgi <br />
                    Paylaştıkça <br />
                    <span className="text-red-300/70 italic">Çoğalır.</span>
                </h1>
                <p className="text-sm md:text-base font-medium text-white/50 leading-relaxed max-w-[260px]">
                    Kütüphanenin sessizliğini dijital bir etkileşimle buluşturuyoruz.
                </p>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL (Form Alanı) */}
        <div className="md:col-span-7 bg-[#121826]/40 p-8 md:p-14 flex flex-col justify-center min-h-[750px]">
            
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Yeni Hesap Oluştur</h2>
                    <p className="text-slate-400 text-sm font-medium">Kütüphaneye giriş yapmak için bilgilerinizi girin.</p>
                </div>
                
                {tableNumber ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-400 font-bold text-[11px] uppercase tracking-widest text-xs">Masa #{tableNumber}</span>
                    </div>
                ) : (
                    <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={14} />
                        <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest text-center leading-none">Masa QR<br/>Gerekli</span>
                    </div>
                )}
            </div>

            {/* HATA MESAJI KUTUSU */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Kullanıcı Bilgileri (Sadece görsel, şimdilik backend'e gitmiyor) */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kullanıcı Bilgileri</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Adınız" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                                required 
                            />
                        </div>
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                placeholder="Soyadınız" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                                required 
                            />
                        </div>
                    </div>
                </div>

                {/* Bölüm Seçimi */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bölüm</label>
                    <div className="relative group">
                        <select 
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full bg-[#1a1f2e] border border-white/10 rounded-2xl py-4 px-5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all cursor-pointer"
                            required
                        >
                            <option value="" className="bg-[#1a1f2e]">Bölümünüzü Seçiniz...</option>
                            
                            <optgroup label="Mühendislik ve Doğa Bilimleri Fakültesi" className="bg-[#1a1f2e] text-white font-bold">
                                <option value="Bilgisayar Mühendisliği">Bilgisayar Mühendisliği</option>
                                <option value="Yazılım Mühendisliği">Yazılım Mühendisliği</option>
                                <option value="Elektrik-Elektronik Mühendisliği">Elektrik-Elektronik Mühendisliği</option>
                                <option value="Makine Mühendisliği">Makine Mühendisliği</option>
                                <option value="Mekatronik Mühendisliği">Mekatronik Mühendisliği</option>
                                <option value="İnşaat Mühendisliği">İnşaat Mühendisliği</option>
                                <option value="Endüstri Mühendisliği">Endüstri Mühendisliği</option>
                                <option value="Metalurji ve Malzeme Mühendisliği">Metalurji ve Malzeme Mühendisliği</option>
                                <option value="Petrol ve Doğalgaz Mühendisliği">Petrol ve Doğalgaz Mühendisliği</option>
                                <option value="Biyomedikal Mühendisliği">Biyomedikal Mühendisliği</option>
                            </optgroup>

                            <optgroup label="Havacılık ve Uzay Bilimleri Fakültesi" className="bg-[#1a1f2e] text-white font-bold">
                                <option value="Havacılık ve Uzay Mühendisliği">Havacılık ve Uzay Mühendisliği</option>
                                <option value="Uçak Bakım ve Onarım">Uçak Bakım ve Onarım</option>
                                <option value="Havacılık Yönetimi">Havacılık Yönetimi</option>
                                <option value="Pilotaj">Pilotaj</option>
                            </optgroup>

                            <optgroup label="İşletme ve Yönetim Bilimleri Fakültesi" className="bg-[#1a1f2e] text-white font-bold">
                                <option value="Yönetim Bilişim Sistemleri">Yönetim Bilişim Sistemleri</option>
                                <option value="İşletme">İşletme</option>
                                <option value="Lojistik Yönetimi">Lojistik Yönetimi</option>
                                <option value="Uluslararası Ticaret ve İşletmecilik">Uluslararası Ticaret ve İşletmecilik</option>
                                <option value="Ekonomi">Ekonomi</option>
                            </optgroup>

                            <optgroup label="Mimarlık Fakültesi" className="bg-[#1a1f2e] text-white font-bold">
                                <option value="Mimarlık">Mimarlık</option>
                                <option value="İç Mimarlık">İç Mimarlık</option>
                                <option value="Şehir ve Bölge Planlama">Şehir ve Bölge Planlama</option>
                                <option value="Peyzaj Mimarlığı">Peyzaj Mimarlığı</option>
                            </optgroup>

                            <optgroup label="Meslek Yüksekokulları (Önlisans)" className="bg-[#1a1f2e] text-white font-bold">
                                <option value="Bilgisayar Programcılığı">Bilgisayar Programcılığı</option>
                                <option value="Bilişim Güvenliği Teknolojisi">Bilişim Güvenliği Teknolojisi</option>
                                <option value="İnsansız Hava Aracı Teknolojisi">İnsansız Hava Aracı Teknolojisi</option>
                                <option value="Mekatronik (MYO)">Mekatronik (MYO)</option>
                                <option value="Makine (MYO)">Makine (MYO)</option>
                                <option value="Sualtı Teknolojisi">Sualtı Teknolojisi</option>
                            </optgroup>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:rotate-180 transition-transform" size={20} />
                    </div>
                </div>

                {/* Kurumsal Mail */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kurumsal Mail</label>
                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="iste.edu.tr" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                            required 
                        />
                    </div>
                </div>

                {/* Şifre */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Şifre</label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                            required 
                        />
                    </div>
                </div>

                {/* Kayıt Ol Butonu */}
                <div className="pt-6"> 
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-[0_10px_30_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                                <span>{tableNumber ? 'Masaya Giriş Yap' : 'Kayıt Ol'}</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                      </div>
                  </button>
                </div>

                <div className="h-10 md:h-16"></div>
            </form>

            <div className="mt-4 text-center">
                <p className="text-slate-500 text-sm">
                    Zaten bir hesabın var mı? {' '}
                    <Link to="/login" className="text-white font-bold hover:text-red-500 transition-colors underline-offset-4 underline decoration-red-600/50">Giriş Yap</Link>
                </p>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase">
        İSTE &copy; 2026
      </div>
    </div>
  );
}