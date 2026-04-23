import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, MessageCircle, Briefcase, Heart } from 'lucide-react';
import AboutModal from './AboutModal';

const Footer: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  return (
    <footer className="shrink-0 mt-auto border-t border-[#27272a] bg-[#09090b] px-6 py-12 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] overflow-hidden shadow-lg border border-[#27272a]">
                <img src="/app-favicon.png" alt="EduTrack Logo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/favicon.ico' }} />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">EduTrack</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-primary-500 font-medium">
              A premium learning management system designed for modern educators and students. 
              Empowering collaboration through intelligent course design and real-time assessment.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-[#111111] border border-[#27272a] text-primary-500 hover:text-white hover:border-primary-500/50 transition-all">
                <Code2 className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[#111111] border border-[#27272a] text-primary-500 hover:text-white hover:border-primary-500/50 transition-all">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[#111111] border border-[#27272a] text-primary-500 hover:text-white hover:border-primary-500/50 transition-all">
                <Briefcase className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/courses" className="text-sm font-bold text-primary-400 hover:text-white transition-colors">Courses</Link></li>
                <li><a href="#" className="text-sm font-bold text-primary-400 hover:text-white transition-colors">Assessments</a></li>
                <li><a href="#" className="text-sm font-bold text-primary-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">Company</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setIsAboutOpen(true)} className="text-sm font-bold text-primary-400 hover:text-white transition-colors">About Us</button></li>
                <li><a href="#" className="text-sm font-bold text-primary-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm font-bold text-primary-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#27272a] pt-8 md:flex-row">
          <p className="text-xs font-medium text-primary-600">
            © {new Date().getFullYear()} EduTrack LMS. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-primary-600">
            Developed with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the future of education.
          </div>
        </div>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </footer>
  );
};

export default Footer;
