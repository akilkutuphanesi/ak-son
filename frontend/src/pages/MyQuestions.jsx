import React from 'react';
import { ChevronLeft, MessageCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyQuestions() {
  const myQuestions = [
    { id: 1, title: "React Router nasıl kullanılır?", time: "2 saat önce", answers: 3 }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-red-500 mb-8 transition-colors">
          <ChevronLeft size={20} /> Dashboard'a Dön
        </Link>
        <h1 className="text-4xl font-black mb-10">Sorduğum <span className="text-red-500">Sorular</span></h1>

        <div className="space-y-4">
          {myQuestions.map(q => (
            <div key={q.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center hover:bg-white/[0.08] transition-all">
              <div>
                <h3 className="text-lg font-bold mb-1">{q.title}</h3>
                <p className="text-xs text-slate-500">{q.time}</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-sm text-slate-400"><MessageCircle size={16}/> {q.answers}</span>
                <button className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}