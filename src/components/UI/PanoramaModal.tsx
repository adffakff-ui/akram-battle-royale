import React from 'react';
import { LucideX, LucideMapPin } from 'lucide-react';

interface PanoramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
}

export const PanoramaModal: React.FC<PanoramaModalProps> = ({ isOpen, onClose, imageSrc, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
        >
          <LucideX className="w-6 h-6" />
        </button>
        
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black border border-white/10">
          <LucideMapPin className="w-5 h-5 text-amber-400" />
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
};
