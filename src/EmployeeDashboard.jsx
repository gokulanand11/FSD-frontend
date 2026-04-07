import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import Modal from './components/Modal';
import InteractiveCard from './components/InteractiveCard';
import api from './api';

const statusConfig = {
  Pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    border: 'border-red-200' },
};

const typeIcon = { Sick: '🤒', Casual: '☀️', Annual: '✈️', Unpaid: '💼' };

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeaves, setExpandedLeaves] = useState({});
  const [showQuickApply, setShowQuickApply] = useState(false);

  useEffect(() => {
    api.get('/leaves/my').then(res => setLeaves(res.data)).finally(() => setLoading(false));
  }, []);

  const counts = {
    pending:  leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  const stats = [
    { label: 'Leave Balance', value: user?.leaveBalance ?? '—', sub: 'days remaining', gradient: 'from-indigo-500 to-violet-600', icon: '📅' },
    { label: 'Pending',       value: counts.pending,            sub: 'awaiting review', gradient: 'from-amber-400 to-orange-500', icon: '⏳' },
    { label: 'Approved',      value: counts.approved,           sub: 'this year',       gradient: 'from-emerald-400 to-teal-500', icon: '✅' },
    { label: 'Rejected',      value: counts.rejected,           sub: 'this year',       gradient: 'from-rose-400 to-red-500',    icon: '❌' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-indigo-400 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋</p>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm mt-1">Here's your leave overview for today</p>
          </div>
          <Link to="/apply"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-900">
            <span className="text-lg">+</span> Apply for Leave
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Interactive Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-6">
          {stats.map(s => (
            <InteractiveCard
              key={s.label}
              icon={s.icon}
              title={s.label}
              subtitle={`${s.value} ${s.sub}`}
              gradient={s.gradient}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Balance:</span>
                  <span className="font-bold">{user?.leaveBalance ?? 0} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all`}
                    style={{width: `${Math.min((20 - (user?.leaveBalance ?? 20)) / 20 * 100, 100)}%`}}
                  />
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>

        {/* Quick Actions & Balance */}
        <InteractiveCard icon="⚡" title="Quick Actions" subtitle="One-click leave management">
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button className="group flex flex-col items-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition">
              <span className="text-2xl group-hover:scale-110">📤</span>
              <span className="text-xs font-bold text-indigo-700 mt-1">Apply Leave</span>
            </button>
            <button className="group flex flex-col items-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition">
              <span className="text-2xl group-hover:scale-110">📊</span>
              <span className="text-xs font-bold text-emerald-700 mt-1">View History</span>
            </button>
          </div>
        </InteractiveCard>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Recent Leave Requests</h2>
            <Link to="/history" className="text-indigo-600 text-sm font-medium hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 font-medium">No leave requests yet</p>
              <p className="text-gray-400 text-sm mt-1">Apply for your first leave to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaves.slice(0, 5).map(l => {
                const cfg = statusConfig[l.status];
                const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                const isExpanded = expandedLeaves[l._id];
                return (
                  <div key={l._id}>
                    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpandedLeaves(prev => ({...prev, [l._id]: !isExpanded}))}>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0 hover:scale-110 transition">
                        {typeIcon[l.type] || '📋'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-sm">{l.type} Leave</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {l.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{l.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-600">{days} day{days > 1 ? 's' : ''}</p>
                        <p className="text-xs text-gray-400">{new Date(l.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-2 bg-gray-25 border-l-4 border-indigo-200">
                        <div className="text-xs space-y-1">
                          <p><span className="font-semibold">Dates:</span> {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</p>
                          <p><span className="font-semibold">Applied:</span> {new Date(l.createdAt).toLocaleDateString()}</p>
                          {l.comments && <p><span className="font-semibold">Notes:</span> {l.comments}</p>}
                          <button className="text-indigo-600 hover:underline text-xs font-medium mt-1" onClick={() => toast({message: 'Copied details to clipboard!', type: 'info'})}>📋 Copy Details</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
