import TransactionItem from './TransactionItem';
import Spinner from '../ui/Spinner';

export default function TransactionList({ transactions, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={32} />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8e8e93]">Sin movimientos</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1e] rounded-3xl divide-y divide-white/5 px-5">
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
