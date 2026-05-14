import { useState } from 'react';
import IOSHeader from '../components/layout/IOSHeader';
import FilterBar from '../components/transactions/FilterBar';
import TransactionList from '../components/transactions/TransactionList';
import { useTransactions } from '../hooks/useTransactions';

export default function ExpensesScreen() {
  const [activeFilter, setActiveFilter] = useState(null);
  const { transactions, total, loading } = useTransactions({ limit: 100, type: activeFilter });

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <IOSHeader title="Movimientos" subtitle={`${total} transacciones`} />
      <div
        className="flex flex-col gap-4 px-4 pb-28 scroll-ios no-scrollbar overflow-y-auto"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}
      >
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
        <TransactionList transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}
