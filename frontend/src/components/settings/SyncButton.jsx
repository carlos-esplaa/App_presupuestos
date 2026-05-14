import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SyncButton() {
  const { runSync, state } = useApp();
  const [result, setResult] = useState(null);
  const loading = state.loading.sync;

  const handleSync = async () => {
    setResult(null);
    try {
      const r = await runSync();
      setResult({ ok: true, message: `${r.new} nuevos, ${r.duplicate} duplicados` });
    } catch {
      setResult({ ok: false, message: 'Error al sincronizar' });
    }
  };

  return (
    <div className="px-5 py-4">
      <button
        onClick={handleSync}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] font-semibold rounded-2xl py-3 active:scale-[0.97] transition-transform disabled:opacity-50"
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Sincronizando…' : 'Sincronizar ahora'}
      </button>
      {result && (
        <div className={`flex items-center gap-2 mt-3 text-sm ${result.ok ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
          {result.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {result.message}
        </div>
      )}
    </div>
  );
}
