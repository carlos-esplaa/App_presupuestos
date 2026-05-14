const FILTERS = [
  { label: 'Todos', value: null },
  { label: 'Gastos', value: 'expense' },
  { label: 'Ingresos', value: 'income' },
  { label: 'Ahorros', value: 'savings' },
];

export default function FilterBar({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {FILTERS.map(({ label, value }) => (
        <button
          key={label}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${
            active === value
              ? 'bg-[#0a84ff] text-white'
              : 'bg-[#2c2c2e] text-[#8e8e93]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
