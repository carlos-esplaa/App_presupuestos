import TransactionItem from '../transactions/TransactionItem';
import { useApp } from '../../context/AppContext';

export default function RecentTransactions({ transactions, loading }) {
  const { dispatch } = useApp();

  if (loading) return null;
  if (!transactions.length) {
    return (
      <div className="bg-[#1c1c1e] rounded-3xl p-5">
        <h2 className="text-white font-semibold text-base mb-3">Últimos movimientos</h2>
        <p className="text-[#8e8e93] text-sm text-center py-4">Sin movimientos registrados</p>
      </div>
    );
  }

  const recent = transactions.slice(0, 8);

  return (
    <div className="bg-[#1c1c1e] rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-base">Últimos movimientos</h2>
        <button
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'expenses' })}
          className="text-[#0a84ff] text-sm"
        >
          Ver todos
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {recent.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}
