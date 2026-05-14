import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useCategories() {
  const { state, refreshCategories, addCategory } = useApp();
  useEffect(() => { refreshCategories(); }, [refreshCategories]);
  return {
    categories: state.categories,
    loading: state.loading.categories,
    addCategory,
    refresh: refreshCategories,
  };
}
