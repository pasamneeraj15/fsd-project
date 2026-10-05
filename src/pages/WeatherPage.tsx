import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  MapPin,
  Search,
  AlertCircle,
  Cloud,
  Loader2,
  Plus,
  X,
  Bell,
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type WeatherData = {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind_speed: number;
    rain_chance: number;
    uv_index: number;
    location: string;
    is_demo: boolean;
  };
  forecast: { day: string; temp_max: number; temp_min: number; condition: string }[];
  advisory: string;
  is_demo: boolean;
};

const conditionIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('cloud')) return Cloud;
  return Sun;
};

const demoWeatherResponse = (locationName: string): WeatherData => ({
  current: {
    temp: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind_speed: 12,
    rain_chance: 20,
    uv_index: 6,
    location: locationName || 'Demo Location',
    is_demo: true,
  },
  forecast: [
    { day: 'Mon', temp_max: 30, temp_min: 22, condition: 'Sunny' },
    { day: 'Tue', temp_max: 31, temp_min: 23, condition: 'Partly Cloudy' },
    { day: 'Wed', temp_max: 29, temp_min: 21, condition: 'Light Rain' },
    { day: 'Thu', temp_max: 28, temp_min: 20, condition: 'Rain' },
    { day: 'Fri', temp_max: 30, temp_min: 22, condition: 'Sunny' },
  ],
  advisory: 'Showing demo weather data because the weather API is not configured yet. Adjust irrigation and crop protection schedules based on local conditions.',
  is_demo: true,
});

export function WeatherPage() {
  const { profile, user } = useAuth();
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertCategory, setAlertCategory] = useState('weather');
  const [alertSeverity, setAlertSeverity] = useState('medium');
  const [alertSaved, setAlertSaved] = useState(false);

  const fetchWeather = useCallback(async (loc: string) => {
    if (!loc.trim()) {
      setError('Please enter a location.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
        setWeather(demoWeatherResponse(loc));
        return;
      }

      const apiUrl = `${supabaseUrl}/functions/v1/weather?location=${encodeURIComponent(loc)}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }
      const data: WeatherData = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch weather for user's saved location on page load
  useEffect(() => {
    if (profile?.location) {
      setLocation(profile.location);
      fetchWeather(profile.location);
    }
  }, [profile, fetchWeather]);

  const handleCreateAlert = async () => {
    if (!user || !alertTitle.trim()) return;
    const { data } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        title: alertTitle,
        message: alertMessage,
        category: alertCategory,
        severity: alertSeverity,
      })
      .select()
      .single();
    if (data) {
      setAlertSaved(true);
      setTimeout(() => {
        setAlertSaved(false);
        setShowAlertModal(false);
        setAlertTitle('');
        setAlertMessage('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather</h1>
          <p className="text-sm text-gray-500">Check current conditions and 5-day forecast for your farm</p>
        </div>
        <button
          onClick={() => setShowAlertModal(true)}
          className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
        >
          <Plus className="h-4 w-4" /> Create Alert
        </button>
      </div>

      {/* Location Selector */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(location)}
            placeholder="Enter city or location name..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <button
          onClick={() => fetchWeather(location)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {weather && (
        <>
          {/* Demo banner */}
          {weather.is_demo && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Showing demonstration data. Connect an OpenWeatherMap API key for live weather.
            </div>
          )}

          {/* Current Weather */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
                  <CloudSun className="h-12 w-12 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-500">{weather.current.location}</p>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{weather.current.temp}°C</p>
                  <p className="text-base text-gray-600">{weather.current.condition}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <WeatherStat icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} color="text-blue-500" />
                <WeatherStat icon={Wind} label="Wind" value={`${weather.current.wind_speed} km/h`} color="text-gray-500" />
                <WeatherStat icon={CloudRain} label="Rain" value={`${weather.current.rain_chance}%`} color="text-blue-400" />
                <WeatherStat icon={Sun} label="UV Index" value={`${weather.current.uv_index}`} color="text-orange-500" />
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">5-Day Forecast</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {weather.forecast.map((day, i) => {
                const Icon = conditionIcon(day.condition);
                return (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:shadow-md">
                    <p className="text-sm font-semibold text-gray-700">{day.day}</p>
                    <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                      <Icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500">{day.condition}</p>
                    <div className="mt-2 flex justify-center gap-2 text-sm">
                      <span className="font-bold text-gray-900">{day.temp_max}°</span>
                      <span className="text-gray-400">{day.temp_min}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advisory */}
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
              <CloudSun className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Weather Advisory</h3>
              <p className="mt-1 text-sm text-gray-600">{weather.advisory}</p>
            </div>
          </div>
        </>
      )}

      {!weather && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16">
          <CloudSun className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">
            {profile?.location ? 'Loading weather for your location...' : 'Enter a location to view weather information'}
          </p>
        </div>
      )}

      {/* Create Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Create Alert</h2>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Alert Title</label>
                <input
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. Heavy rain expected"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  rows={3}
                  placeholder="Alert details..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={alertCategory}
                    onChange={(e) => setAlertCategory(e.target.value)}
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
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateAlert}
                disabled={!alertTitle.trim() || alertSaved}
                className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
              >
                {alertSaved ? 'Alert Created!' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeatherStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <Icon className={`mx-auto mb-1 h-5 w-5 ${color}`} />
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
