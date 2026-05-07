import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, Lock, User, ChevronDown, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get('table');

  const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // --- DOĞRULAMA KONTROLLERİ ---
    if (!formData.department) { 
      setError("Lütfen bölümünüzü seçiniz."); 
      setIsLoading(false); 
      return; 
    }
    
    // E-posta @ kontrolü
    if (!formData.email.includes('@')) { 
      setError("E-posta adresi '@' işareti içermelidir."); 
      setIsLoading(false); 
      return; 
    }

    // Şifre uzunluk kontrolü
    if (formData.password.length < 4) { 
      setError("Şifreniz en az 4 karakter olmalıdır."); 
      setIsLoading(false); 
      return; 
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          department: formData.department,
          display_name: `${formData.name} ${formData.surname}`.trim()
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || "Kayıt işlemi başarısız oldu.");
      
      toast.success("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz... 🚀");
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Sunucuya bağlanılamadı!" : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans p-4 bg-[#0a0f1d] selection:bg-red-500/30">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '1rem' } }} />
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-10 mix-blend-overlay" alt="Library" />
      </div>

      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold uppercase shadow-lg backdrop-blur-md">
        <ArrowLeft size={16} /> Ana Sayfa
      </Link>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-12 bg-white/5 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Sol Panel: Tanıtım */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#8b1a1a] to-[#5a1010] p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-8 md:space-y-10 text-left">
            <div className="space-y-2">
              <div className="bg-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl w-fit backdrop-blur-sm border border-white/10 mb-4 md:mb-6">
                <img src="/logo.png" className="w-12 h-12 md:w-16 md:h-16 object-contain" alt="İSTE Logo" />
              </div>
              <div className="w-12 md:w-16 h-1.5 bg-red-500 rounded-full mb-4 md:mb-6"></div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">Akıl <br /><span className="text-red-400">Kütüphanesİ</span></h2>
              <p className="text-xs md:text-sm font-bold text-red-200/40 tracking-[0.2em] md:tracking-[0.3em] uppercase pt-2">İskenderun Teknİk Ünİversİtesİ</p>
            </div>
            <div className="w-full h-px bg-white/10"></div>
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white/90">Bilgi <br /> Paylaştıkça <br /> <span className="text-red-300/70 italic">Çoğalır.</span></h1>
              <p className="text-xs md:text-base font-medium text-white/50 leading-relaxed max-w-[260px] md:max-w-xs">Kütüphanenin sessizliğini dijital bir etkileşimle buluşturuyoruz.</p>
            </div>
          </div>
        </div>

        {/* Sağ Panel: Form */}
        <div className="md:col-span-7 bg-[#121826]/40 p-6 md:p-14 flex flex-col justify-center min-h-auto md:min-h-[750px]">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Yeni Hesap Oluştur</h2>
              <p className="text-slate-400 text-xs md:text-sm">Kütüphaneye giriş yapmak için bilgilerinizi girin.</p>
            </div>
            {tableNumber ? (
              <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <span className="text-blue-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest">Masa #{tableNumber}</span>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <AlertTriangle className="text-amber-500" size={14} />
                <span className="text-amber-500 font-bold text-[10px] uppercase">Masa QR Gerekli</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 md:mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Adınız" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all" required />
              </div>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Soyadınız" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all" required />
              </div>
            </div>

            <div className="relative group">
              <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#1a1f2e] border border-white/10 rounded-2xl py-4 px-5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-600/40 cursor-pointer" required>
                <option value="" className="bg-[#1a1f2e]">Bölümünüzü Seçiniz...</option>
                <optgroup label="Mühendislik ve Doğa Bilimleri Fakültesi">
                  <option value="Bilgisayar Mühendisliği">Bilgisayar Mühendisliği</option>
                  <option value="Biyomedikal Mühendisliği">Biyomedikal Mühendisliği</option>
                  <option value="Elektrik-Elektronik Mühendisliği">Elektrik-Elektronik Mühendisliği</option>
                  <option value="Endüstri Mühendisliği">Endüstri Mühendisliği</option>
                  <option value="İnşaat Mühendisliği">İnşaat Mühendisliği</option>
                  <option value="Makine Mühendisliği">Makine Mühendisliği</option>
                  <option value="Mekatronik Mühendisliği">Mekatronik Mühendisliği</option>
                  <option value="Metalurji ve Malzeme Mühendisliği">Metalurji ve Malzeme Mühendisliği</option>
                  <option value="Petrol ve Doğalgaz Mühendisliği">Petrol ve Doğalgaz Mühendisliği</option>
                  <option value="Yazılım Mühendisliği">Yazılım Mühendisliği</option>
                </optgroup>
                <optgroup label="Barbaros Hayrettin Gemi İnşaatı ve Denizcilik Fakültesi">
                  <option value="Deniz Ulaştırma İşletme Mühendisliği">Deniz Ulaştırma İşletme Mühendisliği</option>
                  <option value="Denizcilik İşletmeleri Yönetimi">Denizcilik İşletmeleri Yönetimi</option>
                  <option value="Gemi İnşaatı ve Gemi Makineleri Mühendisliği">Gemi İnşaatı ve Gemi Makineleri Mühendisliği</option>
                </optgroup>
                <optgroup label="Havacılık ve Uzay Bilimleri Fakültesi">
                  <option value="Havacılık Elektrik ve Elektroniği">Havacılık Elektrik ve Elektroniği</option>
                  <option value="Havacılık ve Uzay Mühendisliği">Havacılık ve Uzay Mühendisliği</option>
                  <option value="Havacılık Yönetimi">Havacılık Yönetimi</option>
                  <option value="Pilotaj">Pilotaj</option>
                  <option value="Uçak Bakım ve Onarım">Uçak Bakım ve Onarım</option>
                </optgroup>
                <optgroup label="İşletme ve Yönetim Bilimleri Fakültesi">
                  <option value="Ekonomi">Ekonomi</option>
                  <option value="Lojistik Yönetimi">Lojistik Yönetimi</option>
                  <option value="İşletme">İşletme</option>
                  <option value="Uluslararası Ticaret ve İşletmecilik">Uluslararası Ticaret ve İşletmecilik</option>
                  <option value="Yönetim Bilişim Sistemleri">Yönetim Bilişim Sistemleri</option>
                </optgroup>
                <optgroup label="Mimarlık Fakültesi">
                  <option value="İç Mimarlık">İç Mimarlık</option>
                  <option value="Mimarlık">Mimarlık</option>
                  <option value="Peyzaj Mimarlığı">Peyzaj Mimarlığı</option>
                  <option value="Şehir ve Bölge Planlama">Şehir ve Bölge Planlama</option>
                </optgroup>
                <optgroup label="Turizm Fakültesi">
                  <option value="Gastronomi ve Mutfak Sanatları">Gastronomi ve Mutfak Sanatları</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
            </div>

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="örnek@iste.edu.tr" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all" required />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 md:py-5 rounded-2xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2 mt-2 md:mt-0">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <span>{tableNumber ? 'Masaya Giriş Yap' : 'Kayıt Ol'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-slate-500 text-sm">
              Zaten bir hesabın var mı? <Link to="/login" className="text-white font-bold hover:text-red-500 underline">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 text-slate-600 text-[10px] font-bold tracking-[0.4em] uppercase">İSTE &copy; 2026</div>
    </div>
  );
}