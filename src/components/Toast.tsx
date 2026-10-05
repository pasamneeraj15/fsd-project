import { type Toast } from '@/hooks/useToast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info;
        const color = t.type === 'success' ? 'text-green-600' : t.type === 'error' ? 'text-red-600' : 'text-blue-600';
        const border = t.type === 'success' ? 'border-green-200' : t.type === 'error' ? 'border-red-200' : 'border-blue-200';
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border ${border} bg-white px-4 py-3 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 max-w-sm`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <p className="text-sm text-gray-700 flex-1">{t.message}</p>
            <button onClick={() => onClose(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
