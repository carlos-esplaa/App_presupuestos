import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

const TYPE_CONFIG = {
  income: { color: 'text-[#30d158]', bg: 'bg-[#30d158]/15', Icon: ArrowDownLeft, sign: '+' },
  savings: { color: 'text-[#636bff]', bg: 'bg-[#636bff]/15', Icon: ArrowLeftRight, sign: '' },
  expense: { color: 'text-[#ff453a]', bg: 'bg-[#ff453a]/15', Icon: ArrowUpRight, sign: '-' },
};

export default function TransactionItem({ transaction }) {
  const { description, amount, booking_date, category_name, category_color, tx_type } = transaction;
  const cfg = TYPE_CONFIG[tx_type] || TYPE_CONFIG.expense;
  const { color, bg, Icon, sign } = cfg;
  const abs = Math.abs(amount);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{description || '—'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {category_name && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${category_color}25`, color: category_color }}
            >
              {category_name}
            </span>
          )}
          <span className="text-[#8e8e93] text-xs">{booking_date}</span>
        </div>
      </div>
      <span className={`${color} font-semibold text-sm flex-shrink-0`}>
        {sign}{abs.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
      </span>
    </div>
  );
}
