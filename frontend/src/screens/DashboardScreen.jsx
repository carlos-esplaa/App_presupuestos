import { useEffect } from 'react';
import IOSHeader from '../components/layout/IOSHeader';
import HeroCard from '../components/dashboard/HeroCard';
import CategoryGrid from '../components/dashboard/CategoryGrid';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { useApp } from '../context/AppContext';

export default function DashboardScreen() {
  const { state, refreshBudget, refreshTransactions, refreshCategories } = useApp();

  useEffect(() => {
    refreshBudget();
    refreshTransactions({ limit: 50 });
    refreshCategories();
  }, []); // eslint-disable-line

  const subtitle = state.budget?.started_at
    ? `Ciclo desde ${new Date(state.budget.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
    : 'Sin ciclo activo';

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <IOSHeader title="Mi Presupuesto" subtitle={subtitle} />
      <div
        className="flex flex-col gap-5 px-4 pb-28 scroll-ios no-scrollbar overflow-y-auto"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}
      >
        <HeroCard budget={state.budget} loading={state.loading.budget} />
        <CategoryGrid categories={state.categories} />
        <RecentTransactions transactions={state.transactions} loading={state.loading.transactions} />
      </div>
    </div>
  );
}
