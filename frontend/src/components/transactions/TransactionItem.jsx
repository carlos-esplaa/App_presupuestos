import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TYPE_CONFIG = {
  income:  { color: 'text-[#30d158]', bg: 'bg-[#30d158]/15', Icon: ArrowDownLeft,  sign: '+' },
  savings: { color: 'text-[#636bff]', bg: 'bg-[#636bff]/15', Icon: ArrowLeftRight, sign: '' },
  expense: { color: 'text-[#ff453a]', bg: 'bg-[#ff453a]/15', Icon: ArrowUpRight,   sign: '-' },
};

export default function TransactionItem({ transaction, onReclassified }) {
  const { description, amount, booking_date, category_name, category_color, tx_type, id } = transaction;
  const cfg = TYPE_CONFIG[tx_type] || TYPE_CONFIG.expense;
  const { color, bg, Icon, sign } = cfg;
  const abs = Math.abs(amount);

  const { state, reclassifyTransaction } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const userCategories = state.categories.filter((c) => !c.is_system);

  const handleReclassify = async (categoryId) => {
    setLoading(true);
    setShowPicker(false);
    try {
      await reclassifyTransaction(id, categoryId);
      onReclassified?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 py-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{description || '—'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Tap en la categoría para reclasificar */}
            {tx_type === 'expense' ? (
              <button
                onClick={() => setShowPicker((v) => !v)}
                disabled={loading}
                className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full active:opacity-70 transition-opacity"
                style={{
                  backgroundColor: category_color ? `${category_color}25` : '#8e8e9330',
                  color: category_color || '#8e8e93',
                }}
              >
                {category_name || 'Sin categoría'}
                <ChevronDown size={10} />
              </button>
            ) : (
              category_name && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${category_color}25`, color: category_color }}
                >
                  {category_name}
                </span>
              )
            )}
            <span className="text-[#8e8e93] text-xs">{booking_date}</span>
          </div>
        </div>
        <span className={`${color} font-semibold text-sm flex-shrink-0`}>
          {sign}{abs.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>

      {/* Picker de reclasificación */}
      {showPicker && (
        <div className="mx-0 mb-2 bg-[#2c2c2e] rounded-2xl overflow-hidden">
          {userCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleReclassify(cat.id)}
              className="flex items-center gap-3 px-4 py-3 w-full text-left active:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-white text-sm">{cat.name}</span>
              {cat.name === category_name && (
                <span className="ml-auto text-[#0a84ff] text-xs">✓ actual</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
