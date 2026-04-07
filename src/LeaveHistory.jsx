import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import api from './api';

const statusConfig = {
  Pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  Rejected: { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    border: 'border-red-200' },
};

const typeIcon = { Sick: '🤒', Casual: '☀️', Annual: '✈️', Unpaid: '💼' };

const filters = ['All', 'Pending', 'Approved', 'Rejected'];

export default function LeaveHistory() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(true);
  const [selectedLeaves, setSelectedLeaves] = useState(new Set());

  useEffect(() => {
    api.get('/leaves/my').then(res => setLeaves(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

  const counts = filters.reduce((acc, f) => {
    acc[f] = f === 'All' ? leaves.length : leaves.filter(l => l.status === f).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Leave History</h1>
            <p className="text-gray-400 text-sm mt-1">Track all your leave requests and their status</p>
          </div>
          <Link to="/apply"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-900">
            + Apply Leave
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition border ${filter === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
              {f}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-600 font-semibold">No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'All' ? 'Apply for your first leave to get started' : `You have no ${filter.toLowerCase()} requests`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const cfg = statusConfig[l.status];
              const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div key={l._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0">
                    {typeIcon[l.type] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{l.type} Leave</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {l.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{l.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied on {new Date(l.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-gray-800">{days}</p>
                    <p className="text-xs text-gray-400">day{days > 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(l.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} –{' '}
                      {new Date(l.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </p>
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
