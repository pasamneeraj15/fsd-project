import { useEffect, useState } from 'react';
import { supabase, type Fertilizer, type FertilizerPlan } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Search, Leaf, Plus, Trash2, Info, X, Lightbulb } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Organic: 'bg-green-100 text-green-700',
  Inorganic: 'bg-blue-100 text-blue-700',
  Biofertilizer: 'bg-amber-100 text-amber-700',
};

const cropOptions = ['All', 'Wheat', 'Rice', 'Cotton', 'Tomato', 'Potato', 'Grapes', 'Chili'];

export function FertilizersPage() {
  const { user } = useAuth();
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [plans, setPlans] = useState<FertilizerPlan[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [loading, setLoading] = useState(true);
  const [detailFert, setDetailFert] = useState<Fertilizer | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: fertData }, { data: planData }] = await Promise.all([
        supabase.from('fertilizers').select('*').order('name'),
        user ? supabase.from('fertilizer_plans').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ]);
      setFertilizers(fertData ?? []);
      setPlans(planData ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = fertilizers.filter((f) => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || f.category === category;
    const matchesCrop = selectedCrop === 'All' || f.suitable_crops?.includes(selectedCrop);
    return matchesSearch && matchesCat && matchesCrop;
  });

  const isInPlan = (fertilizerId: string) => plans.some((p) => p.fertilizer_id === fertilizerId);

  const handleAdd = async (fert: Fertilizer) => {
    if (!user) return;
    const { data } = await supabase
      .from('fertilizer_plans')
      .insert({
        user_id: user.id,
        fertilizer_id: fert.id,
        fertilizer_name: fert.name,
        crop_name: selectedCrop === 'All' ? '' : selectedCrop,
      })
      .select()
      .single();
    if (data) {
      setPlans([...plans, data as FertilizerPlan]);
      setToast(`${fert.name} added to your plan`);
      setTimeout(() => setToast(''), 3000);
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        activity_type: 'fertilizer_added',
        description: `Added ${fert.name} to fertilizer plan`,
      });
    }
  };

  const handleRemove = async (id: string, name: string) => {
    await supabase.from('fertilizer_plans').delete().eq('id', id);
    setPlans(plans.filter((p) => p.id !== id));
    setToast(`${name} removed from your plan`);
    setTimeout(() => setToast(''), 3000);
  };

  const heading = selectedCrop === 'All' ? 'Fertilizers' : `Fertilizers for ${selectedCrop}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <p className="text-sm text-gray-500">Browse fertilizers and build your application plan</p>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Apply fertilizers based on soil test results and crop growth stage. Dosage
          values shown are demonstration data — consult a local agronomist for field-specific recommendations.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fertilizers..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Organic', 'Inorganic', 'Biofertilizer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                category === cat ? 'bg-green-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {cropOptions.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCrop === crop ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* My Plan */}
      {plans.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">My Fertilizer Plan ({plans.length})</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {plans.map((p) => (
              <div key={p.id} className="flex shrink-0 items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <Leaf className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.fertilizer_name}</p>
                  <p className="text-xs text-gray-500">{p.crop_name || 'General'}</p>
                </div>
                <button onClick={() => handleRemove(p.id, p.fertilizer_name)} className="ml-2 rounded-lg p-1.5 text-red-500 hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fertilizer Cards */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading fertilizers...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No fertilizers found</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fert) => {
            const inPlan = isInPlan(fert.id);
            return (
              <div key={fert.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                {/* Fertilizer Image */}
                <div className="relative h-36 overflow-hidden">
                  {fert.image_url ? (
                    <img
                      src={fert.image_url}
                      alt={fert.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${categoryColors[fert.category] || 'bg-gray-100'}`}>
                      <Leaf className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                    {fert.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-gray-900">{fert.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{fert.description}</p>
                  <div className="mt-3 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Recommended Dosage</p>
                    <p className="text-sm text-gray-900">{fert.dosage}</p>
                  </div>
                  {fert.suitable_crops && fert.suitable_crops.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {fert.suitable_crops.map((c) => (
                        <span key={c} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">{c}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setDetailFert(fert)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Info className="h-4 w-4" /> Details
                    </button>
                    {inPlan ? (
                      <span className="flex flex-1 items-center justify-center rounded-xl bg-green-50 py-2 text-sm font-medium text-green-600">
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(fert)}
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
      {detailFert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailFert(null)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Image header */}
            {detailFert.image_url && (
              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                <img src={detailFert.image_url} alt={detailFert.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => setDetailFert(null)}
                  className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 text-gray-600 shadow-sm hover:bg-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${categoryColors[detailFert.category] || 'bg-gray-100'}`}>
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{detailFert.name}</h2>
                    <p className="text-xs text-gray-500">{detailFert.category}</p>
                  </div>
                </div>
                {!detailFert.image_url && (
                  <button onClick={() => setDetailFert(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{detailFert.description}</p>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500">Recommended Dosage</p>
                  <p className="text-sm text-gray-900">{detailFert.dosage}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">Suitable Crops</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailFert.suitable_crops?.map((c) => (
                      <span key={c} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-lg">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
            <Leaf className="h-3 w-3 text-green-600" />
          </div>
          <p className="text-sm text-gray-700">{toast}</p>
        </div>
      )}
    </div>
  );
}
