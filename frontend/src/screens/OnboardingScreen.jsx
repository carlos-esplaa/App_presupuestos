import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import Spinner from '../components/ui/Spinner';

const STEPS = ['Conectando con el banco…', 'Analizando transacciones…', 'Detectando patrones de gasto…', 'Calculando presupuesto óptimo…'];

export default function OnboardingScreen() {
  const { dispatch } = useApp();
  const [phase, setPhase] = useState('loading'); // loading | results | error
  const [stepIndex, setStepIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i < STEPS.length - 1) return i + 1;
        clearInterval(interval);
        return i;
      });
    }, 900);

    api.getOnboardingAnalysis()
      .then((data) => {
        setTimeout(() => {
          setAnalysis(data);
          setPhase('results');
        }, STEPS.length * 900);
      })
      .catch((e) => {
        setTimeout(() => {
          setError(e.message);
          setPhase('error');
        }, 1200);
      });

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: true });
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6 gap-8">
        <div className="w-20 h-20 rounded-3xl bg-[#0a84ff]/20 flex items-center justify-center">
          <TrendingUp size={40} className="text-[#0a84ff]" />
        </div>
        <div className="text-center">
          <h1 className="text-white font-bold text-2xl mb-2">Analizando tu cuenta</h1>
          <p className="text-[#8e8e93] text-sm">Revisando los últimos 90 días para sugerirte un presupuesto personalizado</p>
        </div>
        <Spinner size={36} />
        <div className="w-full max-w-xs flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i <= stepIndex ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i < stepIndex ? 'bg-[#30d158]' : i === stepIndex ? 'bg-[#0a84ff]' : 'bg-white/20'}`} />
              <span className="text-white text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6 gap-6 text-center">
        <p className="text-[#ff453a] text-sm">{error || 'Error al cargar el análisis'}</p>
        <p className="text-[#8e8e93] text-xs">Puedes continuar sin datos previos</p>
        <button onClick={handleStart} className="bg-[#0a84ff] text-white font-semibold rounded-2xl px-8 py-3.5">
          Empezar de todas formas
        </button>
      </div>
    );
  }

  const { average_salary, suggested_budget, categories, total_transactions } = analysis;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col px-5 pt-16 pb-12 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle size={28} className="text-[#30d158]" />
        <div>
          <h1 className="text-white font-bold text-xl">Análisis completado</h1>
          <p className="text-[#8e8e93] text-xs">{total_transactions} transacciones analizadas</p>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-3xl p-5 mb-5">
        <p className="text-[#8e8e93] text-xs mb-1">Nómina media detectada</p>
        <p className="text-white font-bold text-3xl">{average_salary.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        <p className="text-[#8e8e93] text-xs mt-2">Presupuesto mensual sugerido: <span className="text-[#0a84ff] font-medium">{suggested_budget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></p>
      </div>

      <h2 className="text-white font-semibold text-base mb-3">Límites sugeridos por categoría</h2>
      <div className="flex flex-col gap-3 mb-8">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-[#1c1c1e] rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{cat.name}</p>
              <p className="text-[#8e8e93] text-xs">Media: {cat.average_monthly.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}/mes</p>
            </div>
            <span className="text-[#0a84ff] font-semibold text-sm">
              {cat.suggested_limit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-[#0a84ff] text-white font-semibold rounded-2xl py-4 text-base active:scale-[0.97] transition-transform"
      >
        Empezar a gestionar mi presupuesto
      </button>
    </div>
  );
}
