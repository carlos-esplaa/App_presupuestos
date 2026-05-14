import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useTransactions(params = {}) {
  const { state, refreshTransactions } = useApp();
  const key = JSON.stringify(params);
  useEffect(() => { refreshTransactions(params); }, [key]); // eslint-disable-line
  return {
    transactions: state.transactions,
    total: state.transactionsTotal,
    loading: state.loading.transactions,
    refresh: () => refreshTransactions(params),
  };
}
