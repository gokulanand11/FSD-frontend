import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import Modal from './components/Modal';
import api from './api';

const leaveTypes = [
  { value: 'Casual',  label: 'Casual Leave',  icon: '☀️', desc: 'Personal errands & short breaks' },
  { value: 'Sick',    label: 'Sick Leave',    icon: '🤒', desc: 'Medical & health reasons' },
  { value: 'Annual',  label: 'Annual Leave',  icon: '✈️', desc: 'Planned vacation & travel' },
  { value: 'Unpaid',  label: 'Unpaid Leave',  icon: '💼', desc: 'Extended leave without pay' },
];

export default function ApplyLeave() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ type: 'Casual', startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const days = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  const handlePreview = () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      toast({ message: 'Please fill all fields first', type: 'error' });
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(form.endDate) < new Date(form.startDate))
      return setError('End date must be on or after start date');
    setLoading(true);
    try {
      await api.post('/leaves', form);
      toast({ message: '🎉 Leave application submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/history'), 2000);
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to submit application', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selected = leaveTypes.find(t => t.value === form.type);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-black text-white">Apply for Leave</h1>
          <p className="text-gray-400 text-sm mt-1">Fill in the details below to submit your leave request</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
{showPreview && (
          <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Review Your Application">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.icon}</span>
                  <div>
                    <h3 className="text-lg font-black">{selected.label}</h3>
                    <p className="text-indigo-100">{days} day{days > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">📅 Dates</p>
                  <p className="text-indigo-700 font-mono bg-indigo-50 px-3 py-2 rounded-xl text-sm">
                    {new Date(form.startDate).toLocaleDateString()} → {new Date(form.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">📝 Reason</p>
                  <p className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed max-h-32 overflow-y-auto">
                    {form.reason}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-emerald-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : '🚀 Submit Application'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </Modal>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl mb-6 shadow-sm animate-pulse">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Leave Type Carousel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              Select Leave Type 
              <span className="text-indigo-500 text-sm font-normal">(scroll to browse)</span>
            </h2>
            <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-x snap-mandatory">
              {leaveTypes.map(t => (
                <button 
                  key={t.value} 
                  type="button" 
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex-shrink-0 w-28 p-4 rounded-2xl border-2 snap-center transition-all hover:scale-105 hover:-translate-y-1 ${form.type === t.value ? 'border-indigo-500 bg-indigo-50 shadow-xl shadow-indigo-200 ring-2 ring-indigo-200/50' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg shadow-sm'}`}
                >
                  <span className="text-2xl block mb-2">{t.icon}</span>
                  <p className={`text-xs font-bold ${form.type === t.value ? 'text-indigo-700' : 'text-gray-700'}`}>{t.label}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight line-clamp-2">{t.desc}</p>
                </button>
              ))}
            </div>
            {selected && (
              <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl">
                <p className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                  <span className="text-xl">{selected.icon}</span>
                  Selected: {selected.label}
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Select Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                <input type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                <input type="date" required
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            {days > 0 && (
              <div className="mt-4 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <span className="text-2xl">{selected?.icon}</span>
                <div>
                  <p className="text-sm font-bold text-indigo-700">{days} day{days > 1 ? 's' : ''} of {selected?.label}</p>
                  <p className="text-xs text-indigo-500">{new Date(form.startDate).toDateString()} → {new Date(form.endDate).toDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Reason for Leave</h2>
            <textarea required rows={4}
              placeholder="Briefly describe why you need this leave..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
              value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            <p className="text-xs text-gray-400 mt-2">{form.reason.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={handlePreview}
              disabled={loading || days === 0 || !form.reason}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              👁️ Preview & Submit
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}
              className="px-6 border-2 border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
