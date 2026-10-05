import { useNavigate } from 'react-router-dom';
import { LeafyGreen, ArrowRight, Compass, Sprout, CloudSun, Leaf } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
            <LeafyGreen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-green-800">AgriSmart</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="rounded-xl px-5 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
              <Sprout className="h-4 w-4" />
              Smart Farming, Better Future
            </div>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Your smart assistant for{' '}
              <span className="text-green-600">healthier crops</span> and higher yields
            </h1>
            <p className="text-lg text-gray-600">
              AgriSmart helps farmers manage crops, monitor weather, find the right pesticides and
              fertilizers, and stay ahead of farm alerts — all in one place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-7 py-3.5 font-semibold text-green-700 transition-all hover:border-green-300 hover:bg-green-50"
              >
                <Compass className="h-5 w-5" />
                Explore
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: Sprout, label: 'Crop Management' },
                { icon: CloudSun, label: 'Weather Tracking' },
                { icon: Leaf, label: 'Pest & Fertilizer' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <f.icon className="h-4 w-4 text-green-600" />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-green-900/10">
              <img
                src="https://images.pexels.com/photos/33786797/pexels-photo-33786797.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Green agricultural field with farmhouse"
                className="h-[420px] w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">7+</p>
                  <p className="text-xs text-gray-500">Crop Types</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <CloudSun className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">5-Day</p>
                  <p className="text-xs text-gray-500">Forecast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white/50 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500 sm:px-12">
          AgriSmart — Smart Farming, Better Future. Demo data shown for illustration.
        </div>
      </footer>
    </div>
  );
}
