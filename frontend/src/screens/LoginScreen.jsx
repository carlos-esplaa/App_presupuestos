import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { api, setToken } from '../api/client';

export default function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Introduce usuario y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login(form.username, form.password);
      setToken(data.access_token);
      onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6 gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-[#0a84ff]/20 flex items-center justify-center">
          <TrendingUp size={40} className="text-[#0a84ff]" />
        </div>
        <h1 className="text-white font-bold text-2xl">Presupuesto Personal</h1>
        <p className="text-[#8e8e93] text-sm text-center">Accede para ver tus finanzas</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label className="text-[#8e8e93] text-xs font-medium block mb-1.5">Usuario</label>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            onKeyDown={handleKey}
            placeholder="admin"
            autoCapitalize="none"
            autoComplete="username"
            className="w-full bg-[#1c1c1e] text-white rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-[#0a84ff] transition-colors"
          />
        </div>

        <div>
          <label className="text-[#8e8e93] text-xs font-medium block mb-1.5">Contraseña</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            onKeyDown={handleKey}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full bg-[#1c1c1e] text-white rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-[#0a84ff] transition-colors"
          />
        </div>

        {error && (
          <p className="text-[#ff453a] text-xs text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#0a84ff] text-white font-semibold rounded-2xl py-4 text-base active:scale-[0.97] transition-transform disabled:opacity-50 mt-2"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
