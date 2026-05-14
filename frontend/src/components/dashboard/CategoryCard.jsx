import ProgressBar from '../ui/ProgressBar';

export default function CategoryCard({ category }) {
  const { name, color, budget_limit, spent, percent } = category;
  const hasLimit = budget_limit > 0;

  return (
    <div className="bg-[#2c2c2e] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-white text-sm font-medium truncate max-w-[90px]">{name}</span>
        </div>
        <span className="text-[#8e8e93] text-xs">{hasLimit ? `${percent}%` : '—'}</span>
      </div>

      {hasLimit && <ProgressBar percent={percent} height="h-1.5" className="mb-2" />}

      <div>
        <p className="text-white text-sm font-semibold">
          {spent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </p>
        {hasLimit && (
          <p className="text-[#8e8e93] text-xs">
            de {budget_limit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        )}
      </div>
    </div>
  );
}
