import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, LogIn, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- TEST İÇİN KORSAN KAPI (BACKEND'İ ATLAR) ---
    if (email === 'admin' || email === 'admin@iste.edu.tr') {
      navigate('/admin');
      return; // İşlemi burada kes, aşağıdaki fetch (backend) kodlarına hiç girme
    }

    setIsLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Giriş başarısız.");
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_email', email);
        navigate('/dashboard'); // Normal kullanıcılar buraya düşecek
      } else { 
        throw new Error("Token alınamadı."); 
      }
    } catch (err) { 
      setError(err.message === "Failed to fetch" ? "Sunucuya bağlanılamadı!" : err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans p-4 bg-[#0a0f1d] selection:bg-red-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold uppercase shadow-lg backdrop-blur-md">
        <ArrowLeft size={16} /> Ana Sayfa
      </Link>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-12 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* SOL PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-red-700/90 to-red-950 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-6 text-left">
            <div className="bg-white/10 p-3 rounded-2xl w-fit backdrop-blur-sm border border-white/10 mb-4">
              <img src="/logo.png" className="w-16 h-16 object-contain" alt="İSTE Logo" onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/tr/6/66/%C4%B0skenderun_Teknik_%C3%9Cniversitesi_logo.png" }} />
            </div>
            <div>
              <h1 className="text-6xl font-black tracking-tight leading-[0.9] mb-4">Akıl <br /> <span className="text-red-200">Kütüphanesi</span></h1>
              <div className="w-16 h-1.5 bg-red-400/40 rounded-full mb-4"></div>
              <p className="text-lg font-medium text-red-100/70 tracking-wide uppercase">İskenderun Teknİk Ünİversİtesİ</p>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="md:col-span-7 bg-[#121826]/40 p-8 md:p-14 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                Giriş Yap <LogIn className="text-red-500" size={28} />
              </h2>
              <p className="text-slate-400 text-sm">Kütüphane ağına bağlanmak için bilgilerinizi girin.</p>
            </div>
          </div>

          {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><AlertTriangle size={16} />{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Örn: isim.soyisim@iste.edu.tr veya admin" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-all" required />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* --- ŞİFREMİ UNUTTUM LİNKİ BURADA --- */}
            <div className="flex justify-end px-2">
              <Link to="/forgot-password" className="text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors">
                Şifremi Unuttum
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl transition-all shadow-lg mt-2 disabled:opacity-50 flex justify-center items-center gap-2">
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /><span>Giriş...</span></>
              ) : (
                <><span>Oturum Aç</span><ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Hesabın yok mu? <Link to="/register" className="text-white font-bold hover:text-red-500 underline">Kaydol</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}