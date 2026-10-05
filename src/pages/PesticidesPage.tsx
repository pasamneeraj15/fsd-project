import { useEffect, useState } from 'react';
import { supabase, type Pesticide } from '@/lib/supabase';
import { Search, ArrowLeft, FlaskConical, Info, X, ShieldAlert, Sprout } from 'lucide-react';

const cropOptions = ['Wheat', 'Rice', 'Cotton', 'Tomato', 'Potato', 'Grapes', 'Chili'];

export function PesticidesPage() {
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPesticide, setDetailPesticide] = useState<Pesticide | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pesticides').select('*').order('crop');
      setPesticides(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = pesticides.filter((p) => {
    const matchesCrop = !selectedCrop || p.crop === selectedCrop;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.target_pest.toLowerCase().includes(search.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const heading = selectedCrop ? `Pesticides for ${selectedCrop}` : 'Pesticides for Different Crops';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {selectedCrop && (
          <button
            onClick={() => setSelectedCrop(null)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
          <p className="text-sm text-gray-500">Find pesticides by crop and pest type</p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <strong>Safety Notice:</strong> Always follow the product label, local regulations, and use protective
          equipment. Observe recommended pre-harvest intervals. Dosage values shown are demonstration data —
          verify with authoritative sources before application.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pesticides or pests..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Crop Selection Cards */}
      {!selectedCrop && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Select a Crop</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {cropOptions.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 transition-colors group-hover:bg-green-200">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{crop}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pesticide Table */}
      {selectedCrop && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading pesticides...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No pesticides found for this crop</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-700">Pesticide Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Target Pest</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Dose/acre</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Form</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Pre-Harvest Interval</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 transition-colors hover:bg-green-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.target_pest}</td>
                      <td className="px-4 py-3 text-gray-600">{p.dosage}</td>
                      <td className="px-4 py-3 text-gray-600">{p.form}</td>
                      <td className="px-4 py-3 text-gray-600">{p.pre_harvest_interval}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailPesticide(p)}
                          className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailPesticide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailPesticide(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <FlaskConical className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{detailPesticide.name}</h2>
                  <p className="text-xs text-gray-500">For {detailPesticide.crop}</p>
                </div>
              </div>
              <button onClick={() => setDetailPesticide(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <DetailRow label="Target Pest" value={detailPesticide.target_pest} />
              <DetailRow label="Dosage" value={detailPesticide.dosage} />
              <DetailRow label="Form" value={detailPesticide.form} />
              <DetailRow label="Pre-Harvest Interval" value={detailPesticide.pre_harvest_interval} />
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-700">Safety Information</p>
                <p className="text-sm text-amber-800">{detailPesticide.safety_info}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-50 pb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
