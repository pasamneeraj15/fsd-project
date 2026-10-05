import { useEffect, useState } from 'react';
import { supabase, type Crop, type FarmCrop } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Sprout, Plus, Trash2, Eye, X, Droplets, Mountain, Calendar, Bug } from 'lucide-react';

export function CropsPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farmCrops, setFarmCrops] = useState<FarmCrop[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [plantingDate, setPlantingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cropsData }, { data: farmData }] = await Promise.all([
        supabase.from('crops').select('*').order('name'),
        user ? supabase.from('farm_crops').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ]);
      setCrops(cropsData ?? []);
      setFarmCrops(farmData ?? []);
      setLoading(false);
    })();
  }, [user]);

  const categories = ['All', ...Array.from(new Set(crops.map((c) => c.category)))];

  const filtered = crops.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category === category;
    return matchesSearch && matchesCat;
  });

  const isInFarm = (cropId: string) => farmCrops.some((fc) => fc.crop_id === cropId);

  const handleAdd = async () => {
    if (!user || !selectedCrop) return;
    setAdding(true);
    const { data } = await supabase
      .from('farm_crops')
      .insert({
        user_id: user.id,
        crop_id: selectedCrop.id,
        crop_name: selectedCrop.name,
        planting_date: plantingDate || null,
        expected_harvest_date: harvestDate || null,
        status: 'Growing',
        notes,
      })
      .select()
      .single();
    if (data) {
      setFarmCrops([...farmCrops, data as FarmCrop]);
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        activity_type: 'crop_added',
        description: `Added ${selectedCrop.name} to farm`,
      });
    }
    setAdding(false);
    setShowAddModal(false);
    setPlantingDate('');
    setHarvestDate('');
    setNotes('');
  };

  const handleRemove = async (id: string, name: string) => {
    await supabase.from('farm_crops').delete().eq('id', id);
    setFarmCrops(farmCrops.filter((fc) => fc.id !== id));
    if (user) {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        activity_type: 'crop_removed',
        description: `Removed ${name} from farm`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crops</h1>
        <p className="text-sm text-gray-500">Browse crops and manage your farm's plantings</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                category === cat ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* My Farm Crops */}
      {farmCrops.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">My Farm Crops ({farmCrops.length})</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {farmCrops.map((fc) => (
              <div key={fc.id} className="flex shrink-0 items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <Sprout className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{fc.crop_name}</p>
                  <p className="text-xs text-gray-500">{fc.status}</p>
                </div>
                <button
                  onClick={() => handleRemove(fc.id, fc.crop_name)}
                  className="ml-2 rounded-lg p-1.5 text-red-500 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop Cards */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading crops...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No crops found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((crop) => {
            const inFarm = isInFarm(crop.id);
            return (
              <div key={crop.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                {/* Crop Image */}
                <div className="relative h-40 overflow-hidden">
                  {crop.image_url ? (
                    <img
                      src={crop.image_url}
                      alt={crop.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-50">
                      <Sprout className="h-12 w-12 text-green-300" />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                    {crop.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{crop.description}</p>
                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {crop.growing_season}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-gray-400" />
                      {crop.soil_requirements}
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-gray-400" />
                      {crop.water_requirements}
                    </div>
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-gray-400" />
                      {crop.common_pests}
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setSelectedCrop(crop)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" /> Details
                    </button>
                    {inFarm ? (
                      <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-50 py-2 text-sm font-medium text-green-600">
                        <CheckIcon /> In Farm
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCrop(crop);
                          setShowAddModal(true);
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCrop && !showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedCrop(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Image header */}
            {selectedCrop.image_url && (
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img src={selectedCrop.image_url} alt={selectedCrop.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm hover:bg-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedCrop.name}</h2>
                {!selectedCrop.image_url && (
                  <button onClick={() => setSelectedCrop(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{selectedCrop.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="Growing Season" value={selectedCrop.growing_season} icon={Calendar} />
                  <InfoCard label="Soil Requirements" value={selectedCrop.soil_requirements} icon={Mountain} />
                  <InfoCard label="Water Requirements" value={selectedCrop.water_requirements} icon={Droplets} />
                  <InfoCard label="Common Pests" value={selectedCrop.common_pests} icon={Bug} />
                </div>
              </div>
              {!isInFarm(selectedCrop.id) && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                >
                  <Plus className="h-5 w-5" /> Add to My Farm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {selectedCrop && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add {selectedCrop.name}</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Planting Date</label>
                <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected Harvest Date</label>
                <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Optional notes about this planting..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100" />
              </div>
              <button onClick={handleAdd} disabled={adding}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60">
                {adding ? 'Adding...' : 'Add to Farm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-500">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
