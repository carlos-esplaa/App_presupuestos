import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Spinner from '../ui/Spinner';

export default function HeroCard({ budget, loading }) {
  if (loading || !budget) {
    return (
      <Card className="flex items-center justify-center min-h-[160px]">
        <Spinner size={32} />
      </Card>
    );
  }

  const { total_budget, total_spent, remaining, percent_used, days_elapsed } = budget;

  return (
    <Card>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[#8e8e93] text-xs font-medium uppercase tracking-wide">Presupuesto del ciclo</p>
          <p className="text-white font-bold text-4xl mt-1">{total_budget.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <span className="text-[#8e8e93] text-xs mt-1">Día {days_elapsed}</span>
      </div>

      <ProgressBar percent={percent_used} height="h-3" className="my-4" />

      <div className="flex justify-between">
        <div>
          <p className="text-[#8e8e93] text-xs">Gastado</p>
          <p className="text-[#ff453a] font-semibold text-lg">{total_spent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <div className="text-right">
          <p className="text-[#8e8e93] text-xs">Disponible</p>
          <p className="text-[#30d158] font-semibold text-lg">{remaining.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
        <div className="text-right">
          <p className="text-[#8e8e93] text-xs">Usado</p>
          <p className="text-white font-semibold text-lg">{percent_used}%</p>
        </div>
      </div>
    </Card>
  );
}
