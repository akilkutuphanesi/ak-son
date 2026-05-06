import React from 'react';
import { X } from 'lucide-react';

export default function CameraModal({ 
    isOpen, 
    videoRef, 
    canvasRef, 
    stopCamera, 
    capturePhoto 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-[60vh] object-cover transform scale-x-[-1]"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/50 to-transparent flex justify-between items-center">
                    <button onClick={stopCamera} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all">
                        <X size={24} />
                    </button>
                    <button onClick={capturePhoto} className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-all group">
                        <div className="h-12 w-12 bg-white rounded-full group-hover:bg-red-500 transition-colors"></div>
                    </button>
                    <div className="w-12"></div>
                </div>
            </div>
            <p className="text-slate-400 mt-4 text-sm animate-pulse">Fotoğrafı çekmek için butona bas</p>
        </div>
    );
}
