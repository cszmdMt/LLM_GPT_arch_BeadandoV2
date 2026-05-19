import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSearch, Zap, Sparkles } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-8 shadow-2xl border border-white/10">
        <div className="flex items-center gap-2 mr-4">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            CsizIskola
          </span>
        </div>

        <div className="flex items-center gap-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-blue-600/20 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
            `}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Vezérlőpult</span>
          </NavLink>

          <NavLink 
            to="/analysis" 
            className={({ isActive }) => `
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-purple-600/20 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/30' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
            `}
          >
            <FileSearch className="w-4 h-4" />
            <span className="text-sm font-medium">Intelligens Elemzés</span>
          </NavLink>

          <NavLink 
            to="/quiz" 
            className={({ isActive }) => `
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600/20 text-indigo-400 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)] border border-indigo-500/30' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
            `}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Tanulórendszer</span>
          </NavLink>

          <NavLink 
            to="/learning-methods" 
            className={({ isActive }) => `
              flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-emerald-600/20 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/30' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
            `}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Tanulást segítő módszerek</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
