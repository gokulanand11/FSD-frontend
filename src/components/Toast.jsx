import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️'
  };

  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-6 z-50 transform translate-x-0 opacity-100 transition-all duration-300 max-w-sm">
      <div className={`bg-white border shadow-2xl rounded-2xl overflow-hidden ${bgColors[type]} text-white p-4 animate-slide-in-right`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icons[type]}</span>
          <p className="font-semibold text-sm leading-tight flex-1">{message}</p>
          <button onClick={() => setVisible(false)} className="text-white/80 hover:text-white p-1 -m-1 rounded-lg hover:bg-white/20 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

