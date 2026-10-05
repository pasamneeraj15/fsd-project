import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { User, MapPin, Tractor, Thermometer, Bell, Lock, Check } from 'lucide-react';

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [farmInfo, setFarmInfo] = useState('');
  const [tempUnit, setTempUnit] = useState('C');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setFarmInfo(profile.farm_info || '');
      setTempUnit(profile.temp_unit || 'C');
      setNotifications(profile.notifications_enabled ?? true);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        location,
        farm_info: farmInfo,
        temp_unit: tempUnit,
        notifications_enabled: notifications,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPassword || !newPassword) {
      setPwError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" icon={User}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </Field>
          <Field label="Email" icon={User}>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none"
            />
          </Field>
          <Field label="Location" icon={MapPin}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Punjab, India"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </Field>
          <Field label="Farm Information" icon={Tractor}>
            <input
              type="text"
              value={farmInfo}
              onChange={(e) => setFarmInfo(e.target.value)}
              placeholder="e.g. 5 acres, mixed crops"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </Field>
        </div>

        {/* Preferences */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Thermometer className="h-4 w-4 text-gray-400" /> Preferred Temperature Unit
            </label>
            <div className="flex gap-2">
              {['C', 'F'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setTempUnit(unit)}
                  className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
                    tempUnit === unit ? 'bg-green-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  °{unit}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Bell className="h-4 w-4 text-gray-400" /> Notifications
            </label>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-7 w-12 rounded-full transition-colors ${notifications ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${notifications ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : saved ? <><Check className="h-5 w-5" /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current Password" icon={Lock}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </Field>
          <Field label="New Password" icon={Lock}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </Field>
        </div>
        {pwError && <p className="mt-4 text-sm text-red-600">{pwError}</p>}
        <button
          onClick={handleChangePassword}
          disabled={pwSaving}
          className="mt-5 flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
        >
          {pwSaving ? 'Updating...' : pwSuccess ? <><Check className="h-5 w-5" /> Updated!</> : 'Update Password'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 text-gray-400" /> {label}
      </label>
      {children}
    </div>
  );
}
