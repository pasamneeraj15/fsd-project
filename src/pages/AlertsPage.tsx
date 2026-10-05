import { useEffect, useState } from 'react';
import { supabase, type Alert } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Bell, Bug, CloudRain, Droplets, Leaf, Check, X, Filter, Plus } from 'lucide-react';

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  pest: { icon: Bug, color: 'text-red-600', bg: 'bg-red-100' },
  weather: { icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-100' },
  irrigation: { icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  fertilizer: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-100' },
};

const severityConfig: Record<string, string> = {
  high: 'border-red-200 bg-red-50 text-red-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-green-200 bg-green-50 text-green-700',
};

export function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState('weather');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setAlerts(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = filter === 'All' ? alerts : alerts.filter((a) => a.category === filter);

  const markAsRead = async (id: string) => {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const dismiss = async (id: string) => {
    await supabase.from('alerts').delete().eq('id', id);
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        title: newTitle,
        message: newMessage,
        category: newCategory,
        severity: newSeverity,
      })
      .select()
      .single();
    if (data) {
      setAlerts([data as Alert, ...alerts]);
      setShowAddModal(false);
      setNewTitle('');
      setNewMessage('');
      setNewCategory('weather');
      setNewSeverity('medium');
    }
    setSaving(false);
  };

  const categories = ['All', 'pest', 'weather', 'irrigation', 'fertilizer'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">Stay informed about your farm's conditions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <Plus className="h-4 w-4" /> Create Alert
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 shrink-0 text-gray-400" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === cat ? 'bg-green-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading alerts...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16">
          <Bell className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">No alerts to show</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const config = categoryConfig[alert.category] || categoryConfig.pest;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  alert.is_read ? 'border-gray-100' : 'border-green-200 bg-green-50/30'
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${alert.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{alert.title}</h3>
                    {!alert.is_read && <span className="h-2 w-2 rounded-full bg-green-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityConfig[alert.severity] || severityConfig.low}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {!alert.is_read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-100"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Create Alert</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alert Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Aphid outbreak in field 2"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  placeholder="Alert details..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                  >
                    <option value="weather">Weather</option>
                    <option value="pest">Pest</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="fertilizer">Fertilizer</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || saving}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
