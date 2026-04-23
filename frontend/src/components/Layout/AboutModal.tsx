import React, { useEffect } from 'react';
import { X, Code2, Globe, Calendar } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const teamMembers = [
  { name: 'Satyam Kumar', github: 'https://github.com/Satyamkumar2610' },
  { name: 'Mausam Kumar Dwivedi', github: 'https://github.com/mausam-005' },
  { name: 'Kavya Saraswat', github: 'https://github.com/KavyaSaraswat23' },
  { name: 'Rachit Singh', github: 'https://github.com/rachiittt' },
  { name: 'Himank Kaushik', github: 'https://github.com/Nobody-KnowsBetter' },
];

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#27272a] bg-[#09090b] shadow-2xl animate-command-enter">
        {/* Header */}
        <div className="relative border-b border-[#27272a] p-6 bg-[#111111]/50">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-xl text-primary-400 hover:text-white hover:bg-[#27272a] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] overflow-hidden shadow-lg border border-[#27272a]">
              <img src="/app-favicon.png" alt="EduTrack Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/favicon.ico' }} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">EduTrack</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500">Learning Portal</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Company Details */}
          <div className="space-y-4">
            <p className="text-sm text-primary-300 leading-relaxed">
              EduTrack is a next-generation Learning Management System designed to empower students and educators with intelligent course tracking and seamless assessments.
            </p>
            <div className="pt-2">
              <a href="#" className="inline-flex items-center gap-3 p-3 rounded-xl border border-[#27272a] bg-[#111111] hover:border-primary-500/30 transition-colors group">
                <Globe className="h-4 w-4 text-primary-500 group-hover:text-primary-400" />
                <span className="text-xs font-semibold text-primary-200">Homepage</span>
              </a>
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-primary-500 font-medium">
              <Calendar className="h-4 w-4" />
              <span>Since 2026</span>
            </div>
          </div>

          {/* Project Members */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">Project Creators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 rounded-xl border border-[#27272a] bg-[#111111]/50 hover:bg-[#111111] transition-colors">
                  <span className="text-sm font-semibold text-primary-200">{member.name}</span>
                  <a 
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#27272a]/50 text-primary-400 hover:text-white hover:bg-[#27272a] transition-all"
                    title={`GitHub: ${member.name}`}
                  >
                    <Code2 className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
