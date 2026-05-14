import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useBudget() {
  const { state, refreshBudget } = useApp();
  useEffect(() => { refreshBudget(); }, [refreshBudget]);
  return { budget: state.budget, loading: state.loading.budget, refresh: refreshBudget };
}
