import { useState } from 'react';

export default function InteractiveCard({ icon, title, subtitle, children, expanded = false, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-indigo-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${isHovered ? 'shadow-indigo-200' : ''}`}>
          {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm font-semibold text-gray-700 mb-4">{subtitle}</p>
        {children && (
          <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-4 border-t border-gray-100">{children}</div>
          </div>
        )}
        {children && (
          <button 
            onClick={onToggle}
            className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1.5 transition"
          >
            {expanded ? '− Collapse' : 'Expand details'} →
          </button>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

