import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Sprout,
  Bell,
  CheckSquare,
  FileText,
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Bug,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export function HomePage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ crops: 0, alerts: 0, tasks: 0 });
  const [recentAlerts, setRecentAlerts] = useState<{ id: string; title: string; category: string; severity: string; created_at: string }[]>([]);
  const [activities, setActivities] = useState<{ id: string; activity_type: string; description: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [cropsRes, alertsRes, activitiesRes] = await Promise.all([
        supabase.from('farm_crops').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('alerts').select('id, title, category, severity, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
        supabase.from('farm_activities').select('id, activity_type, description, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        crops: cropsRes.count ?? 0,
        alerts: alertsRes.data?.length ?? 0,
        tasks: 5,
      });
      setRecentAlerts(alertsRes.data ?? []);
      setActivities(activitiesRes.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning!';
    if (h < 17) return 'Good afternoon!';
    return 'Good evening!';
  })();

  const summaryCards = [
    { label: 'Crops', value: stats.crops, icon: Sprout, color: 'green', action: () => navigate('/dashboard/crops') },
    { label: 'Monitoring', value: `${stats.alerts} Alerts`, icon: Bell, color: 'amber', action: () => navigate('/dashboard/alerts') },
    { label: 'Tasks', value: `${stats.tasks} Pending`, icon: CheckSquare, color: 'blue', action: () => navigate('/dashboard/crops') },
    { label: 'Reports', value: 'View', icon: FileText, color: 'purple', action: () => navigate('/dashboard/crops') },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {profile?.full_name?.split(' ')[0] || 'Farmer'}!</h1>
        <p className="text-sm text-gray-500">{greeting} Here's what's happening on your farm today.</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="h-4 w-4" />
          {today}
        </div>
      </div>

      {/* Weather Summary */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <CloudSun className="h-9 w-9 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Weather</p>
              <p className="text-3xl font-bold text-gray-900">28°C</p>
              <p className="text-sm text-gray-500">Partly Cloudy</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <Droplets className="mx-auto mb-1 h-5 w-5 text-blue-500" />
              <p className="text-lg font-semibold text-gray-900">65%</p>
              <p className="text-xs text-gray-400">Humidity</p>
            </div>
            <div className="text-center">
              <Wind className="mx-auto mb-1 h-5 w-5 text-gray-500" />
              <p className="text-lg font-semibold text-gray-900">12 km/h</p>
              <p className="text-xs text-gray-400">Wind</p>
            </div>
            <div className="text-center">
              <CloudRain className="mx-auto mb-1 h-5 w-5 text-blue-400" />
              <p className="text-lg font-semibold text-gray-900">20%</p>
              <p className="text-xs text-gray-400">Rain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Overview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">My Farm Overview</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const c = colorMap[card.color];
            return (
              <button
                key={card.label}
                onClick={card.action}
                className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
                  <Icon className={`h-6 w-6 ${c.text}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recommended for You</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Irrigation Advisory</h3>
            </div>
            <p className="text-sm text-gray-600">
              Low rainfall expected this week. Consider irrigating wheat and tomato fields. Soil moisture
              levels are below optimal for the past 3 days.
            </p>
            <button
              onClick={() => navigate('/dashboard/weather')}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Weather <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Bug className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Pest Alert</h3>
            </div>
            <p className="text-sm text-gray-600">
              Aphid activity detected in nearby farms. Monitor cotton and chili crops closely. Consider
              preventive application of neem oil or recommended insecticides.
            </p>
            <button
              onClick={() => navigate('/dashboard/pesticides')}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View Pesticides <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
            <button onClick={() => navigate('/dashboard/alerts')} className="text-sm text-green-600 hover:text-green-700">
              View all
            </button>
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
          ) : recentAlerts.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No alerts yet</div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-amber-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Sprout className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{act.description}</p>
                    <p className="text-xs text-gray-400">{new Date(act.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
