/**
 * ThemeToggle.jsx
 * ─────────────────────────────────────────────
 * Dark ↔ Light Mode geçiş butonu.
 *
 * Prop'lar:
 *   size   → 'sm' | 'md' | 'lg'   (varsayılan: 'md')
 *   label  → true | false           (yazı göster/gizle, varsayılan: true)
 *
 * Kullanım:
 *   import ThemeToggle from '../components/ThemeToggle';
 *   <ThemeToggle />
 *   <ThemeToggle size="sm" label={false} />
 */

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ size = 'md', label = true }) {
  const { isLight, toggleLight } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleLight();
    setTimeout(() => setIsAnimating(false), 450);
  };

  const sizes = {
    sm: { button: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg', icon: 14, thumbW: 'w-3 h-3', trackW: 'w-8 h-4' },
    md: { button: 'px-4 py-2   text-sm gap-2   rounded-xl', icon: 16, thumbW: 'w-4 h-4', trackW: 'w-10 h-5' },
    lg: { button: 'px-5 py-2.5 text-base gap-3 rounded-xl', icon: 19, thumbW: 'w-5 h-5', trackW: 'w-12 h-6' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={handleToggle}
      title={isLight ? 'Koyu Moda Geç' : 'Aydınlık Moda Geç'}
      className={`
        group relative flex items-center ${s.button} font-bold
        border transition-all duration-300 overflow-hidden select-none
        ${isLight
          ? 'bg-yellow-400/15 border-yellow-400/40 text-yellow-700 hover:bg-yellow-400/25'
          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
        }
        ${isAnimating ? 'scale-95' : 'scale-100 hover:scale-105'}
        active:scale-95
      `}
    >
      {/* Işık modu arka plan hâlesi */}
      {isLight && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 25% 50%, rgba(250,204,21,0.20) 0%, transparent 70%)',
          }}
        />
      )}

      {/* İkon — dönerek geçiş yapar */}
      <span
        className={`
          relative z-10 transition-transform duration-500
          ${isAnimating ? 'rotate-[30deg]' : ''}
        `}
      >
        {isLight
          ? <Sun  size={s.icon} className="text-yellow-500" />
          : <Moon size={s.icon} />
        }
      </span>

      {/* Etiket */}
      {label && (
        <span className="relative z-10 whitespace-nowrap">
          {isLight ? 'Aydınlık' : 'Koyu Mod'}
        </span>
      )}

      {/* Toggle switch */}
      <span className={`
        relative z-10 ${s.trackW} rounded-full transition-all duration-300 shrink-0
        ${isLight ? 'bg-yellow-400/30' : 'bg-white/10'}
      `}>
        <span
          className={`
            absolute top-0.5 ${s.thumbW} rounded-full transition-all duration-300 shadow-sm
            ${isLight
              ? 'bg-yellow-400 shadow-yellow-400/50'
              : 'bg-slate-500'
            }
          `}
          style={{
            left: isLight ? 'calc(100% - 0.875rem - 2px)' : '2px',
            ...(isLight ? { boxShadow: '0 0 10px rgba(250,204,21,0.7)' } : {}),
          }}
        />
      </span>
    </button>
  );
}

