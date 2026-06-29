import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { api, clearToken } from '../api/client';

const AppContext = createContext(null);

const initialState = {
  authenticated: !!localStorage.getItem('auth_token'),
  onboardingComplete: false,
  activeTab: 'home',
  budget: null,
  transactions: [],
  transactionsTotal: 0,
  categories: [],
  loading: { budget: false, transactions: false, categories: false, sync: false },
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return { ...state, authenticated: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload.items, transactionsTotal: action.payload.total };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Escuchar el evento de logout automático cuando el token expira
  useEffect(() => {
    const handler = () => {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
  }, []);

  const refreshBudget = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { budget: true } });
    try {
      const data = await api.getBudget();
      dispatch({ type: 'SET_BUDGET', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { budget: false } });
    }
  }, []);

  const refreshTransactions = useCallback(async (params) => {
    dispatch({ type: 'SET_LOADING', payload: { transactions: true } });
    try {
      const data = await api.getTransactions(params);
      dispatch({ type: 'SET_TRANSACTIONS', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { transactions: false } });
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { categories: true } });
    try {
      const data = await api.getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { categories: false } });
    }
  }, []);

  const runSync = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { sync: true } });
    try {
      const result = await api.sync();
      await Promise.all([refreshBudget(), refreshTransactions({ limit: 50 }), refreshCategories()]);
      return result;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      throw e;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { sync: false } });
    }
  }, [refreshBudget, refreshTransactions, refreshCategories]);

  const addCategory = useCallback(async (body) => {
    const cat = await api.createCategory(body);
    await refreshCategories();
    return cat;
  }, [refreshCategories]);

  const editCategory = useCallback(async (id, body) => {
    const cat = await api.updateCategory(id, body);
    await refreshCategories();
    return cat;
  }, [refreshCategories]);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    await refreshCategories();
  }, [refreshCategories]);

  const reclassifyTransaction = useCallback(async (txId, categoryId) => {
    const tx = await api.patchTransaction(txId, { category_id: categoryId });
    await refreshBudget();
    return tx;
  }, [refreshBudget]);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      logout,
      refreshBudget, refreshTransactions, refreshCategories,
      runSync, addCategory, editCategory, removeCategory, reclassifyTransaction,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
