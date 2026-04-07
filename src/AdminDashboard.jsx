import { useEffect, useState } from 'react';
import api from './api';

const statusConfig = {
  Pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    border: 'border-red-200' },
};

const typeIcon = { Sick: '🤒', Casual: '☀️', Annual: '✈️', Unpaid: '💼' };

const avatarColor = (name = '') => {
  const colors = ['from-violet-400 to-indigo-500', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500', 'from-cyan-400 to-blue-500'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function AdminDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    api.get('/leaves').then(res => setLeaves(res.data)).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      const { data } = await api.patch(`/leaves/${id}`, { status });
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: data.status } : l));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

  const counts = {
    total:    leaves.length,
    pending:  leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  const stats = [
    { label: 'Total Requests', value: counts.total,    gradient: 'from-indigo-500 to-violet-600', icon: '📋', sub: 'all time' },
    { label: 'Pending Review', value: counts.pending,  gradient: 'from-amber-400 to-orange-500',  icon: '⏳', sub: 'needs action' },
    { label: 'Approved',       value: counts.approved, gradient: 'from-emerald-400 to-teal-500',  icon: '✅', sub: 'processed' },
    { label: 'Rejected',       value: counts.rejected, gradient: 'from-rose-400 to-red-500',      icon: '❌', sub: 'declined' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">ADMIN</span>
          </div>
          <h1 className="text-2xl font-black text-white">Leave Management</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage all employee leave requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.gradient} opacity-10 rounded-bl-full`} />
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-3xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Pending Alert */}
        {counts.pending > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-800 font-bold text-sm">{counts.pending} request{counts.pending > 1 ? 's' : ''} awaiting your review</p>
              <p className="text-amber-600 text-xs mt-0.5">Please review and take action on pending leave requests</p>
            </div>
            <button onClick={() => setFilter('Pending')} className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition">
              View Pending
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border ${filter === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
              {f}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {f === 'All' ? counts.total : counts[f.toLowerCase()]}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-600 font-semibold">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const cfg = statusConfig[l.status];
              const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
              const name = l.userId?.name || 'Unknown';
              return (
                <div key={l._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                      {name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{name}</p>
                        <span className="text-gray-300">·</span>
                        <p className="text-gray-500 text-sm">{l.userId?.email}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {l.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span>{typeIcon[l.type]}</span>
                          <span className="font-medium">{l.type} Leave</span>
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">
                          {new Date(l.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – {new Date(l.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm font-bold text-indigo-600">{days} day{days > 1 ? 's' : ''}</span>
                      </div>

                      <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        💬 {l.reason}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-2">
                      {l.status === 'Pending' ? (
                        <>
                          <button onClick={() => handleAction(l._id, 'Approved')} disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition shadow-sm shadow-emerald-200">
                            {actionLoading === l._id + 'Approved'
                              ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                              : '✓'} Approve
                          </button>
                          <button onClick={() => handleAction(l._id, 'Rejected')} disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition shadow-sm shadow-red-200">
                            {actionLoading === l._id + 'Rejected'
                              ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                              : '✕'} Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl font-medium">
                          Processed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
